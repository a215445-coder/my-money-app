import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
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
  History,
  BarChart3,
  ChevronDown,
  Lock,
  ShieldCheck,
  Zap,
  LineChart as LineIcon,
  Search,
  Download,
  Cloud,
  Camera,
  Hash,
  Smile
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
  isSameDay,
  subMonths
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import type { Transaction, Category, TransactionType, Account } from './types';

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

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'ac-1', name: '微信支付', type: 'wechat', balance: 0, icon: '📱' },
  { id: 'ac-2', name: '支付宝', type: 'alipay', balance: 0, icon: '💳' },
  { id: 'ac-3', name: '招商银行', type: 'bank', balance: 0, icon: '🏦' },
  { id: 'ac-4', name: '现金钱包', type: 'cash', balance: 0, icon: '💵' },
];

const QUOTES = [
  "今天没花钱，你是省钱小能手！✨",
  "每一分存下的钱，都是通往自由的基石。🏦",
  "理财不在于钱多钱少，而在于习惯的养成。💡",
  "记得给未来的自己留一份礼物。🎁",
  "理性消费，快乐记账。😊",
  "看，你的财富正在一点点积累！📈"
];

type FilterType = 'today' | 'week' | 'month' | 'year';

export default function App() {
  // --- Core State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? Number(saved) : 5000;
  });

  // --- UI State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  // --- Privacy & Theme ---
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [pin, setPin] = useState(() => localStorage.getItem('privacy_pin') || '');
  const [isLockEnabled, setIsLockEnabled] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [inputPin, setInputPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => (localStorage.getItem('app_theme') as ThemeKey) || 'black');
  const theme = THEMES[themeKey];

  // --- Persistence ---
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('monthly_budget', budget.toString()), [budget]);
  useEffect(() => {
    localStorage.setItem('privacy_lock_enabled', isLockEnabled.toString());
    localStorage.setItem('privacy_pin', pin);
  }, [isLockEnabled, pin]);
  useEffect(() => localStorage.setItem('app_theme', themeKey), [themeKey]);

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

  // --- Calculations ---
  const stats = useMemo(() => {
    let start: Date, end: Date;
    switch (filterType) {
      case 'today': start = startOfDay(currentDate); end = endOfDay(currentDate); break;
      case 'week': start = startOfWeek(currentDate, { weekStartsOn: 1 }); end = endOfWeek(currentDate, { weekStartsOn: 1 }); break;
      case 'year': start = startOfYear(currentDate); end = endOfYear(currentDate); break;
      case 'month': default: start = startOfMonth(currentDate); end = endOfMonth(currentDate); break;
    }

    const filteredByDate = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));

    const filtered = filteredByDate.filter(t => {
      const searchMatch = !searchQuery ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.includes(searchQuery) ||
        t.tags?.some(tag => tag.includes(searchQuery));
      return searchMatch;
    });

    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // MoM comparison
    const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));
    const lastMonthExpense = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: lastMonthStart, end: lastMonthEnd }))
      .reduce((sum, t) => sum + t.amount, 0);

    const momDiff = expense - lastMonthExpense;
    const momChange = lastMonthExpense === 0 ? 0 : (momDiff / lastMonthExpense) * 100;

    // Daily budget
    const daysInMonth = differenceInDays(endOfMonth(currentDate), new Date()) + 1;
    const remainingBudget = Math.max(budget - expense, 0);
    const dailyBudget = daysInMonth > 0 ? remainingBudget / daysInMonth : 0;

    // Pie data
    const categoryMap: Record<string, number> = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const pieData = Object.entries(categoryMap).map(([name, value]) => ({
      name, value, color: CATEGORIES.find(c => c.label === name)?.hex || '#ccc'
    })).sort((a, b) => b.value - a.value);

    // Trend Data (Last 7 Days)
    const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    const trendData = last7Days.map(day => ({
      date: format(day, 'MM-dd'),
      amount: transactions.filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), day)).reduce((sum, t) => sum + t.amount, 0)
    }));

    // Heatmap Data (Last 30 Days)
    const last30Days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    const heatmapData = last30Days.map(day => {
      const dayExpense = transactions.filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), day)).reduce((sum, t) => sum + t.amount, 0);
      return {
        date: format(day, 'yyyy-MM-dd'),
        count: dayExpense,
        level: dayExpense === 0 ? 0 : dayExpense < 100 ? 1 : dayExpense < 500 ? 2 : dayExpense < 1000 ? 3 : 4
      };
    });

    return { income, expense, balance: income - expense, budgetUsage: (expense / budget) * 100, momDiff, momChange, dailyBudget, pieData, filtered, trendData, heatmapData };
  }, [transactions, budget, currentDate, filterType, searchQuery]);

  const totalAssets = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

  const dailyQuote = useMemo(() => {
    if (stats.expense === 0) return QUOTES[0];
    return QUOTES[Math.floor(Math.random() * (QUOTES.length - 1)) + 1];
  }, [stats.expense]);

  // --- Handlers ---
  const changeDate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    switch (filterType) {
      case 'today': setCurrentDate(addDays(currentDate, amount)); break;
      case 'week': setCurrentDate(addWeeks(currentDate, amount)); break;
      case 'month': setCurrentDate(addMonths(currentDate, amount)); break;
      case 'year': setCurrentDate(addYears(currentDate, amount)); break;
    }
  };

  const addOrUpdateTransaction = (t: Omit<Transaction, 'id'>) => {
    const id = editingTransaction?.id || crypto.randomUUID();
    const newTransaction = { ...t, id };

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === t.accountId) {
        if (editingTransaction) {
          const oldImpact = editingTransaction.type === 'expense' ? -editingTransaction.amount : editingTransaction.amount;
          const newImpact = t.type === 'expense' ? -t.amount : t.amount;
          return { ...acc, balance: acc.balance - oldImpact + newImpact };
        }
        const impact = t.type === 'expense' ? -t.amount : t.amount;
        return { ...acc, balance: acc.balance + impact };
      }
      return acc;
    });

    if (editingTransaction) {
      setTransactions(transactions.map(item => item.id === id ? newTransaction : item));
    } else {
      setTransactions([newTransaction, ...transactions]);
    }
    setAccounts(updatedAccounts);
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这笔账单吗？')) {
      const toDelete = transactions.find(t => t.id === id);
      if (toDelete) {
        const updatedAccounts = accounts.map(acc => {
          if (acc.id === toDelete.accountId) {
            const impact = toDelete.type === 'expense' ? -toDelete.amount : toDelete.amount;
            return { ...acc, balance: acc.balance - impact };
          }
          return acc;
        });
        setAccounts(updatedAccounts);
      }
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm('确定要删除所有记账数据吗？此操作不可撤销')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportCSV = () => {
    const headers = ['日期', '类型', '分类', '金额', '账户', '备注', '标签'];
    const rows = transactions.map(t => [t.date, t.type === 'expense' ? '支出' : '收入', t.category, t.amount, accounts.find(a => a.id === t.accountId)?.name || '未知', t.note || '', t.tags?.join(';') || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `我的账本_导出_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.click();
  };

  const formatCurrency = (v: number) => v.toLocaleString('zh-CN', { minimumFractionDigits: 2 });

  const getFilterLabel = () => {
    switch (filterType) {
      case 'today': return format(currentDate, 'MM月dd日');
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, 'MM.dd')} - ${format(end, 'MM.dd')}`;
      }
      case 'year': return format(currentDate, 'yyyy年');
      case 'month': default: return format(currentDate, 'yyyy年MM月');
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 text-gray-900 font-sans pb-32 transition-colors duration-500")}>
      {/* Privacy Lock Screen */}
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8">
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce", theme.primary)}>
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">安全验证</h2>
          <div className="flex space-x-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("w-4 h-4 rounded-full border-2", inputPin.length >= i ? theme.primary : "border-gray-200")} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((n, i) => (
              <button key={i} onClick={() => {
                if (n === 'del') setInputPin(prev => prev.slice(0, -1));
                else if (typeof n === 'number') {
                  const next = inputPin + n;
                  if (next.length <= 4) setInputPin(next);
                  if (next.length === 4) {
                    if (next === pin) setIsLocked(false);
                    else { alert('密码错误'); setInputPin(''); }
                  }
                }
              }} className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-black bg-gray-50 active:scale-90", n === '' && "invisible")}>
                {n === 'del' ? <X size={20} /> : n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Menu */}
      <div className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity", isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsMenuOpen(false)} />
      <aside className={cn("fixed top-0 left-0 h-full w-[280px] bg-white z-[70] shadow-2xl transition-transform duration-500 rounded-r-[2.5rem] p-8", isMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg"><Wallet className="text-white" size={20} /></div>
            <span className="font-black text-xl tracking-tighter">我的账本</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'list', label: '账单明细', icon: <History size={20} /> },
            { id: 'chart', label: '统计分析', icon: <PieIcon size={20} /> },
            { id: 'calendar', label: '记账日历', icon: <CalendarIcon size={20} /> },
            { id: 'settings', label: '系统设置', icon: <Settings size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => {
              if (item.id === 'settings') setIsBudgetModalOpen(true);
              else setActiveTab(item.id as any);
              setIsMenuOpen(false);
            }} className={cn("w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all", activeTab === item.id ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-50")}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="bg-green-50 p-4 rounded-2xl flex items-center space-x-3 border border-green-100">
            <Cloud className="text-green-500" size={18} />
            <div className="text-[10px] font-bold text-green-700">已与 GitHub 私有云同步</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400">v3.0.0 ENTERPRISE</div>
        </div>
      </aside>

      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setIsMenuOpen(true)} className="p-3 bg-gray-50 rounded-2xl text-black active:scale-90 shadow-sm"><Menu size={24} /></button>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              <Smile size={12} className={theme.text} /><span>每日寄语</span>
            </div>
            <p className="text-xs font-black text-gray-800">{dailyQuote}</p>
          </div>
          <button onClick={() => setIsBudgetModalOpen(true)} className="p-3 bg-gray-50 rounded-2xl text-gray-500 active:scale-90 shadow-sm"><Settings size={24} /></button>
        </div>

        {/* Total Assets Card */}
        <div className={cn("text-white p-8 rounded-[2.5rem] mb-6 shadow-2xl relative transition-all duration-500", theme.primary)}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">总资产估值</p>
              <p className="text-4xl font-black">¥{formatCurrency(totalAssets)}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><BarChart3 size={24} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
              <p className="text-[10px] text-white/50 font-bold mb-1">本月结余</p>
              <p className="text-lg font-black">¥{formatCurrency(stats.balance)}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
              <p className="text-[10px] text-white/50 font-bold mb-1">预算进度</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", stats.budgetUsage > 90 ? "bg-red-400" : "bg-white")} style={{ width: `${Math.min(stats.budgetUsage, 100)}%` }} />
                </div>
                <span className="text-[10px] font-black">{stats.budgetUsage.toFixed(0)}%</span>
              </div>
              {stats.budgetUsage >= 80 && <Zap size={10} className="text-yellow-300 absolute top-2 right-2 animate-pulse" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <p className="text-[10px] text-white/50 font-bold tracking-tight">建议今日消费：</p>
            <p className="text-sm font-black text-yellow-300">¥{formatCurrency(stats.dailyBudget)}</p>
          </div>
        </div>

        {/* Accounts Horizontal Scroll */}
        <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
          {accounts.map(acc => (
            <div key={acc.id} className="flex-shrink-0 bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-[120px] shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{acc.icon}</span>
                <span className="text-[10px] font-black text-gray-400">{acc.name}</span>
              </div>
              <p className="text-sm font-black text-gray-800">¥{formatCurrency(acc.balance)}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 mt-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input type="text" placeholder="搜索账单、备注或标签..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white pl-12 pr-4 py-4 rounded-2xl text-sm font-medium border border-gray-100 shadow-sm focus:outline-none focus:ring-4 ring-black/5" />
        </div>

        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-100">
                <button onClick={() => changeDate('prev')} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-black"><ChevronLeft size={14} /></button>
                <button onClick={() => setIsFilterModalOpen(true)} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center text-gray-600 hover:text-black transition-colors">{getFilterLabel()}<ChevronDown size={12} className="ml-1 opacity-50" /></button>
                <button onClick={() => changeDate('next')} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-black"><ChevronRight size={14} /></button>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-black flex items-center", stats.momDiff > 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500")}>
                {stats.momDiff > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                较上月 {stats.momDiff > 0 ? '多花' : '少花'} ¥{formatCurrency(Math.abs(stats.momDiff))} ({Math.abs(stats.momChange).toFixed(0)}%)
              </div>
            </div>

            {stats.filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <div className="text-6xl mb-4 opacity-50">🏜️</div>
                <p className="font-bold text-center px-8">暂无账单记录<br /><span className="text-xs font-medium">点击下方按钮开始记第一笔账吧</span></p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(stats.filtered.reduce((groups, t) => {
                  const date = t.date;
                  if (!groups[date]) groups[date] = [];
                  groups[date].push(t);
                  return groups;
                }, {} as Record<string, Transaction[]>)).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
                  <div key={date}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">{format(parseISO(date), 'MM月dd日 EEEE', { locale: zhCN })}</p>
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                      {items.map((item, idx) => (
                        <div key={item.id} onClick={() => { setEditingTransaction(item); setIsModalOpen(true); }} onContextMenu={(e) => { e.preventDefault(); deleteTransaction(item.id, e as any); }} className={cn("p-5 flex items-center active:bg-gray-50 transition-colors group", idx !== items.length - 1 && "border-b border-gray-50")}>
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm mr-4", CATEGORIES.find(c => c.label === item.category)?.color)}>
                            {CATEGORIES.find(c => c.label === item.category)?.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-gray-800">{item.category}</span>
                              <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-bold uppercase">{accounts.find(a => a.id === item.accountId)?.name}</span>
                            </div>
                            {item.note && <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.note}</p>}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags?.map(tag => <span key={tag} className="text-[8px] text-indigo-400 font-bold">#{tag}</span>)}
                              {item.hasImage && <Camera size={10} className="text-gray-300 ml-1" />}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={cn("font-black text-sm", item.type === 'expense' ? "text-red-500" : "text-green-500")}>{item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}</div>
                            <button onClick={(e) => deleteTransaction(item.id, e)} className="p-2 text-gray-200 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
              <h3 className="font-black text-lg mb-6 flex items-center"><LineIcon size={20} className="mr-2 text-blue-500" />消费趋势 (7天)</h3>
              {stats.trendData.some(d => d.amount > 0) ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trendData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeKey === 'black' ? '#000' : theme.text.replace('text-', '')} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={themeKey === 'black' ? '#000' : theme.text.replace('text-', '')} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                      <YAxis hide />
                      <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="amount" stroke={themeKey === 'black' ? '#000' : theme.text.replace('text-', '')} fillOpacity={1} fill="url(#colorAmount)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-300 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <Smile size={32} className="mb-2 opacity-20" />
                  <p className="text-xs font-bold">暂无消费数据，记一笔试试吧</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
              <h3 className="font-black text-lg mb-6 flex items-center"><History size={20} className="mr-2 text-green-500" />消费热力图 (30天)</h3>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {stats.heatmapData.map((day) => (
                  <div key={day.date} className={cn(
                    "w-6 h-6 rounded-md transition-all relative group",
                    day.level === 0 ? "bg-gray-100" :
                      day.level === 1 ? "bg-green-200" :
                        day.level === 2 ? "bg-green-400" :
                          day.level === 3 ? "bg-green-600" : "bg-green-800"
                  )}>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      {day.date}: ¥{day.count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end space-x-2">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Less</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-sm bg-gray-100" />
                  <div className="w-2 h-2 rounded-sm bg-green-200" />
                  <div className="w-2 h-2 rounded-sm bg-green-400" />
                  <div className="w-2 h-2 rounded-sm bg-green-600" />
                  <div className="w-2 h-2 rounded-sm bg-green-800" />
                </div>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">More</span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
              <h3 className="font-black text-lg mb-8 flex items-center"><PieIcon size={20} className="mr-2 text-indigo-500" />支出构成</h3>
              {stats.pieData.length > 0 ? (
                <>
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                          {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">总支出</p>
                      <p className="text-xl font-black">¥{formatCurrency(stats.expense)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {stats.pieData.map(entry => (
                      <div key={entry.name} className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} /><span className="text-xs font-bold text-gray-600">{entry.name}</span></div>
                        <span className="text-xs font-black">¥{formatCurrency(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="py-20 text-center text-gray-300 font-bold italic">暂无统计数据</div>}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 animate-in fade-in duration-500">
            <h3 className="font-black text-lg mb-8 flex items-center"><CalendarIcon size={20} className="mr-2 text-orange-500" />记账日历</h3>
            <div className="grid grid-cols-7 gap-2">
              {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-300 pb-4">{d}</div>)}
              {eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }).map(day => {
                const dayData = transactions.filter(t => isSameDay(parseISO(t.date), day));
                return (
                  <div key={day.toString()} onClick={() => setSelectedCalendarDate(day)} className={cn("aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative cursor-pointer", isSameDay(day, selectedCalendarDate) ? theme.primary + " text-white" : "hover:bg-gray-50")}>
                    <span className="text-xs font-black">{format(day, 'd')}</span>
                    {dayData.length > 0 && <div className={cn("w-1 h-1 rounded-full absolute bottom-1.5", isSameDay(day, selectedCalendarDate) ? "bg-white" : "bg-black")} />}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">选中日期账单</p>
              {transactions.filter(t => isSameDay(parseISO(t.date), selectedCalendarDate)).length === 0 ? (
                <p className="text-xs text-gray-300 font-bold italic text-center py-4">这一天很安静，没有开支 🍃</p>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(t => isSameDay(parseISO(t.date), selectedCalendarDate)).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{CATEGORIES.find(c => c.label === t.category)?.icon}</span>
                        <span className="text-xs font-bold">{t.category}</span>
                      </div>
                      <span className={cn("text-xs font-black", t.type === 'expense' ? "text-red-500" : "text-green-500")}>¥{formatCurrency(t.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Action FAB */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none z-50">
        <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className={cn("w-20 h-20 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all pointer-events-auto hover:brightness-110", theme.primary)}>
          <Plus size={40} strokeWidth={3} className="animate-in zoom-in-50 duration-500" />
        </button>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black">{editingTransaction ? '修改账单' : '记一笔'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }} className="p-3 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <TransactionForm accounts={accounts} transactions={transactions} onSubmit={addOrUpdateTransaction} initialData={editingTransaction || undefined} onDelete={editingTransaction ? () => { deleteTransaction(editingTransaction.id, { stopPropagation: () => { } } as any); setIsModalOpen(false); } : undefined} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[80vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">系统设置</h2>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">每月支出预算</label>
                <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full text-4xl font-black focus:outline-none border-b-4 border-gray-100 focus:border-black transition-colors pb-2" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">应用主题色</label>
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(THEMES) as ThemeKey[]).map(t => (
                    <button key={t} onClick={() => setThemeKey(t)} className={cn("h-12 rounded-2xl border-2 transition-all", THEMES[t].primary, themeKey === t ? "border-gray-900 scale-105" : "border-transparent opacity-50")} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">安全设置</label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-3"><ShieldCheck size={20} className={theme.text} /><span className="text-sm font-bold">隐私锁</span></div>
                  <button onClick={() => { if (!isLockEnabled) setIsSettingPin(true); else setIsLockEnabled(false); }} className={cn("w-12 h-6 rounded-full relative transition-colors", isLockEnabled ? theme.primary : "bg-gray-200")}>
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isLockEnabled ? "left-7" : "left-1")} />
                  </button>
                </div>
              </div>
              <div className="pt-4 space-y-3 border-t border-gray-100">
                <button onClick={exportCSV} className="w-full py-4 bg-gray-50 text-gray-800 rounded-2xl font-bold text-sm flex items-center justify-center border border-gray-100"><Download size={18} className="mr-2" />导出全部账单 (CSV)</button>
                <button onClick={handleReset} className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-bold text-sm flex items-center justify-center border border-rose-100"><Trash2 size={18} className="mr-2" />清空所有数据</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pin Setting */}
      {isSettingPin && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black mb-2">设置新密码</h2>
            <p className="text-gray-400 text-xs mb-8">请输入 4 位数字密码</p>
            <input autoFocus type="password" maxLength={4} inputMode="numeric" placeholder="****" className="w-full text-center text-4xl font-black tracking-[1rem] focus:outline-none border-b-4 border-gray-100 focus:border-black pb-4 mb-8" onChange={e => { if (e.target.value.length === 4) { setPin(e.target.value); setIsLockEnabled(true); setIsSettingPin(false); } }} />
            <button onClick={() => setIsSettingPin(false)} className="w-full py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">取消</button>
          </div>
        </div>
      )}

      {/* Time Filter */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black">筛选维度</h2><button onClick={() => setIsFilterModalOpen(false)} className="p-3 bg-gray-100 rounded-full"><X size={20} /></button></div>
            <div className="grid grid-cols-2 gap-4">
              {[{ id: 'today', label: '今日', icon: '🕒' }, { id: 'week', label: '本周', icon: '📅' }, { id: 'month', label: '本月', icon: '📊' }, { id: 'year', label: '本年', icon: '🗓️' }].map(dim => (
                <button key={dim.id} onClick={() => { setFilterType(dim.id as any); setCurrentDate(new Date()); setIsFilterModalOpen(false); }} className={cn("flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all", filterType === dim.id ? "bg-black text-white border-black" : "bg-gray-50 text-gray-500 border-transparent")}>
                  <span className="text-2xl mb-2">{dim.icon}</span><span className="font-black text-[10px] uppercase tracking-widest">{dim.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionForm({ accounts, transactions, onSubmit, initialData, onDelete }: { accounts: Account[], transactions: Transaction[], onSubmit: (t: Omit<Transaction, 'id'>) => void, initialData?: Transaction, onDelete?: () => void }) {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || '餐饮');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0].id);
  const [note, setNote] = useState(initialData?.note || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [hasImage, setHasImage] = useState(initialData?.hasImage || false);

  const suggestions = useMemo(() => Array.from(new Set(transactions.filter(t => t.category === category && t.note).map(t => t.note as string))).slice(0, 3), [category, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    onSubmit({ amount: Math.abs(Number(amount)), type, category, date, note, accountId, tags, hasImage });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex bg-gray-100 p-1.5 rounded-2xl">
        <button type="button" onClick={() => setType('expense')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'expense' ? "bg-white shadow-md text-red-500" : "text-gray-400")}>支出</button>
        <button type="button" onClick={() => setType('income')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'income' ? "bg-white shadow-md text-green-500" : "text-gray-400")}>收入</button>
      </div>
      <div className="relative border-b-4 border-gray-50 focus-within:border-black transition-colors pb-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">输入金额</label>
        <div className="flex items-baseline"><span className="text-2xl font-black text-gray-300 mr-2">¥</span><input autoFocus type="number" inputMode="decimal" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-5xl font-black focus:outline-none placeholder:text-gray-100" required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] font-black text-gray-400 mb-2 block">日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold focus:outline-none" required /></div>
        <div><label className="text-[10px] font-black text-gray-400 mb-2 block">支付账户</label><select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold focus:outline-none appearance-none">{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] font-black text-gray-400 mb-2 block">所属分类</label><select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold focus:outline-none appearance-none">{CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}</select></div>
        <div className="flex flex-col"><label className="text-[10px] font-black text-gray-400 mb-2 block">附件凭证</label><button type="button" onClick={() => setHasImage(!hasImage)} className={cn("p-4 rounded-2xl flex items-center justify-center transition-all", hasImage ? "bg-black text-white" : "bg-gray-50 text-gray-300")}><Camera size={20} /></button></div>
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 mb-2 block">备注与标签</label>
        <textarea placeholder="输入账单详情（支持长文本）..." value={note} onChange={e => setNote(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold focus:outline-none mb-2 min-h-[80px] resize-none" />
        {suggestions.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{suggestions.map((s, i) => <button key={i} type="button" onClick={() => setNote(s)} className="px-3 py-1 bg-gray-100 rounded-full text-[8px] font-bold text-gray-500">{s}</button>)}</div>}
        <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} /><input type="text" placeholder="添加标签..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput) { e.preventDefault(); setTags([...tags, tagInput]); setTagInput(''); } }} className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl text-[10px] font-bold focus:outline-none" /></div>
        <div className="flex flex-wrap gap-2 mt-3">{tags.map((tag, i) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-black flex items-center">#{tag} <X size={10} className="ml-1 cursor-pointer" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} /></span>)}</div>
      </div>
      <div className="flex space-x-3 pt-4">
        {onDelete && <button type="button" onClick={onDelete} className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-[2rem] font-black text-sm">删除</button>}
        <button type="submit" className="flex-[2] py-5 bg-black text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95">保存账单</button>
      </div>
    </form>
  );
}
