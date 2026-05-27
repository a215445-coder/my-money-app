import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_KEYS } from '../i18n/keys';
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
  subMonths,
  subDays,
  eachDayOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Inbox, Activity, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

type Category = '餐饮' | '交通' | '购物' | '娱乐' | '医疗' | '教育' | '收入' | '其他';
type TransactionType = 'expense' | 'income';
type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'THB' | 'HKD' | 'MYR';
type PeriodFilter = 'week' | 'month' | 'year';

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
  paymentMethod?: string;
}

const EXCHANGE_RATES: Record<string, number> = {
  CNY: 1, USD: 7.2, EUR: 7.8, JPY: 0.046, KRW: 0.0053, THB: 0.19, HKD: 0.93, MYR: 1.55,
};

const convertToCNY = (amount: number, currency?: CurrencyCode) => amount * (currency ? EXCHANGE_RATES[currency] : 1);

const COLORS = {
  orange: '#F97316',
  purple: '#A855F7',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#3B82F6',
  pink: '#EC4899',
  slate: '#64748B',
};

const CATEGORY_COLORS: Record<string, string> = {
  '餐饮': '#F97316', '交通': '#3B82F6', '购物': '#A855F7', '娱乐': '#EC4899',
  '医疗': '#EF4444', '教育': '#6366F1', '收入': '#22C55E', '其他': '#64748B',
};

const CATEGORY_ICONS: Record<string, string> = {
  '餐饮': '🍔', '交通': '🚗', '购物': '🛍️', '娱乐': '🎮',
  '医疗': '🏥', '教育': '📚', '收入': '💰', '其他': '📦',
};

const CHART_ANIM = {
  isAnimationActive: true,
  animationDuration: 1000,
  animationEasing: 'ease-in-out' as const,
};

const HEAT_LEVELS = ['#EBEBED', '#FED7AA', '#FDBA74', '#FB923C', '#EA580C'];

const EXPENSE_CATS = ['餐饮', '交通', '购物', '娱乐', '其他'] as const;

const getLocaleForNumber = (lng?: string) => (String(lng || '').toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN');

function periodRange(period: PeriodFilter, anchor: Date) {
  switch (period) {
    case 'week':
      return { start: startOfWeek(anchor, { weekStartsOn: 1 }), end: endOfWeek(anchor, { weekStartsOn: 1 }) };
    case 'year':
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
    default:
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
}

function shiftPeriod(period: PeriodFilter, anchor: Date, dir: -1 | 1) {
  if (period === 'week') return subDays(anchor, dir * 7);
  if (period === 'year') return subMonths(anchor, dir * 12);
  return subMonths(anchor, dir);
}

type LegendPayloadItem = { value?: string; color?: string };

/** Wrapping legend — presentation only, keeps labels inside card on narrow screens */
function ChartWrappingLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="recharts-custom-legend flex flex-wrap justify-center items-start gap-x-3 gap-y-2 w-full max-w-full px-2 pt-3 pb-0 m-0 list-none box-border">
      {payload.map((entry, index) => (
        <li
          key={`legend-${index}-${String(entry.value ?? '')}`}
          className="inline-flex items-center gap-1.5 min-w-0 basis-[30%] max-w-[48%] sm:basis-auto sm:max-w-none justify-center"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color || '#6E6E73' }}
          />
          <span className="text-[9px] font-bold text-[#6E6E73] leading-snug text-center break-words hyphens-auto">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

const STATS_CARD =
  'bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden';

export default function StatsCharts() {
  const { t, i18n } = useTranslation();
  const numberLocale = getLocaleForNumber(i18n.language);
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const currencySymbol = isEn ? '$' : '¥';

  const formatMoney = useCallback(
    (v: number) =>
      `${currencySymbol}${v.toLocaleString(numberLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
    [currencySymbol, numberLocale]
  );

  const trCategory = useCallback(
    (cat: string) => {
      const key = `categories.${cat}`;
      const translated = t(key);
      return translated && translated !== key ? translated : cat;
    },
    [t]
  );

  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hoveredHeatKey, setHoveredHeatKey] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState(340);

  useEffect(() => {
    const update = () => setChartWidth(Math.max(280, (typeof window !== 'undefined' ? window.innerWidth : 390) - 56));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('transactions');
        setTransactions(saved ? JSON.parse(saved) : []);
      } catch {
        setTransactions([]);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => { if (e.key === 'transactions') load(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', load);
    const id = setInterval(load, 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', load);
      clearInterval(id);
    };
  }, []);

  const { start, end } = useMemo(() => periodRange(period, anchorDate), [period, anchorDate]);

  const filteredTransactions = useMemo(
    () => transactions.filter((tx) => isWithinInterval(parseISO(tx.date), { start, end })),
    [transactions, start, end]
  );

  const prevRange = useMemo(() => {
    const prevAnchor = shiftPeriod(period, anchorDate, -1);
    return periodRange(period, prevAnchor);
  }, [period, anchorDate]);

  const prevTransactions = useMemo(
    () => transactions.filter((tx) => isWithinInterval(parseISO(tx.date), prevRange)),
    [transactions, prevRange]
  );

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      const amt = convertToCNY(tx.amount, tx.currency);
      if (tx.type === 'income') income += amt;
      else expense += amt;
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const prevSummary = useMemo(() => {
    let expense = 0;
    prevTransactions.forEach((tx) => {
      if (tx.type === 'expense') expense += convertToCNY(tx.amount, tx.currency);
    });
    return { expense };
  }, [prevTransactions]);

  const pctChange = (cur: number, prev: number) => {
    if (prev <= 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const periodLabel = t(
    period === 'week' ? I18N_KEYS.stats.periodWeek : period === 'year' ? I18N_KEYS.stats.periodYear : I18N_KEYS.stats.periodMonth
  );

  const filterPills = useMemo(
    () => [
      { key: 'week' as PeriodFilter, label: t(I18N_KEYS.stats.filterWeek) },
      { key: 'month' as PeriodFilter, label: t(I18N_KEYS.stats.filterMonth) },
      { key: 'year' as PeriodFilter, label: t(I18N_KEYS.stats.filterYear) },
    ],
    [t]
  );

  const trendData = useMemo(() => {
    if (period === 'year') {
      const months = eachMonthOfInterval({ start, end });
      return months.map((m) => {
        const mStart = startOfMonth(m);
        const mEnd = endOfMonth(m);
        const slice = filteredTransactions.filter((tx) =>
          isWithinInterval(parseISO(tx.date), { start: mStart, end: mEnd })
        );
        const expense = slice.filter((x) => x.type === 'expense').reduce((s, x) => s + convertToCNY(x.amount, x.currency), 0);
        const income = slice.filter((x) => x.type === 'income').reduce((s, x) => s + convertToCNY(x.amount, x.currency), 0);
        const point: Record<string, number | string> = {
          label: format(m, isEn ? 'MMM' : 'M月'),
          Income: Math.round(income * 100) / 100,
          Expense: Math.round(expense * 100) / 100,
        };
        EXPENSE_CATS.forEach((cat) => {
          point[cat] = Math.round(
            slice
              .filter((x) => {
                const c = x.category === '教育' || x.category === '医疗' ? '其他' : x.category;
                return x.type === 'expense' && c === cat;
              })
              .reduce((s, x) => s + convertToCNY(x.amount, x.currency), 0) * 100
          ) / 100;
        });
        return point;
      });
    }

    const days =
      period === 'week'
        ? eachDayOfInterval({ start, end })
        : Array.from({ length: 30 }, (_, i) => subDays(end, 29 - i)).filter((d) => d >= start && d <= end);

    return days.map((day) => {
      const dStart = startOfDay(day);
      const dEnd = endOfDay(day);
      const slice = filteredTransactions.filter((tx) => isWithinInterval(parseISO(tx.date), { start: dStart, end: dEnd }));
      const expense = slice.filter((x) => x.type === 'expense').reduce((s, x) => s + convertToCNY(x.amount, x.currency), 0);
      const income = slice.filter((x) => x.type === 'income').reduce((s, x) => s + convertToCNY(x.amount, x.currency), 0);
      const point: Record<string, number | string> = {
        label: period === 'week' ? format(day, 'EEE') : format(day, 'MM/dd'),
        Income: Math.round(income * 100) / 100,
        Expense: Math.round(expense * 100) / 100,
      };
      EXPENSE_CATS.forEach((cat) => {
        point[cat] = Math.round(
          slice
            .filter((x) => {
              const c = x.category === '教育' || x.category === '医疗' ? '其他' : x.category;
              return x.type === 'expense' && c === cat;
            })
            .reduce((s, x) => s + convertToCNY(x.amount, x.currency), 0) * 100
        ) / 100;
      });
      return point;
    });
  }, [period, start, end, filteredTransactions, isEn]);

  const heatmapCells = useMemo(() => {
    const dayCount = period === 'week' ? 7 : 30;
    const days = Array.from({ length: dayCount }, (_, i) => {
      if (period === 'week') return subDays(end, 6 - i);
      return subDays(new Date(), dayCount - 1 - i);
    });
    const maxAmt = Math.max(
      1,
      ...days.map((day) => {
        const dStart = startOfDay(day);
        const dEnd = endOfDay(day);
        return transactions
          .filter((tx) => tx.type === 'expense' && isWithinInterval(parseISO(tx.date), { start: dStart, end: dEnd }))
          .reduce((s, tx) => s + convertToCNY(tx.amount, tx.currency), 0);
      })
    );
    return days.map((day) => {
      const dStart = startOfDay(day);
      const dEnd = endOfDay(day);
      const dayTxns = transactions.filter(
        (tx) => tx.type === 'expense' && isWithinInterval(parseISO(tx.date), { start: dStart, end: dEnd })
      );
      const amount = dayTxns.reduce((s, tx) => s + convertToCNY(tx.amount, tx.currency), 0);
      const count = dayTxns.length;
      const ratio = amount / maxAmt;
      const level = amount <= 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
      const key = format(day, 'yyyy-MM-dd');
      return {
        key,
        amount,
        count,
        level,
        color: HEAT_LEVELS[level],
        displayDate: format(day, isEn ? 'MMM d' : 'M月d日'),
      };
    });
  }, [transactions, period, end, isEn]);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const cat = tx.category || '其他';
        map[cat] = (map[cat] || 0) + convertToCNY(tx.amount, tx.currency);
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: CATEGORY_COLORS[name] || COLORS.slate }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const radarCategories = ['餐饮', '交通', '购物', '娱乐', '其他'];
  const radarData = useMemo(() => {
    const cur: Record<string, number> = {};
    const prev: Record<string, number> = {};
    filteredTransactions.filter((x) => x.type === 'expense').forEach((tx) => {
      const cat = tx.category === '教育' || tx.category === '医疗' ? '其他' : tx.category;
      const key = radarCategories.includes(cat) ? cat : '其他';
      cur[key] = (cur[key] || 0) + convertToCNY(tx.amount, tx.currency);
    });
    prevTransactions.filter((x) => x.type === 'expense').forEach((tx) => {
      const cat = tx.category === '教育' || tx.category === '医疗' ? '其他' : tx.category;
      const key = radarCategories.includes(cat) ? cat : '其他';
      prev[key] = (prev[key] || 0) + convertToCNY(tx.amount, tx.currency);
    });
    return radarCategories.map((cat) => ({
      category: cat,
      current: Math.round((cur[cat] || 0) * 100) / 100,
      previous: Math.round((prev[cat] || 0) * 100) / 100,
    }));
  }, [filteredTransactions, prevTransactions]);

  const detectiveInsight = useMemo(() => {
    const expenses = filteredTransactions.filter((x) => x.type === 'expense');
    if (!expenses.length) return t(I18N_KEYS.stats.detectiveNoExpense);
    if (summary.balance > 0 && summary.income > 0) {
      return t(I18N_KEYS.stats.detectiveIncomeGood, {
        period: periodLabel,
        balance: formatMoney(summary.balance),
      });
    }
    const byCat: Record<string, number> = {};
    let total = 0;
    expenses.forEach((tx) => {
      const amt = convertToCNY(tx.amount, tx.currency);
      byCat[tx.category] = (byCat[tx.category] || 0) + amt;
      total += amt;
    });
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    if (!top || total <= 0) return t(I18N_KEYS.stats.detectiveNoExpense);
    const [cat, amt] = top;
    const pct = Math.round((amt / total) * 100);
    if (cat === '餐饮' && pct >= 30) return t(I18N_KEYS.stats.detectiveDining, { period: periodLabel, pct });
    if (cat === '购物' && pct >= 28) return t(I18N_KEYS.stats.detectiveShopping, { period: periodLabel, pct });
    if (cat === '交通' && pct >= 25) return t(I18N_KEYS.stats.detectiveTransport, { period: periodLabel, pct });
    return t(I18N_KEYS.stats.detectiveBalanced, {
      period: periodLabel,
      category: trCategory(cat),
      pct,
    });
  }, [filteredTransactions, summary, periodLabel, t, formatMoney, trCategory]);

  const dimensionLabel = useMemo(() => {
    const fmt = (k: 'week' | 'month' | 'year') => String(t(`date_formats.filter.${k === 'week' ? 'week' : k === 'year' ? 'year' : 'month'}`));
    if (period === 'week') return `${format(start, fmt('week'))} - ${format(end, fmt('week'))}`;
    if (period === 'year') return format(anchorDate, fmt('year'));
    return format(anchorDate, fmt('month'));
  }, [period, start, end, anchorDate, t]);

  const hoveredHeat = heatmapCells.find((c) => c.key === hoveredHeatKey);

  const GlassTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl px-4 py-3 border border-white/60 bg-white/80 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      >
        <p className="text-[10px] font-black text-[#6E6E73] uppercase tracking-widest mb-1.5">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-black tabular-nums" style={{ color: entry.color || '#1D1D1F' }}>
            {entry.name}: {formatMoney(Number(entry.value) || 0)}
          </p>
        ))}
      </motion.div>
    );
  };

  const hasData = filteredTransactions.length > 0;
  const hasExpense = filteredTransactions.some((x) => x.type === 'expense');
  const expenseDelta = pctChange(summary.expense, prevSummary.expense);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 px-8"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#F2F2F7] to-[#E8E8ED] flex items-center justify-center mb-6 shadow-lg">
          <Inbox size={40} className="text-[#6E6E73]" />
        </div>
        <h3 className="text-xl font-black text-[#1D1D1F] mb-2">{t(I18N_KEYS.stats.emptyTitle)}</h3>
        <p className="text-sm font-bold text-[#6E6E73] text-center max-w-xs">{t(I18N_KEYS.stats.emptyDesc)}</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-10">
      {/* ── Period filter pills + date nav ── */}
      <div className="space-y-3">
        <div className="relative flex p-1 bg-[#F2F2F7] rounded-2xl">
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setPeriod(pill.key)}
              className={`relative flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-150 active:scale-95 z-10 ${
                period === pill.key ? 'text-[#1D1D1F]' : 'text-[#6E6E73]'
              }`}
            >
              {period === pill.key && (
                <motion.div
                  layoutId="stats-period-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{pill.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAnchorDate((d) => shiftPeriod(period, d, -1))}
            className="w-9 h-9 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t(I18N_KEYS.stats.prev)}
          >
            <ChevronLeft size={18} className="text-[#6E6E73]" />
          </button>
          <motion.span
            key={dimensionLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black text-[#6E6E73] tracking-wide"
          >
            {dimensionLabel}
          </motion.span>
          <button
            type="button"
            onClick={() => setAnchorDate((d) => shiftPeriod(period, d, 1))}
            className="w-9 h-9 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t(I18N_KEYS.stats.next)}
          >
            <ChevronRight size={18} className="text-[#6E6E73]" />
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <motion.div layout className="grid grid-cols-3 gap-3">
        {[
          {
            label: t(I18N_KEYS.stats.summaryIncome),
            value: summary.income,
            Icon: TrendingUp,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            valueColor: 'text-[#1D1D1F]',
          },
          {
            label: t(I18N_KEYS.stats.summaryExpense),
            value: summary.expense,
            Icon: TrendingDown,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            valueColor: 'text-[#1D1D1F]',
            delta: expenseDelta,
          },
          {
            label: t(I18N_KEYS.stats.summaryBalance),
            value: summary.balance,
            Icon: Wallet,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            valueColor: summary.balance >= 0 ? 'text-[#1D1D1F]' : 'text-red-500',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl p-4 border border-[rgba(0,0,0,0.04)] shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.Icon size={16} className={card.iconColor} />
              </div>
              <span className="text-[9px] font-black text-[#6E6E73] uppercase tracking-widest leading-tight">{card.label}</span>
            </div>
            <motion.p
              key={`${period}-${card.value}`}
              initial={{ opacity: 0.4, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`text-base font-black tabular-nums ${card.valueColor}`}
            >
              {formatMoney(card.value)}
            </motion.p>
            {'delta' in card && card.delta !== undefined && (
              <p className={`text-[9px] font-bold mt-1 ${card.delta > 0 ? 'text-red-500' : card.delta < 0 ? 'text-emerald-600' : 'text-[#6E6E73]'}`}>
                {t(I18N_KEYS.stats.vsLast)} {card.delta > 0 ? '+' : ''}
                {card.delta}% {card.delta === 0 ? `· ${t(I18N_KEYS.stats.noChange)}` : ''}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main trend chart (linked to period) ── */}
      <motion.div
        layout
        className={STATS_CARD}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-[#6E6E73]" />
          <span className="text-xs font-black text-[#1D1D1F]">{t(I18N_KEYS.stats.trendSectionTitle)}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`trend-${period}-${dimensionLabel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-full overflow-hidden"
            style={{ height: 340, width: '100%' }}
          >
            <BarChart
              width={chartWidth}
              height={340}
              data={trendData}
              margin={{ top: 8, right: 8, left: 0, bottom: 72 }}
              barGap={3}
              barCategoryGap={period === 'year' ? '22%' : period === 'week' ? '32%' : '28%'}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: '#6E6E73' }}
                padding={{ left: 16, right: 16 }}
                interval={period === 'month' ? 2 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: '#6E6E73' }}
                tickFormatter={(v: number) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <RechartsTooltip content={<GlassTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                content={<ChartWrappingLegend />}
                wrapperStyle={{
                  width: '100%',
                  left: 0,
                  right: 0,
                  paddingTop: 12,
                  position: 'relative',
                }}
              />
              <Bar
                dataKey="Income"
                name={t(I18N_KEYS.stats.income)}
                fill="#10b981"
                barSize={8}
                radius={[4, 4, 0, 0]}
                {...CHART_ANIM}
              />
              <Bar
                dataKey="Expense"
                name={t(I18N_KEYS.stats.expense)}
                fill="#ef4444"
                barSize={8}
                radius={[4, 4, 0, 0]}
                {...CHART_ANIM}
              />
            </BarChart>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Radar + mini charts ── */}
      <motion.div layout className={STATS_CARD}>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-[#6E6E73]" />
          <span className="text-xs font-black text-[#1D1D1F]">{t(I18N_KEYS.stats.radarTitle)}</span>
        </div>
        {!hasExpense ? (
          <div className="py-12 text-center">
            <p className="text-sm font-black text-[#1D1D1F]">{t(I18N_KEYS.stats.noExpenseTitle)}</p>
            <p className="text-xs font-bold text-[#6E6E73] mt-1">{t(I18N_KEYS.stats.noExpenseDesc)}</p>
          </div>
        ) : (
          <>
            <div style={{ height: 280 }} className="w-full flex justify-center">
              <RadarChart width={chartWidth} height={280} data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="#E8E8ED" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fontWeight: 700, fill: '#6E6E73' }} tickFormatter={(v) => trCategory(String(v))} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name={t('month')} dataKey="current" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.22} strokeWidth={2} {...CHART_ANIM} />
                <Radar
                  name={t('last_month')}
                  dataKey="previous"
                  stroke={COLORS.purple}
                  fill={COLORS.purple}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  {...CHART_ANIM}
                />
                <RechartsTooltip content={<GlassTooltip />} />
              </RadarChart>
            </div>
            <div className="flex gap-3 mt-3">
              <div className="flex-1 bg-[#F9FAFB] rounded-xl p-3">
                <p className="text-[9px] font-black text-[#6E6E73] uppercase tracking-widest mb-2">{t(I18N_KEYS.stats.monthlyShare)}</p>
                <PieChart width={140} height={120}>
                  <Pie data={pieData.slice(0, 5)} dataKey="value" innerRadius={26} outerRadius={40} paddingAngle={2} {...CHART_ANIM}>
                    {pieData.slice(0, 5).map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex-1 bg-[#F9FAFB] rounded-xl p-3">
                <p className="text-[9px] font-black text-[#6E6E73] uppercase tracking-widest mb-2">{t(I18N_KEYS.stats.last30Trend)}</p>
                <AreaChart width={140} height={120} data={trendData.slice(-14)}>
                  <Area type="monotone" dataKey="Expense" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.25} {...CHART_ANIM} />
                </AreaChart>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ── 30-day spending heatmap ── */}
      <motion.div
        layout
        className={STATS_CARD}
      >
        <div className="mb-1">
          <h3 className="text-sm font-black text-[#1D1D1F]">{t(I18N_KEYS.stats.footprintTitle)}</h3>
          <p className="text-[10px] font-bold text-[#6E6E73] mt-0.5">{t(I18N_KEYS.stats.footprintSubtitle)}</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`heat-${period}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`grid gap-1.5 mt-4 ${period === 'week' ? 'grid-cols-7' : 'grid-cols-10'}`}
          >
            {heatmapCells.map((cell) => (
              <motion.button
                key={cell.key}
                type="button"
                onMouseEnter={() => setHoveredHeatKey(cell.key)}
                onMouseLeave={() => setHoveredHeatKey(null)}
                onTouchStart={() => setHoveredHeatKey(cell.key)}
                whileTap={{ scale: 0.92 }}
                className="aspect-square rounded-md transition-shadow"
                style={{
                  backgroundColor: cell.color,
                  boxShadow: hoveredHeatKey === cell.key ? '0 0 0 2px #1D1D1F22, 0 4px 12px rgba(249,115,22,0.35)' : undefined,
                }}
                aria-label={cell.displayDate}
              />
            ))}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            {HEAT_LEVELS.map((c) => (
              <span key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-[9px] font-bold text-[#6E6E73]">
            {t(I18N_KEYS.stats.heatmapLegendLess)} — {t(I18N_KEYS.stats.heatmapLegendMore)}
          </span>
        </div>
        <AnimatePresence>
          {hoveredHeat && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-[rgba(0,0,0,0.06)] shadow-lg"
            >
              <p className="text-xs font-black text-[#1D1D1F]">
                {hoveredHeat.amount > 0
                  ? t(I18N_KEYS.stats.heatmapDaySummary, {
                      date: hoveredHeat.displayDate,
                      amount: formatMoney(hoveredHeat.amount),
                    })
                  : t(I18N_KEYS.stats.heatmapNoData)}
              </p>
              {hoveredHeat.count > 0 && (
                <p className="text-[10px] font-bold text-[#6E6E73] mt-1">
                  {t(I18N_KEYS.stats.heatmapDayCount, { count: hoveredHeat.count })}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Ledger detective ── */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-5 bg-gradient-to-br from-[#FFF7ED] via-white to-[#F0FDF4] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-sm font-black text-[#1D1D1F]">{t(I18N_KEYS.stats.detectiveTitle)}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${period}-${detectiveInsight}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-[13px] font-bold text-[#3A3A3C] leading-relaxed"
          >
            {detectiveInsight}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
