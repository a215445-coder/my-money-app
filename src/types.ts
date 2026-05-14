export type Category = '餐饮' | '交通' | '购物' | '娱乐' | '医疗' | '教育' | '收入' | '其他';

export type TransactionType = 'expense' | 'income';

export type AccountType = 'wechat' | 'alipay' | 'bank' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
}

export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'THB' | 'HKD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  flag: string;
  symbol: string;
}

export interface Transaction {
  id: string;
  amount: number; // This will always be CNY for stats
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
  accountId: string;
  tags?: string[];
  hasImage?: boolean;
  imageData?: string; // Base64 string for persistent storage
  originalAmount?: number;
  currency?: CurrencyCode;
  exchangeRate?: number;
  mood?: 'happy' | 'neutral' | 'sad';
}
