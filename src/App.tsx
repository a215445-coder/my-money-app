import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Calendar,
  X,
  Trash2,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  Settings
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import type { Transaction, Category, TransactionType } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES: { label: Category; icon: string; color: string; hex: string }[] = [
  { label: '餐饮', icon: '🍔', color: 'bg-orange-100', hex: '#f97316' },
  { label: '交通', icon: '🚗', color: 'bg-blue-100', hex: '#3b82f6' },
  { label: '购物', icon: '🛍️', color: 'bg-purple-100', hex: '#a855f7' },
  { label: '娱乐', icon: '🎮', color: 'bg-pink-100', hex: '#ec4899' },
  { label: '医疗', icon: '🏥', color: 'bg-red-100', hex: '#ef4444' },
  { label: '教育', icon: '📚', color: 'bg-indigo-100', hex: '#6366f1' },
  { label: '收入', icon: '💰', color: 'bg-green-100', hex: '#22c55e' },
  { label: '其他', icon: '📦', color: 'bg-gray-100', hex: '#64748b' },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? Number(saved) : 5000;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('monthly_budget', budget.toString());
  }, [budget]);

  // Calculations
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

    const budgetUsage = Math.min((expense / budget) * 100, 100);

    // Pie chart data
    const categoryMap: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const pieData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORIES.find(c => c.label === name)?.hex || '#ccc'
    })).sort((a, b) => b.value - a.value);

    return { income, expense, balance: income - expense, budgetUsage, pieData };
  }, [transactions, budget]);

  const addOrUpdateTransaction = (t: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(transactions.map(item =>
        item.id === editingTransaction.id ? { ...t, id: item.id } : item
      ));
    } else {
      setTransactions([{ ...t, id: crypto.randomUUID() }, ...transactions]);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这笔账单吗？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { items: Transaction[], total: number }> = {};
    transactions.forEach(t => {
      const date = t.date;
      if (!groups[date]) groups[date] = { items: [], total: 0 };
      groups[date].items.push(t);
      if (t.type === 'expense') groups[date].total -= t.amount;
      else groups[date].total += t.amount;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  const handleReset = () => {
    if (confirm('确定要删除所有记账数据吗？此操作不可撤销')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-32">
      {/* Header & Stats Cards */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        <h1 className="text-2xl font-black mb-8 tracking-tight">我的账本</h1>

        {/* Main Balance Card */}
        <div className="bg-black text-white p-8 rounded-[2.5rem] mb-6 shadow-2xl relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">本月结余</p>
              <p className="text-4xl font-black">¥{formatCurrency(stats.balance)}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <Wallet className="text-white" size={24} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-widest">预算进度</span>
              <span className={cn(
                "font-black px-2 py-0.5 rounded-full",
                stats.budgetUsage > 90 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
              )}>
                {stats.budgetUsage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-700 ease-out rounded-full",
                  stats.budgetUsage > 90 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                )}
                style={{ width: `${stats.budgetUsage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sub Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="flex items-center text-emerald-600 mb-2">
              <TrendingUp size={16} className="mr-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">本月收入</span>
            </div>
            <p className="text-xl font-black text-emerald-700">¥{formatCurrency(stats.income)}</p>
          </div>
          <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 shadow-sm">
            <div className="flex items-center text-rose-600 mb-2">
              <TrendingDown size={16} className="mr-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">本月支出</span>
            </div>
            <p className="text-xl font-black text-rose-700">¥{formatCurrency(stats.expense)}</p>
          </div>
        </div>
      </header>

      {/* Tabs Switcher */}
      <div className="px-6 mt-8 flex space-x-2">
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
            activeTab === 'list' ? "bg-black text-white shadow-lg" : "bg-white text-gray-500"
          )}
        >
          账单明细
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={cn(
            "flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
            activeTab === 'chart' ? "bg-black text-white shadow-lg" : "bg-white text-gray-500"
          )}
        >
          统计分析
        </button>
      </div>

      {/* Content Area */}
      <main className="px-6 mt-6">
        {activeTab === 'list' ? (
          transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">📥</span>
              </div>
              <p className="text-xl font-black text-gray-400 mb-2">暂无账单记录</p>
              <p className="text-sm font-medium text-gray-400">点击下方按钮开始记第一笔账吧</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedTransactions.map(([date, data]) => (
                <div key={date}>
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {format(parseISO(date), 'MM月dd日 EEEE', { locale: zhCN })}
                    </h3>
                    <span className={cn(
                      "text-xs font-bold",
                      data.total >= 0 ? "text-emerald-500" : "text-gray-400"
                    )}>
                      {data.total > 0 ? '+' : ''}{formatCurrency(data.total)}
                    </span>
                  </div>
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                    {data.items.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => startEdit(item)}
                        className={cn(
                          "group flex items-center p-5 active:bg-gray-50 transition-all cursor-pointer",
                          idx !== data.items.length - 1 && "border-b border-gray-50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 text-xl shadow-sm",
                          CATEGORIES.find(c => c.label === item.category)?.color || "bg-gray-100"
                        )}>
                          {CATEGORIES.find(c => c.label === item.category)?.icon || '❓'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-gray-800">{item.category}</p>
                          {item.note && <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{item.note}</p>}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "font-black text-base",
                            item.type === 'expense' ? "text-rose-500" : "text-emerald-500"
                          )}>
                            {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                          </div>
                          <button
                            onClick={(e) => deleteTransaction(item.id, e)}
                            className="p-2 text-gray-200 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Chart Tab */
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg flex items-center">
                <PieIcon className="mr-2 text-indigo-500" size={20} />
                支出构成
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">本月</span>
            </div>

            {stats.pieData.length > 0 ? (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {stats.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {stats.pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-bold text-gray-600">{entry.name}</span>
                      </div>
                      <span className="text-xs font-black">¥{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-gray-300">
                <p className="font-bold italic">本月还没有支出数据哦</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Navigation/Action */}
      <div className="fixed bottom-10 left-0 right-0 px-6 flex justify-center items-center pointer-events-none">
        <button
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-90 transition-all pointer-events-auto hover:bg-gray-900"
        >
          <Plus size={40} strokeWidth={3} />
        </button>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black">{editingTransaction ? '编辑账单' : '记一笔'}</h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <TransactionForm
              onSubmit={addOrUpdateTransaction}
              initialData={editingTransaction || undefined}
            />
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">设置预算</h2>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">每月总预算 (¥)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full text-4xl font-black focus:outline-none border-b-4 border-gray-100 focus:border-black transition-colors pb-2"
                />
              </div>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="w-full py-5 bg-black text-white rounded-[2rem] font-black shadow-xl active:scale-95 transition-all"
              >
                保存设置
              </button>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  清空所有账单并重新开始
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionForm({
  onSubmit,
  initialData
}: {
  onSubmit: (t: Omit<Transaction, 'id'>) => void,
  initialData?: Transaction
}) {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || '餐饮');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState(initialData?.note || '');

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type Switcher */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => { setType('expense'); if (category === '收入') setCategory('餐饮'); }}
          className={cn(
            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            type === 'expense' ? "bg-white shadow-md text-rose-500" : "text-gray-400"
          )}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategory('收入'); }}
          className={cn(
            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            type === 'income' ? "bg-white shadow-md text-emerald-500" : "text-gray-400"
          )}
        >
          收入
        </button>
      </div>

      {/* Amount Input */}
      <div className="relative border-b-4 border-gray-50 focus-within:border-black transition-colors pb-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">输入金额</label>
        <div className="flex items-baseline">
          <span className="text-2xl font-black text-gray-300 mr-2">¥</span>
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full text-5xl font-black focus:outline-none placeholder:text-gray-100"
            required
          />
        </div>
      </div>

      {/* Date & Category */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">日期</label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 ring-black/5"
              required
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">分类</label>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 ring-black/5 appearance-none"
            >
              {CATEGORIES.map(c => (
                <option key={c.label} value={c.label}>{c.icon} {c.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Plus size={16} className="rotate-45" />
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">备注内容</label>
        <input
          type="text"
          placeholder="给这笔账单加个备注..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full p-5 bg-gray-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 ring-black/5"
        />
      </div>

      <button
        type="submit"
        className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-lg shadow-2xl active:scale-[0.98] transition-all hover:bg-gray-900"
      >
        {initialData ? '保存修改' : '立即记账'}
      </button>
    </form>
  );
}
