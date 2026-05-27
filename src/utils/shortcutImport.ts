import type { Category, Transaction } from '../types';
import { supabase } from '../lib/supabaseClient';
import { billsRepo } from './billsRepo';
import { getOrCreateDeviceId } from './deviceId';

export type ShortcutImportDraftRow = {
  rowKey: string;
  amount: number;
  shop: string;
  category: Category;
};

const DEFAULT_ACCOUNT_ID = 'ac-1';
const DEVICE_ID_STORAGE_KEY = 'device_id';

const VALID_CATEGORIES: Category[] = ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '收入', '其他'];

const AMOUNT_GLOBAL_RE =
  /(?:￥|¥|\$|RMB|CNY)\s*(-?\d{1,6}(?:,\d{3})*(?:\.\d{2})?)|(-?\d{1,6}(?:,\d{3})*\.\d{2})\s*元|(?<![\d/.-])(\d{1,6}(?:,\d{3})*\.\d{2})(?!\d)/g;

const AMOUNT_LABEL_RE =
  /(?:金额|实付|实付金额|支付金额|合计|总计|应付)[:：\s]*(?:￥|¥|\$)?\s*(-?\d+(?:\.\d{1,2})?)/gi;

const MERCHANT_LABEL_RE =
  /(?:商户名称|商户|商品名称|商品|收款方|交易对方|对方|门店|店铺)[:：\s]*(.+)/i;
const PAY_TO_RE = /(?:付款给|支付给|向)\s*(.+?)(?:\s*付款|\s*支付|$)/i;
const INLINE_ROW_RE = /^(.{2,24}?)\s+[-－]?\s*(?:￥|¥|\$)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/;

const SKIP_MERCHANT_RE =
  /支付成功|交易成功|账单详情|零钱|余额|转账|收款|信用卡|储蓄卡|^\d{4}[-/年]/;

function decodeParam(raw: string): string {
  let text = raw.replace(/\+/g, ' ');
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(text);
      if (next === text) break;
      text = next;
    } catch {
      break;
    }
  }
  return text.replace(/\u00a0/g, ' ').trim();
}

function parseAmountStr(raw: string): number {
  const n = parseFloat(String(raw).replace(/,/g, ''));
  if (!Number.isFinite(n)) return 0;
  const abs = Math.abs(n);
  if (abs < 0.01 || abs > 999_999) return 0;
  return Math.round(abs * 100) / 100;
}

function normalizeCategory(raw: string): Category {
  const decoded = decodeParam(raw);
  if ((VALID_CATEGORIES as string[]).includes(decoded)) return decoded as Category;
  return '其他';
}

/** 快捷指令：amount 参数承载 URL 编码后的整段账单纯文本 */
const BILL_AMOUNT_RE = /(?:￥|¥|\$)\s*(\d+(?:\.\d{2})?)/g;

type MenuBillImportPayload = {
  category: Category;
  billText: string;
  note?: string;
};

/** ?action=import&type=分类名&amount=URL编码后的账单纯文本 */
function readMenuBillImportFromUrl(): MenuBillImportPayload | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') !== 'import') return null;

  const amountRaw = params.get('amount');
  const typeRaw = params.get('type');
  if (!amountRaw || !typeRaw) return null;

  const billText = decodeParam(amountRaw);
  if (!billText) return null;

  const category = normalizeCategory(typeRaw);
  const noteRaw = params.get('shop') || params.get('note');
  const note = noteRaw ? decodeParam(noteRaw) : '快捷指令';

  return { category, billText, note };
}

/** 从解码后的账单文本中提取所有货币金额 */
function extractAmountsFromBillText(text: string): number[] {
  const amounts: number[] = [];
  const re = new RegExp(BILL_AMOUNT_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const n = parseFloat(match[1]);
    if (!Number.isFinite(n) || n <= 0 || n > 999_999) continue;
    amounts.push(Math.round(n * 100) / 100);
  }
  return amounts;
}

function buildTransactionsFromMenuBill(payload: MenuBillImportPayload): Transaction[] {
  const amounts = extractAmountsFromBillText(payload.billText);
  const txType = payload.category === '收入' ? ('income' as const) : ('expense' as const);
  return amounts.map((amount) => ({
    id: crypto.randomUUID(),
    amount,
    type: txType,
    category: payload.category,
    date: new Date().toISOString(),
    note: payload.note,
    accountId: DEFAULT_ACCOUNT_ID,
    mood: 'happy' as const,
  }));
}

function readImportOcrFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') !== 'import') return null;
  const ocrRaw = params.get('ocrData');
  if (!ocrRaw) return null;
  return decodeParam(ocrRaw);
}

function redirectImportResult(status: 'success' | 'error', count: number, message?: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('action');
  url.searchParams.delete('ocrData');
  url.searchParams.delete('type');
  url.searchParams.delete('amount');
  url.searchParams.delete('shop');
  url.searchParams.delete('note');
  url.searchParams.set('importStatus', status);
  url.searchParams.set('count', String(count));
  if (message) url.searchParams.set('message', message);
  else url.searchParams.delete('message');
  window.location.replace(`${url.pathname}${url.search}${url.hash}`);
}

function persistTransactionsLocally(newTxs: Transaction[]): void {
  const savedTx = localStorage.getItem('transactions');
  const transactions: Transaction[] = savedTx ? JSON.parse(savedTx) : [];
  localStorage.setItem('transactions', JSON.stringify([...newTxs, ...transactions]));

  const balanceDelta = newTxs.reduce((sum, tx) => {
    return sum + (tx.type === 'expense' ? -tx.amount : tx.amount);
  }, 0);

  const savedAcc = localStorage.getItem('accounts');
  if (!savedAcc) return;
  const accounts = JSON.parse(savedAcc) as Array<{ id: string; balance: number }>;
  const nextAcc = accounts.map((acc) =>
    acc.id === DEFAULT_ACCOUNT_ID ? { ...acc, balance: acc.balance + balanceDelta } : acc
  );
  localStorage.setItem('accounts', JSON.stringify(nextAcc));
}

function toDraftRows(bills: Array<{ amount: number; shop: string; category?: Category }>): ShortcutImportDraftRow[] {
  const seen = new Set<string>();
  const rows: ShortcutImportDraftRow[] = [];
  bills.forEach((bill, index) => {
    if (bill.amount <= 0) return;
    const key = `${bill.amount}|${bill.shop}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      rowKey: `shortcut-${index}-${Date.now()}`,
      amount: bill.amount,
      shop: bill.shop,
      category: bill.category || '其他',
    });
  });
  return rows;
}

function extractLabeledAmounts(text: string): Array<{ amount: number; shop: string }> {
  const bills: Array<{ amount: number; shop: string }> = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    AMOUNT_LABEL_RE.lastIndex = 0;
    const m = AMOUNT_LABEL_RE.exec(line);
    if (!m) continue;
    const amount = parseAmountStr(m[1]);
    if (amount <= 0) continue;

    let shop = '';
    const merchantOnLine = line.match(MERCHANT_LABEL_RE);
    if (merchantOnLine) shop = merchantOnLine[1].trim();
    bills.push({ amount, shop });
  }

  return bills;
}

/** 从 OCR 纯文本中用正则提取多笔 { amount, shop } */
export function parseBillsFromOcrText(raw: string): ShortcutImportDraftRow[] {
  const text = raw.replace(/\u00a0/g, ' ').trim();
  if (!text) return [];

  const labeled = extractLabeledAmounts(text);
  if (labeled.length > 0) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let lastShop = '';
    for (const line of lines) {
      const merchantMatch = line.match(MERCHANT_LABEL_RE);
      if (merchantMatch) lastShop = merchantMatch[1].trim();
    }
    return toDraftRows(
      labeled.map((b, i) => ({
        amount: b.amount,
        shop: b.shop || lastShop || `账单${i + 1}`,
      }))
    );
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bills: Array<{ amount: number; shop: string }> = [];
  const usedLineIdx = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let shop = '';
    const labelMatch = line.match(MERCHANT_LABEL_RE);
    const payToMatch = line.match(PAY_TO_RE);
    if (labelMatch) shop = labelMatch[1].trim();
    else if (payToMatch) shop = payToMatch[1].trim();
    if (!shop) continue;

    const windowText = lines.slice(i, i + 4).join('\n');
    AMOUNT_GLOBAL_RE.lastIndex = 0;
    const amountMatch = AMOUNT_GLOBAL_RE.exec(windowText);
    if (!amountMatch) continue;
    const amount = parseAmountStr(amountMatch[1] || amountMatch[2] || amountMatch[3] || '');
    if (amount <= 0) continue;
    bills.push({ amount, shop });
    usedLineIdx.add(i);
  }

  for (let i = 0; i < lines.length; i++) {
    if (usedLineIdx.has(i)) continue;
    const inlineMatch = lines[i].match(INLINE_ROW_RE);
    if (!inlineMatch) continue;
    const amount = parseAmountStr(inlineMatch[2]);
    if (amount <= 0) continue;
    bills.push({ amount, shop: inlineMatch[1].trim() });
  }

  if (bills.length === 0) {
    AMOUNT_GLOBAL_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = AMOUNT_GLOBAL_RE.exec(text)) !== null) {
      const amount = parseAmountStr(match[1] || match[2] || match[3] || '');
      if (amount <= 0) continue;
      const before = text.slice(0, match.index);
      const lineIdx = before.split(/\r?\n/).length - 1;
      let shop = '';
      for (let j = lineIdx - 1; j >= Math.max(0, lineIdx - 3); j--) {
        const candidate = lines[j];
        if (!candidate || /^\d|^[￥¥$]/.test(candidate)) continue;
        if (SKIP_MERCHANT_RE.test(candidate)) continue;
        if (candidate.length >= 2 && candidate.length <= 40) {
          shop = candidate;
          break;
        }
      }
      bills.push({ amount, shop: shop || '未命名商户' });
    }
  }

  return toDraftRows(bills);
}

function rowsToTransactions(rows: ShortcutImportDraftRow[]): Transaction[] {
  return rows.map((row) => ({
    id: crypto.randomUUID(),
    amount: row.amount,
    type: row.category === '收入' ? ('income' as const) : ('expense' as const),
    category: row.category,
    date: new Date().toISOString(),
    note: row.shop || undefined,
    accountId: DEFAULT_ACCOUNT_ID,
    mood: 'happy' as const,
  }));
}

async function persistAndSync(newTxs: Transaction[]): Promise<void> {
  persistTransactionsLocally(newTxs);
  const deviceId = getOrCreateDeviceId(DEVICE_ID_STORAGE_KEY);
  try {
    await billsRepo.upsertMany(supabase, deviceId, newTxs);
  } catch (e) {
    console.warn('[bills] silent import upsert failed', e);
  }
}

/**
 * 静默导入（无 UI）：
 * 1. ?action=import&type=分类&amount=账单纯文本（decodeURIComponent + 正则提金额）
 * 2. ?action=import&ocrData=...（OCR 批量，兼容旧方案）
 */
export async function executeSilentShortcutImport(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('action') !== 'import') return false;

  try {
    const menuBill = readMenuBillImportFromUrl();
    if (menuBill) {
      const newTxs = buildTransactionsFromMenuBill(menuBill);
      if (newTxs.length === 0) {
        redirectImportResult('error', 0, encodeURIComponent('未能从账单文本中提取金额'));
        return true;
      }
      await persistAndSync(newTxs);
      redirectImportResult('success', newTxs.length);
      return true;
    }

    const ocrText = readImportOcrFromUrl();
    if (ocrText) {
      const rows = parseBillsFromOcrText(ocrText).filter((r) => r.amount > 0);
      if (rows.length === 0) {
        redirectImportResult('error', 0, encodeURIComponent('未识别到有效金额'));
        return true;
      }
      const newTxs = rowsToTransactions(rows);
      await persistAndSync(newTxs);
      redirectImportResult('success', newTxs.length);
      return true;
    }

    redirectImportResult('error', 0, encodeURIComponent('缺少 type/amount 或 ocrData 参数'));
    return true;
  } catch (err) {
    const message = encodeURIComponent(err instanceof Error ? err.message : String(err));
    redirectImportResult('error', 0, message);
    return true;
  }
}

export function isImportResultUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('importStatus');
}

/** 供快捷指令读取的纯文本结果 */
export function getImportResultText(): string {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('importStatus');
  const count = params.get('count') || '0';
  if (status === 'success') return `入库成功，共 ${count} 笔`;
  const message = params.get('message');
  const decoded = message ? decodeURIComponent(message) : '未知错误';
  return `入库失败：${decoded}`;
}

export function clearImportResultUrlParams(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('importStatus');
  url.searchParams.delete('count');
  url.searchParams.delete('message');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
