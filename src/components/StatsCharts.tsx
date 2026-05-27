import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  eachDayOfInterval,
  isSameDay,
  subMonths,
  subDays,
  getDate,
} from 'date-fns';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Inbox, Activity } from 'lucide-react';

// ── Types ──
type Category = '餐饮' | '交通' | '购物' | '娱乐' | '医疗' | '教育' | '收入' | '其他';
type TransactionType = 'expense' | 'income';
type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'THB' | 'HKD' | 'MYR';
type Mood = 'happy' | 'neutral' | 'sad';
type TimeDimension = 'day' | 'week' | 'month' | 'year';

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
  accountId: string;
  tags?: string[];
  originalAmount?: number;
  currency?: CurrencyCode;
  exchangeRate?: number;
  mood?: Mood;
  paymentMethod?: string;
}

// ── Hardcoded Exchange Rates (to CNY) ──
const EXCHANGE_RATES: Record<string, number> = {
  CNY: 1, USD: 7.2, EUR: 7.8, JPY: 0.046, KRW: 0.0053, THB: 0.19, HKD: 0.93, MYR: 1.55,
};

const convertToCNY = (amount: number, currency?: CurrencyCode): number => {
  const rate = currency ? EXCHANGE_RATES[currency] : 1;
  return amount * (rate || 1);
};

// ── Color Palette ──
const COLORS = {
  orange: '#F97316',
  orangeLight: '#FED7AA',
  purple: '#A855F7',
  purpleLight: '#E9D5FF',
  teal: '#14B8A6',
  tealLight: '#99F6E4',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#3B82F6',
  pink: '#EC4899',
  slate: '#64748B',
  gray: '#6E6E73',
  dark: '#1D1D1F',
  bg: '#F2F2F7',
};

const CATEGORY_COLORS: Record<string, string> = {
  '餐饮': '#F97316', '交通': '#3B82F6', '购物': '#A855F7', '娱乐': '#EC4899',
  '医疗': '#EF4444', '教育': '#6366F1', '收入': '#22C55E', '其他': '#64748B',
  '杂货': '#14B8A6',
};

const CATEGORY_ICONS: Record<string, string> = {
  '餐饮': '🍔', '交通': '🚗', '购物': '🛍️', '娱乐': '🎮',
  '医疗': '🏥', '教育': '📚', '收入': '💰', '其他': '📦', '杂货': '🛒',
};

// ── Format Money ──
const formatMoney = (v: number): string =>
  `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Empty State ──
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center py-24 px-8"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
      className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#F2F2F7] to-[#E8E8ED] flex items-center justify-center mb-6 shadow-lg"
    >
      <Inbox size={40} className="text-[#6E6E73]" />
    </motion.div>
    <h3 className="text-xl font-black text-[#1D1D1F] mb-2">暂无数据</h3>
    <p className="text-sm font-bold text-[#6E6E73] text-center max-w-xs">快去记一笔账吧！你的财务故事从这里开始 📝</p>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex space-x-2">
      {['💰', '📊', '🎯'].map((emoji, i) => (
        <motion.span key={emoji} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="text-2xl">{emoji}</motion.span>
      ))}
    </motion.div>
  </motion.div>
);

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-[rgba(0,0,0,0.06)]">
      <p className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-sm font-black" style={{ color: entry.color || '#1D1D1F' }}>
          {entry.name}: {formatMoney(entry.value)}
        </p>
      ))}
    </div>
  );
};

// ── Generate realistic mock data for charts when real data is sparse ──
const generateMockTrend = (days: number, base: number, volatility: number): number[] => {
  const trend: number[] = [];
  let val = base;
  for (let i = 0; i < days; i++) {
    val += (Math.random() - 0.45) * volatility;
    val = Math.max(val, base * 0.3);
    trend.push(Math.round(val * 100) / 100);
  }
  return trend;
};

// ── Main Component ──
export default function StatsCharts() {
  const [timeDimension, setTimeDimension] = useState<TimeDimension>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [detailTab, setDetailTab] = useState<'day' | 'week' | 'month'>('month');

  // Read transactions from localStorage
  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('transactions');
      if (saved) {
        try { setTransactions(JSON.parse(saved)); }
        catch { setTransactions([]); }
      } else { setTransactions([]); }
    };
    load();
    const handleStorage = (e: StorageEvent) => { if (e.key === 'transactions') load(); };
    const handleFocus = () => load();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(load, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // ── Filter transactions by time dimension ──
  const filteredTransactions = useMemo(() => {
    let start: Date, end: Date;
    switch (timeDimension) {
      case 'day': start = startOfDay(currentDate); end = endOfDay(currentDate); break;
      case 'week': start = startOfWeek(currentDate, { weekStartsOn: 1 }); end = endOfWeek(currentDate, { weekStartsOn: 1 }); break;
      case 'year': start = startOfYear(currentDate); end = endOfYear(currentDate); break;
      case 'month': default: start = startOfMonth(currentDate); end = endOfMonth(currentDate); break;
    }
    return transactions.filter((t) => isWithinInterval(parseISO(t.date), { start, end }));
  }, [transactions, currentDate, timeDimension]);

  // ── Last month transactions for radar comparison ──
  const lastMonthTransactions = useMemo(() => {
    const lastMonth = subMonths(currentDate, 1);
    const start = startOfMonth(lastMonth);
    const end = endOfMonth(lastMonth);
    return transactions.filter((t) => isWithinInterval(parseISO(t.date), { start, end }));
  }, [transactions, currentDate]);

  // ── Summary Cards ──
  const summary = useMemo(() => {
    let totalIncome = 0, totalExpense = 0;
    filteredTransactions.forEach((t) => {
      const cnyAmount = convertToCNY(t.amount, t.currency);
      if (t.type === 'income') totalIncome += cnyAmount;
      else totalExpense += cnyAmount;
    });
    return { income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense };
  }, [filteredTransactions]);

  // ── Radar Data: Expense by Category (this month vs last month) ──
  const radarCategories = ['餐饮', '交通', '购物', '娱乐', '其他', '杂货'];
  const radarData = useMemo(() => {
    const thisMonthMap: Record<string, number> = {};
    const lastMonthMap: Record<string, number> = {};

    filteredTransactions.filter((t) => t.type === 'expense').forEach((t) => {
      const cat = t.category === '教育' || t.category === '医疗' ? '其他' : t.category;
      const key = radarCategories.includes(cat) ? cat : '其他';
      thisMonthMap[key] = (thisMonthMap[key] || 0) + convertToCNY(t.amount, t.currency);
    });

    lastMonthTransactions.filter((t) => t.type === 'expense').forEach((t) => {
      const cat = t.category === '教育' || t.category === '医疗' ? '其他' : t.category;
      const key = radarCategories.includes(cat) ? cat : '其他';
      lastMonthMap[key] = (lastMonthMap[key] || 0) + convertToCNY(t.amount, t.currency);
    });

    return radarCategories.map((cat) => ({
      category: cat,
      '本月': Math.round((thisMonthMap[cat] || 0) * 100) / 100,
      '上月': Math.round((lastMonthMap[cat] || 0) * 100) / 100,
      fullMark: Math.max(thisMonthMap[cat] || 0, lastMonthMap[cat] || 0, 1) * 1.5,
    }));
  }, [filteredTransactions, lastMonthTransactions]);

  // ── Pie Data: This month total expense breakdown ──
  const pieData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    filteredTransactions.filter((t) => t.type === 'expense').forEach((t) => {
      const cat = t.category || '其他';
      categoryMap[cat] = (categoryMap[cat] || 0) + convertToCNY(t.amount, t.currency);
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: CATEGORY_COLORS[name] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // ── Stacked Area Data: Last 30 days daily category trend ──
  const areaData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
    const categories = ['餐饮', '交通', '购物', '娱乐', '其他'];
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayTxns = transactions.filter((t) =>
        t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: dayStart, end: dayEnd })
      );
      const point: any = { date: format(day, 'MM/dd') };
      categories.forEach((cat) => {
        point[cat] = dayTxns
          .filter((t) => {
            const c = t.category === '教育' || t.category === '医疗' ? '其他' : t.category;
            return c === cat;
          })
          .reduce((sum, t) => sum + convertToCNY(t.amount, t.currency), 0);
      });
      return point;
    });
  }, [transactions]);

  // ── Combined Chart Data: 30 days with stacked bars + income/expense lines ──
  const combinedData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayTxns = transactions.filter((t) =>
        isWithinInterval(parseISO(t.date), { start: dayStart, end: dayEnd })
      );
      const expense = dayTxns
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + convertToCNY(t.amount, t.currency), 0);
      const income = dayTxns
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + convertToCNY(t.amount, t.currency), 0);
      const categories = ['餐饮', '交通', '购物', '娱乐', '其他'];
      const point: any = {
        date: format(day, 'MM/dd'),
        dayLabel: getDate(day),
        总支出: Math.round(expense * 100) / 100,
        Income: Math.round(income * 100) / 100,
        Expense: Math.round(expense * 100) / 100,
      };
      categories.forEach((cat) => {
        point[cat] = Math.round(
          dayTxns
            .filter((t) => {
              const c = t.category === '教育' || t.category === '医疗' ? '其他' : t.category;
              return t.type === 'expense' && c === cat;
            })
            .reduce((sum, t) => sum + convertToCNY(t.amount, t.currency), 0) * 100
        ) / 100;
      });
      return point;
    });
  }, [transactions]);

  // ── Time Dimension Label ──
  const getDimensionLabel = (): string => {
    switch (timeDimension) {
      case 'day': return format(currentDate, 'yyyy年MM月dd日');
      case 'week': {
        const s = startOfWeek(currentDate, { weekStartsOn: 1 });
        const e = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(s, 'MM.dd')} - ${format(e, 'MM.dd')}`;
      }
      case 'month': return format(currentDate, 'yyyy年MM月');
      case 'year': return format(currentDate, 'yyyy年');
      default: return '';
    }
  };

  const hasData = filteredTransactions.length > 0;
  const hasExpenseData = filteredTransactions.some((t) => t.type === 'expense');

  // ── Area chart category colors ──
  const areaColors: Record<string, string> = {
    '餐饮': '#F97316', '交通': '#3B82F6', '购物': '#A855F7', '娱乐': '#EC4899', '其他': '#64748B',
  };

  return (
    <div className="w-full space-y-5 pb-8">
      {/* ── Time Dimension Tabs ── */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-[#F2F2F7] rounded-2xl p-1">
          {([{ key: 'day', label: '日' }, { key: 'week', label: '周' }, { key: 'month', label: '月' }, { key: 'year', label: '年' }] as { key: TimeDimension; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTimeDimension(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 ${timeDimension === tab.key ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest">{getDimensionLabel()}</span>
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><TrendingUp size={16} className="text-green-500" /></div>
                <span className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest">收入</span>
              </div>
              <p className="text-lg font-black text-[#1D1D1F] tabular-nums">{formatMoney(summary.income)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><TrendingDown size={16} className="text-red-500" /></div>
                <span className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest">支出</span>
              </div>
              <p className="text-lg font-black text-[#1D1D1F] tabular-nums">{formatMoney(summary.expense)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><Wallet size={16} className="text-blue-500" /></div>
                <span className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest">结余</span>
              </div>
              <p className={`text-lg font-black tabular-nums ${summary.balance >= 0 ? 'text-[#1D1D1F]' : 'text-red-500'}`}>{formatMoney(summary.balance)}</p>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════════
             CHART AREA 1: Radar + Mini Pie + Stacked Area
             ════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Activity size={18} className="text-[#6E6E73]" />
              <span className="text-xs font-black text-[#1D1D1F]">消费足迹 · 支出分类雷达</span>
            </div>

            {!hasExpenseData ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mb-4">
                  <Inbox size={28} className="text-[#6E6E73]" />
                </div>
                <p className="text-base font-black text-[#1D1D1F] mb-1">暂无支出记录</p>
                <p className="text-xs font-bold text-[#6E6E73]">当前时段没有支出数据，去记一笔支出吧 📝</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ── Radar Chart ── */}
              <div className="lg:col-span-2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#E8E8ED" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#6E6E73' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                      name="本月"
                      dataKey="本月"
                      stroke={COLORS.orange}
                      fill={COLORS.orange}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Radar
                      name="上月"
                      dataKey="上月"
                      stroke={COLORS.purple}
                      fill={COLORS.purple}
                      fillOpacity={0.2}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '4px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* ── Mini Pie + Stacked Area ── */}
              <div className="space-y-3">
                {/* Mini Pie */}
                <div className="bg-[#F9FAFB] rounded-xl p-3">
                  <p className="text-[9px] font-black text-[#6E6E73] uppercase tracking-widest mb-1">本月总占比</p>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData.slice(0, 5)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={42}
                          paddingAngle={2}
                        >
                          {pieData.slice(0, 5).map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center">
                    {pieData.slice(0, 5).map((item) => (
                      <span key={item.name} className="text-[8px] font-bold text-[#6E6E73] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mini Stacked Area */}
                <div className="bg-[#F9FAFB] rounded-xl p-3">
                  <p className="text-[9px] font-black text-[#6E6E73] uppercase tracking-widest mb-1">近30天分类趋势</p>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E8E8ED" />
                        <XAxis dataKey="date" tick={false} axisLine={false} />
                        <YAxis tick={false} axisLine={false} />
                        {Object.keys(areaColors).map((cat) => (
                          <Area
                            key={cat}
                            type="monotone"
                            dataKey={cat}
                            stackId="1"
                            stroke={areaColors[cat]}
                            fill={areaColors[cat]}
                            fillOpacity={0.6}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            )}
          </motion.div>

          {/* ════════════════════════════════════════════════════════
             CHART AREA 2: Visualization Details + Combined Chart
             ════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)]"
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity size={18} className="text-[#6E6E73]" />
                <span className="text-xs font-black text-[#1D1D1F]">Visualization Details</span>
              </div>
              <div className="flex space-x-1 bg-[#F2F2F7] rounded-xl p-0.5">
                {([{ key: 'day', label: 'Day' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }] as { key: 'day' | 'week' | 'month'; label: string }[]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all duration-200 ${detailTab === tab.key ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Combined Chart: Stacked Bars + Income/Expense Lines */}
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
                  <XAxis
                    dataKey="dayLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6E6E73' }}
                    dy={6}
                    interval={2}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6E6E73' }}
                    dx={-2}
                    tickFormatter={(v: number) => `¥${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '6px' }}
                    iconType="circle"
                    iconSize={6}
                  />

                  {/* Stacked Bars */}
                  <Bar dataKey="餐饮" stackId="expense" fill="#F97316" barSize={10} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="交通" stackId="expense" fill="#3B82F6" barSize={10} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="购物" stackId="expense" fill="#A855F7" barSize={10} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="娱乐" stackId="expense" fill="#EC4899" barSize={10} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="其他" stackId="expense" fill="#64748B" barSize={10} radius={[2, 2, 0, 0]} />

                  {/* Income Line */}
                  <Line
                    type="monotone"
                    dataKey="Income"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#F97316' }}
                  />

                  {/* Expense Line */}
                  <Line
                    type="monotone"
                    dataKey="Expense"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#A855F7' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
