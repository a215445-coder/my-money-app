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

function parseAmountStr(raw: string): number {
  const n = parseFloat(String(raw).replace(/,/g, ''));
  if (!Number.isFinite(n)) return 0;
  const abs = Math.abs(n);
  if (abs < 0.01 || abs > 999_999) return 0;
  return Math.round(abs * 100) / 100;
}

function decodeOcrParam(raw: string): string {
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

function toDraftRows(bills: Array<{ amount: number; shop: string }>): ShortcutImportDraftRow[] {
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
      category: '其他',
    });
  });
  return rows;
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

function readImportOcrFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') !== 'import') return null;
  const ocrRaw = params.get('ocrData');
  if (!ocrRaw) return null;
  return decodeOcrParam(ocrRaw);
}

function redirectImportResult(status: 'success' | 'error', count: number, message?: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('action');
  url.searchParams.delete('ocrData');
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

  const totalExpense = newTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const savedAcc = localStorage.getItem('accounts');
  if (!savedAcc) return;
  const accounts = JSON.parse(savedAcc) as Array<{ id: string; balance: number }>;
  const nextAcc = accounts.map((acc) =>
    acc.id === DEFAULT_ACCOUNT_ID ? { ...acc, balance: acc.balance - totalExpense } : acc
  );
  localStorage.setItem('accounts', JSON.stringify(nextAcc));
}

function rowsToTransactions(rows: ShortcutImportDraftRow[]): Transaction[] {
  return rows.map((row) => ({
    id: crypto.randomUUID(),
    amount: row.amount,
    type: 'expense' as const,
    category: row.category,
    date: new Date().toISOString(),
    note: row.shop || undefined,
    accountId: DEFAULT_ACCOUNT_ID,
    mood: 'happy' as const,
  }));
}

/**
 * 静默导入：解析 ocrData → 写入 localStorage → 同步 Supabase → 重定向到结果页。
 * @returns true 表示已处理（将发生重定向，不应再挂载主 UI）
 */
export async function executeSilentShortcutImport(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const ocrText = readImportOcrFromUrl();
  if (!ocrText) return false;

  try {
    const rows = parseBillsFromOcrText(ocrText).filter((r) => r.amount > 0);
    if (rows.length === 0) {
      redirectImportResult('error', 0, encodeURIComponent('未识别到有效金额'));
      return true;
    }

    const newTxs = rowsToTransactions(rows);
    persistTransactionsLocally(newTxs);

    const deviceId = getOrCreateDeviceId(DEVICE_ID_STORAGE_KEY);
    try {
      await billsRepo.upsertMany(supabase, deviceId, newTxs);
    } catch (e) {
      console.warn('[bills] silent import upsert failed', e);
    }

    redirectImportResult('success', newTxs.length);
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
