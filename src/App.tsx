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
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  History,
  Clock,
  BarChart3,
  ChevronDown,
  Lock,
  ShieldCheck,
  Zap,
  LineChart as LineIcon
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  addMonths,
  addDays,
  addWeeks,
  addYears,
  differenceInDays,
  eachDayOfInterval,
  subDays,
  isSameDay
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import type { Transaction, Category, TransactionType } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEMES = {
  black: { primary: 'bg-black', text: 'text-black', border: 'border-black', shadow: 'shadow-black/20', ring: 'ring-black' },
  gray: { primary: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-600', shadow: 'shadow-slate-600/20', ring: 'ring-slate-600' },
  mint: { primary: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20', ring: 'ring-emerald-500' },
  sakura: { primary: 'bg-pink-400', text: 'text-pink-400', border: 'border-pink-400', shadow: 'shadow-pink-400/20', ring: 'ring-pink-400' },
};

type ThemeKey = keyof typeof THEMES;

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

type FilterType = 'today' | 'week' | 'month' | 'year';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Privacy Lock States
  const [isLocked, setIsLocked] = useState(() => {
    const enabled = localStorage.getItem('privacy_lock_enabled') === 'true';
    return enabled;
  });
  const [pin, setPin] = useState(() => localStorage.getItem('privacy_pin') || '');
  const [isLockEnabled, setIsLockEnabled] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [inputPin, setInputPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Theme State
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    return (localStorage.getItem('app_theme') as ThemeKey) || 'black';
  });
  const theme = THEMES[themeKey];

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('monthly_budget', budget.toString());
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('privacy_lock_enabled', isLockEnabled.toString());
    localStorage.setItem('privacy_pin', pin);
  }, [isLockEnabled, pin]);

  useEffect(() => {
    localStorage.setItem('app_theme', themeKey);
  }, [themeKey]);

  // Handle re-lock on background (simulated by visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLockEnabled) {
        setIsLocked(true);
        setInputPin('');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLockEnabled]);

  const verifyPin = (p: string) => {
    if (p === pin) {
      setIsLocked(false);
      setInputPin('');
    } else {
      alert('密码错误');
      setInputPin('');
    }
  };

  // Date Filtering Logic
  const dateRange = useMemo(() => {
    let start, end;
    switch (filterType) {
      case 'today':
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        break;
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'year':
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
        break;
      case 'month':
      default:
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
    }
    return { start, end };
  }, [filterType, currentDate]);

  const changeDate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    switch (filterType) {
      case 'today': setCurrentDate(addDays(currentDate, amount)); break;
      case 'week': setCurrentDate(addWeeks(currentDate, amount)); break;
      case 'month': setCurrentDate(addMonths(currentDate, amount)); break;
      case 'year': setCurrentDate(addYears(currentDate, amount)); break;
    }
  };

  // Calculations
  const stats = useMemo(() => {
    const filteredTransactions = transactions.filter(t =>
      isWithinInterval(parseISO(t.date), { start: dateRange.start, end: dateRange.end })
    );

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const budgetUsage = Math.min((expense / budget) * 100, 100);

    // Pie chart data
    const categoryMap: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const pieData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORIES.find(c => c.label === name)?.hex || '#ccc'
    })).sort((a, b) => b.value - a.value);

    // Top 3 ranking
    const ranking = [...pieData].slice(0, 3);

    // Trend Analysis (Last 7 Days)
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const trendData = last7Days.map(day => {
      const dayTotal = transactions
        .filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), day))
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        date: format(day, 'MM-dd'),
        amount: dayTotal
      };
    });

    // Daily suggested consumption
    const daysInMonth = differenceInDays(endOfMonth(new Date()), new Date()) + 1;
    const dailyBudget = Math.max((budget - expense) / daysInMonth, 0);

    return { income, expense, balance: income - expense, budgetUsage, pieData, ranking, filteredTransactions, trendData, dailyBudget };
  }, [transactions, budget, dateRange]);

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
    stats.filteredTransactions.forEach(t => {
      const date = t.date;
      if (!groups[date]) groups[date] = { items: [], total: 0 };
      groups[date].items.push(t);
      if (t.type === 'expense') groups[date].total -= t.amount;
      else groups[date].total += t.amount;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [stats.filteredTransactions]);

  const handleReset = () => {
    if (confirm('确定要删除所有记账数据吗？此操作不可撤销')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'today': return format(currentDate, 'MM月dd日');
      case 'week': return `${format(dateRange.start, 'MM.dd')} - ${format(dateRange.end, 'MM.dd')}`;
      case 'year': return format(currentDate, 'yyyy年');
      case 'month':
      default: return format(currentDate, 'yyyy年MM月');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 text-gray-900 font-sans pb-32 transition-colors duration-500")}>
      {/* Privacy Lock Screen */}
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce", theme.primary)}>
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">安全验证</h2>
          <p className="text-gray-400 text-sm mb-12 font-medium">请输入 4 位数字密码解锁</p>

          <div className="flex space-x-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all duration-300",
                  inputPin.length >= i ? theme.primary : "border-gray-200"
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((n, i) => (
              <button
                key={i}
                onClick={() => {
                  if (n === 'del') setInputPin(prev => prev.slice(0, -1));
                  else if (typeof n === 'number') {
                    const newPin = inputPin + n;
                    if (newPin.length <= 4) setInputPin(newPin);
                    if (newPin.length === 4) verifyPin(newPin);
                  }
                }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-xl font-black transition-all active:scale-90",
                  n === '' ? "invisible" : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                {n === 'del' ? <X size={20} /> : n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hamburger Menu Sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-white z-[70] shadow-2xl transition-transform duration-500 ease-out rounded-r-[2.5rem] p-8",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Wallet className="text-white" size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter">我的账本</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'today', label: '今日明细', icon: <Clock size={20} /> },
            { id: 'week', label: '周视图', icon: <History size={20} /> },
            { id: 'month', label: '月度分析', icon: <PieIcon size={20} /> },
            { id: 'year', label: '年度账单', icon: <BarChart3 size={20} /> },
            { id: 'settings', label: '设置', icon: <Settings size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'settings') {
                  setIsBudgetModalOpen(true);
                } else {
                  setFilterType(item.id as FilterType);
                  setCurrentDate(new Date());
                }
                setIsMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all active:scale-95",
                (filterType === item.id) ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">当前版本</p>
            <p className="text-sm font-black">v2.1.0 PRO</p>
          </div>
        </div>
      </aside>

      {/* Header & Stats Cards */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-gray-50 rounded-2xl text-black active:scale-90 transition-all shadow-sm"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl shadow-inner">
            <button onClick={() => changeDate('prev')} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft size={16} /></button>
            <div className="px-4 text-xs font-black tracking-tighter min-w-[100px] text-center">{getFilterLabel()}</div>
            <button onClick={() => changeDate('next')} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight size={16} /></button>
          </div>

          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="p-3 bg-gray-50 rounded-2xl text-gray-500 active:scale-90 transition-all shadow-sm"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Main Balance Card */}
        <div className={cn("text-white p-8 rounded-[2.5rem] mb-6 shadow-2xl relative transition-all duration-500", theme.primary)}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                {filterType === 'month' ? '本月' : filterType === 'today' ? '今日' : filterType === 'week' ? '本周' : '年度'}结余
              </p>
              <p className="text-4xl font-black">¥{formatCurrency(stats.balance)}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <Wallet className="text-white" size={24} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center">
                <span className="text-white/60 font-bold uppercase tracking-widest mr-2">预算进度</span>
                {stats.budgetUsage >= 80 && (
                  <Zap size={14} className="text-yellow-300 animate-pulse" />
                )}
              </div>
              <span className={cn(
                "font-black px-2 py-0.5 rounded-full backdrop-blur-md",
                stats.budgetUsage > 90 ? "bg-red-500 text-white" : "bg-white/20 text-white"
              )}>
                {stats.budgetUsage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-out rounded-full",
                  stats.budgetUsage > 90 ? "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" : "bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                )}
                style={{ width: `${stats.budgetUsage}%` }}
              />
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
              <p className="text-[10px] text-white/50 font-bold tracking-tight">
                建议今日消费控制在：
              </p>
              <p className="text-sm font-black text-yellow-300">
                ¥{formatCurrency(stats.dailyBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* Sub Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="flex items-center text-emerald-600 mb-2">
              <TrendingUp size={16} className="mr-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">总收入</span>
            </div>
            <p className="text-xl font-black text-emerald-700">¥{formatCurrency(stats.income)}</p>
          </div>
          <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 shadow-sm">
            <div className="flex items-center text-rose-600 mb-2">
              <TrendingDown size={16} className="mr-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">总支出</span>
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
            "flex-1 py-4 rounded-3xl text-sm font-black transition-all active:scale-95",
            activeTab === 'list' ? "bg-black text-white shadow-xl" : "bg-white text-gray-400 border border-gray-100"
          )}
        >
          <div className="flex items-center justify-center">
            <LayoutGrid size={16} className="mr-2" />
            账单明细
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={cn(
            "flex-1 py-4 rounded-3xl text-sm font-black transition-all active:scale-95",
            activeTab === 'chart' ? "bg-black text-white shadow-xl" : "bg-white text-gray-400 border border-gray-100"
          )}
        >
          <div className="flex items-center justify-center">
            <PieIcon size={16} className="mr-2" />
            统计分析
          </div>
        </button>
      </div>

      {/* Content Area */}
      <main className="px-6 mt-6">
        {activeTab === 'list' ? (
          stats.filteredTransactions.length === 0 ? (
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
                        onContextMenu={(e) => {
                          e.preventDefault();
                          deleteTransaction(item.id, e as any);
                        }}
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
          <div className="space-y-6">
            {/* Trend Chart */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="font-black text-lg mb-6 flex items-center">
                <LineIcon className="mr-2 text-blue-500" size={20} />
                最近 7 天消费趋势
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'black', marginBottom: '4px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#000"
                      strokeWidth={4}
                      dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-lg flex items-center">
                  <PieIcon className="mr-2 text-indigo-500" size={20} />
                  支出构成
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-100">
                    <button
                      onClick={() => changeDate('prev')}
                      className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-black"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setIsFilterModalOpen(true)}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center text-gray-600 hover:text-black transition-colors"
                    >
                      {getFilterLabel()}
                      <ChevronDown size={12} className="ml-1 opacity-50" />
                    </button>
                    <button
                      onClick={() => changeDate('next')}
                      className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-black"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
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
                  <p className="font-bold italic">当前时段还没有支出数据哦</p>
                </div>
              )}
            </div>

            {/* Top 3 Ranking */}
            {stats.ranking.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <h3 className="font-black text-lg mb-6 flex items-center">
                  <TrendingDown className="mr-2 text-rose-500" size={20} />
                  消费排行榜
                </h3>
                <div className="space-y-4">
                  {stats.ranking.map((item, index) => (
                    <div key={item.name} className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-400">
                        {index + 1}
                      </div>
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                        CATEGORIES.find(c => c.label === item.name)?.color || "bg-gray-100"
                      )}>
                        {CATEGORIES.find(c => c.label === item.name)?.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full"
                            style={{ width: `${(item.value / stats.expense) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">¥{formatCurrency(item.value)}</p>
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest">{((item.value / stats.expense) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Navigation/Action */}
      <div className="fixed bottom-10 left-0 right-0 px-6 flex justify-center items-center pointer-events-none">
        <button
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          className={cn(
            "w-20 h-20 text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-90 transition-all pointer-events-auto hover:brightness-110",
            theme.primary
          )}
        >
          <Plus size={40} strokeWidth={3} className="animate-in zoom-in-50 duration-500" />
        </button>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
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
              transactions={transactions}
            />
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
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
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">应用主题</p>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {(Object.keys(THEMES) as ThemeKey[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setThemeKey(t)}
                      className={cn(
                        "h-10 rounded-xl transition-all active:scale-90 border-2",
                        THEMES[t].primary,
                        themeKey === t ? "border-gray-900 scale-105" : "border-transparent opacity-60"
                      )}
                    />
                  ))}
                </div>

                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">安全设置</p>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-6">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={20} className={theme.text} />
                    <span className="text-sm font-bold">隐私锁 (4位密码)</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!isLockEnabled) setIsSettingPin(true);
                      else setIsLockEnabled(false);
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-300",
                      isLockEnabled ? theme.primary : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                      isLockEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

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

      {/* Pin Setting Modal */}
      {isSettingPin && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black mb-2">设置新密码</h2>
            <p className="text-gray-400 text-xs mb-8">请设置 4 位数字作为你的隐私锁密码</p>
            <input
              autoFocus
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="****"
              className="w-full text-center text-4xl font-black tracking-[1rem] focus:outline-none border-b-4 border-gray-100 focus:border-black transition-colors pb-4 mb-8"
              onChange={(e) => {
                const val = e.target.value;
                if (val.length === 4) {
                  setPin(val);
                  setIsLockEnabled(true);
                  setIsSettingPin(false);
                }
              }}
            />
            <button
              onClick={() => setIsSettingPin(false)}
              className="w-full py-4 bg-gray-100 rounded-2xl font-bold text-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Time Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setIsFilterModalOpen(false)}
          />
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 relative">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black">筛选时间维度</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'today', label: '今日', icon: '🕒' },
                { id: 'week', label: '本周', icon: '📅' },
                { id: 'month', label: '本月', icon: '📊' },
                { id: 'year', label: '本年', icon: '🗓️' },
              ].map((dim) => (
                <button
                  key={dim.id}
                  onClick={() => {
                    setFilterType(dim.id as FilterType);
                    setCurrentDate(new Date());
                    setIsFilterModalOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all active:scale-95 border-2",
                    filterType === dim.id
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-gray-500 border-transparent hover:border-gray-200"
                  )}
                >
                  <span className="text-2xl mb-2">{dim.icon}</span>
                  <span className="font-black text-xs uppercase tracking-widest">{dim.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">快捷切换</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => { changeDate('prev'); setIsFilterModalOpen(false); }}
                  className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-sm active:scale-95 transition-all"
                >
                  上一时段
                </button>
                <button
                  onClick={() => { changeDate('next'); setIsFilterModalOpen(false); }}
                  className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-sm active:scale-95 transition-all"
                >
                  下一时段
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
  initialData,
  transactions
}: {
  onSubmit: (t: Omit<Transaction, 'id'>) => void,
  initialData?: Transaction,
  transactions: Transaction[]
}) {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || '餐饮');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState(initialData?.note || '');

  const suggestions = useMemo(() => {
    const notes = transactions
      .filter(t => t.category === category && t.note)
      .map(t => t.note as string);
    return Array.from(new Set(notes)).slice(0, 3);
  }, [category, transactions]);

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
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNote(s)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] font-bold text-gray-500 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
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
