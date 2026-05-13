import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Minus,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Tag,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Stethoscope,
  GraduationCap,
  Wallet,
  MoreHorizontal,
  X,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Transaction, Category, TransactionType } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: '餐饮', icon: <Utensils size={18} />, color: 'bg-orange-100 text-orange-600' },
  { label: '交通', icon: <Car size={18} />, color: 'bg-blue-100 text-blue-600' },
  { label: '购物', icon: <ShoppingBag size={18} />, color: 'bg-purple-100 text-purple-600' },
  { label: '娱乐', icon: <Gamepad2 size={18} />, color: 'bg-pink-100 text-pink-600' },
  { label: '医疗', icon: <Stethoscope size={18} />, color: 'bg-red-100 text-red-600' },
  { label: '教育', icon: <GraduationCap size={18} />, color: 'bg-indigo-100 text-indigo-600' },
  { label: '收入', icon: <Wallet size={18} />, color: 'bg-green-100 text-green-600' },
  { label: '其他', icon: <MoreHorizontal size={18} />, color: 'bg-gray-100 text-gray-600' },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) return JSON.parse(saved);

    // Default dummy data
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const yesterday = format(new Date(now.setDate(now.getDate() - 1)), 'yyyy-MM-dd');

    return [
      { id: '1', amount: 35, type: 'expense', category: '餐饮', date: today, note: '午餐' },
      { id: '2', amount: 15, type: 'expense', category: '交通', date: today, note: '地铁' },
      { id: '3', amount: 5000, type: 'income', category: '收入', date: yesterday, note: '工资' },
      { id: '4', amount: 120, type: 'expense', category: '购物', date: yesterday, note: '超市' },
    ];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculations for current month
  const stats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const monthTransactions = transactions.filter(t =>
      isWithinInterval(parseISO(t.date), { start, end })
    );

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions([newTransaction, ...transactions]);
    setIsModalOpen(false);
  };

  const deleteTransaction = (id: string) => {
    if (confirm('确定要删除这笔账单吗？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
      const date = t.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      {/* Header & Summary */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[2rem] shadow-sm">
        <h1 className="text-2xl font-bold mb-6">我的账本</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-2xl">
            <p className="text-xs text-red-500 font-medium mb-1">本月支出</p>
            <p className="text-xl font-bold text-red-600">¥{stats.expense.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl">
            <p className="text-xs text-green-500 font-medium mb-1">本月余额</p>
            <p className="text-xl font-bold text-green-600">¥{stats.balance.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Transaction List */}
      <main className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">账单明细</h2>
          <span className="text-xs text-gray-400">{format(new Date(), 'yyyy年MM月', { locale: zhCN })}</span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p>还没有账单记录哦</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map(([date, items]) => (
              <div key={date}>
                <h3 className="text-xs font-medium text-gray-400 mb-3 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {format(parseISO(date), 'MM月dd日 EEEE', { locale: zhCN })}
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center p-4 active:bg-gray-50 transition-colors",
                        idx !== items.length - 1 && "border-b border-gray-100"
                      )}
                      onClick={() => deleteTransaction(item.id)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        CATEGORIES.find(c => c.label === item.category)?.color || "bg-gray-100 text-gray-600"
                      )}>
                        {CATEGORIES.find(c => c.label === item.category)?.icon || <Tag size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.category}</p>
                        {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                      </div>
                      <div className={cn(
                        "font-bold text-sm",
                        item.type === 'expense' ? "text-red-500" : "text-green-500"
                      )}>
                        {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10"
      >
        <Plus size={28} />
      </button>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">记一笔</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <TransactionForm onSubmit={addTransaction} />
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionForm({ onSubmit }: { onSubmit: (t: Omit<Transaction, 'id'>) => void }) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('餐饮');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onSubmit({
      amount: Math.abs(Number(amount)),
      type,
      category,
      date,
      note
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory('餐饮'); }}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            type === 'expense' ? "bg-white shadow text-red-500" : "text-gray-500"
          )}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategory('收入'); }}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            type === 'income' ? "bg-white shadow text-green-500" : "text-gray-500"
          )}
        >
          收入
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="text-xs font-medium text-gray-400 block mb-2">金额</label>
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">¥</span>
          <input
            autoFocus
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full pl-8 py-2 text-4xl font-bold focus:outline-none placeholder:text-gray-100"
            required
          />
        </div>
      </div>

      {/* Date & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 ring-black/5"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">分类</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full p-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 ring-black/5 appearance-none"
          >
            {CATEGORIES.map(c => (
              <option key={c.label} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-xs font-medium text-gray-400 block mb-2">备注 (可选)</label>
        <input
          type="text"
          placeholder="写点什么..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full p-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 ring-black/5"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-black text-white rounded-2xl font-bold active:scale-[0.98] transition-transform shadow-lg"
      >
        保存账单
      </button>
    </form>
  );
}
