import type { Category } from '../types';

export type ShortcutImportDraftRow = {
  rowKey: string;
  amount: number;
  shop: string;
  category: Category;
};

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

function debugAlert(message: string): void {
  if (typeof window === 'undefined') return;
  window.alert(message);
}

function debugAlertError(err: unknown): void {
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  debugAlert(`快捷指令导入错误：${message}`);
}

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

  const rows = toDraftRows(bills);
  if (rows.length > 0) return rows;

  const firstLine = lines.find((l) => l.length >= 2 && !SKIP_MERCHANT_RE.test(l)) || '';
  return [
    {
      rowKey: `shortcut-fallback-${Date.now()}`,
      amount: 0,
      shop: firstLine.slice(0, 40),
      category: '其他',
    },
  ];
}

function getOcrRawFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('ocrData');
}

/** App 启动最早阶段探测：仅确认 URL 是否带上 ocrData（React 挂载前） */
export function probeShortcutImportOnBoot(): void {
  try {
    const ocrRaw = getOcrRawFromUrl();
    if (!ocrRaw) return;
    debugAlert('已成功接收到快捷指令数据！');
  } catch (err) {
    debugAlertError(err);
  }
}

function alertRegexMatchResult(rows: ShortcutImportDraftRow[], rawText: string): void {
  const matched = rows.filter((r) => r.amount > 0);
  if (matched.length > 0) {
    const amounts = matched.map((r) => r.amount).join(', ');
    debugAlert(`成功匹配到金额：${amounts}`);
    return;
  }
  const preview = rawText.length > 300 ? `${rawText.slice(0, 300)}...` : rawText;
  debugAlert(`正则匹配失败，收到的原始文本是：${preview}`);
}

/** 读取 ?ocrData=...（兼容 ?action=import&ocrData=...） */
export function parseShortcutImportFromUrl(): ShortcutImportDraftRow[] | null {
  try {
    const ocrRaw = getOcrRawFromUrl();
    if (!ocrRaw) return null;

    debugAlert('已成功接收到快捷指令数据！');

    const text = decodeOcrParam(ocrRaw);
    const rows = parseBillsFromOcrText(text);
    alertRegexMatchResult(rows, text);
    return rows;
  } catch (err) {
    debugAlertError(err);
    return null;
  }
}

export function hasShortcutImportUrl(): boolean {
  return !!getOcrRawFromUrl();
}

export function clearShortcutImportUrlParams(): void {
  try {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    url.searchParams.delete('ocrData');
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next);
  } catch (err) {
    debugAlertError(err);
  }
}
