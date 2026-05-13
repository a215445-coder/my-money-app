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

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
  accountId: string;
  tags?: string[];
  hasImage?: boolean;
}
