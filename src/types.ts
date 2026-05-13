export type Category = '餐饮' | '交通' | '购物' | '娱乐' | '医疗' | '教育' | '收入' | '其他';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
}
