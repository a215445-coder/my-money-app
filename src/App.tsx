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
  ChevronDown,
  Lock,
  LineChart as LineIcon,
  Search,
  Cloud,
  Camera,
  Hash,
  Smile,
  Globe,
  ArrowRightLeft,
  User,
  Languages,
  Share2,
  Star,
  Moon,
  Sun,
  LogOut,
  Compass,
  Zap as ZapIcon,
  Calculator,
  AlertTriangle,
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
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import type { Transaction, Category, TransactionType, Account, CurrencyCode, Currency } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type OnboardingSlide = {
  title: string;
  description: string;
  Icon: React.ElementType;
  bg: string;
  accent: string;
  cta?: string;
};

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: '理财实验室',
    description: '您的私人财务分析师，洞察每笔开支。',
    Icon: LineIcon,
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950',
    accent: 'from-indigo-400 to-purple-400',
  },
  {
    title: '极速记账',
    description: '单手操作，丝滑弹出，随时随地记录生活。',
    Icon: ZapIcon,
    bg: 'bg-gradient-to-br from-fuchsia-950 via-slate-950 to-slate-950',
    accent: 'from-pink-400 to-fuchsia-400',
  },
  {
    title: '财富自测',
    description: '科学的 5:3:2 分配，让每一分钱都有归宿。',
    Icon: Calculator,
    bg: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950',
    accent: 'from-emerald-400 to-cyan-400',
  },
  {
    title: '云端守护',
    description: '数据实时备份，多设备同步，永不丢失。',
    Icon: Cloud,
    bg: 'bg-gradient-to-br from-sky-950 via-slate-950 to-slate-950',
    accent: 'from-sky-400 to-indigo-400',
  },
  {
    title: '开启旅程',
    description: '进入登录页，开始你的专业理财体验。',
    Icon: User,
    bg: 'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950',
    accent: 'from-amber-400 to-orange-400',
    cta: '进入登录',
  },
];

function OnboardingScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index];

  const go = (next: number) => setIndex(Math.max(0, Math.min(ONBOARDING_SLIDES.length - 1, next)));

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className={cn("absolute inset-0", slide.bg)}
        />
      </AnimatePresence>

      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[120px] bg-white/10" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[140px] bg-white/10" />

      <div className="absolute inset-0 flex flex-col justify-between p-8">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">PRO ONBOARDING</div>
          <div className="flex items-center space-x-2">
            {ONBOARDING_SLIDES.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === index ? 18 : 6, opacity: i === index ? 1 : 0.35 }}
                transition={{ type: "spring", damping: 20, stiffness: 250 }}
                className={cn("h-1.5 rounded-full", i === index ? "bg-white" : "bg-white")}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const swipe = info.offset.x;
              if (swipe < -80) go(index + 1);
              if (swipe > 80) go(index - 1);
            }}
            initial={{ opacity: 0, scale: 0.98, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: -40 }}
            transition={{ type: "spring", damping: 25, stiffness: 240 }}
            className="w-full max-w-md"
          >
            <div className="relative rounded-[3.25rem] p-10 border border-white/15 bg-white/8 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className={cn("absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[90px] opacity-60 bg-gradient-to-br", slide.accent)} />
              <div className={cn("w-16 h-16 rounded-[1.75rem] flex items-center justify-center bg-gradient-to-br shadow-lg border border-white/15", slide.accent)} >
                <slide.Icon size={30} className="text-black/80" />
              </div>
              <div className="mt-10">
                <h1 className="text-4xl font-black tracking-tight">{slide.title}</h1>
                <p className="mt-4 text-white/70 text-base font-bold leading-relaxed">{slide.description}</p>
              </div>

              <div className="mt-10 flex items-center justify-between">
                <button
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  className={cn(
                    "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                    index === 0 ? "border-white/10 text-white/30" : "border-white/15 text-white/80 hover:bg-white/5"
                  )}
                >
                  上一步
                </button>

                {index < ONBOARDING_SLIDES.length - 1 ? (
                  <button
                    onClick={() => go(index + 1)}
                    className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white text-black shadow-lg active:scale-95 transition-all"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    onClick={onGoLogin}
                    className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white text-black shadow-lg active:scale-95 transition-all"
                  >
                    {slide.cta || '进入登录'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pb-[env(safe-area-inset-bottom)] text-center text-[10px] font-bold text-white/40">
          左右滑动切换 · 单手可操作
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onAuthed }: { onAuthed: () => void }) {
  const [phone, setPhone] = useState('');
  return (
    <div className="fixed inset-0 z-[300] overflow-hidden text-white bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[140px] bg-indigo-500/20" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[140px] bg-fuchsia-500/20" />
      <div className="absolute inset-0 p-8 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-black tracking-tight">欢迎回来</h1>
            <p className="mt-3 text-white/60 text-sm font-bold">登录后即可同步多设备数据与 Pro 报表能力。</p>

            <div className="mt-10 rounded-[3rem] p-8 border border-white/15 bg-white/8 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold placeholder:text-white/30 focus:outline-none focus:ring-4 ring-white/10"
                  />
                </div>

                <button
                  onClick={onAuthed}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm shadow-lg active:scale-95 transition-all"
                >
                  手机号登录
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onAuthed}
                    className="py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-black text-xs active:scale-95 transition-all"
                  >
                    微信登录
                  </button>
                  <button
                    onClick={onAuthed}
                    className="py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-black text-xs active:scale-95 transition-all"
                  >
                    Google 登录
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] font-bold text-white/40">
              继续即代表你同意隐私政策与用户协议
            </div>
          </div>
        </div>
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

const CURRENCIES: Currency[] = [
  { code: 'CNY', name: '人民币', flag: '🇨🇳', symbol: '¥' },
  { code: 'USD', name: '美元', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: '欧元', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', name: '日元', flag: '🇯🇵', symbol: '¥' },
  { code: 'KRW', name: '韩元', flag: '🇰🇷', symbol: '₩' },
  { code: 'THB', name: '泰铢', flag: '🇹🇭', symbol: '฿' },
  { code: 'HKD', name: '港币', flag: '🇭🇰', symbol: '$' },
];

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
  { id: 'ac-1', name: 'wechat', type: 'wechat', balance: 0, icon: '📱' },
  { id: 'ac-2', name: 'alipay', type: 'alipay', balance: 0, icon: '💳' },
  { id: 'ac-3', name: 'bank', type: 'bank', balance: 0, icon: '🏦' },
  { id: 'ac-4', name: 'cash', type: 'cash', balance: 0, icon: '💵' },
];

type FilterType = 'today' | 'week' | 'month' | 'year';

export default function App() {
  const { t, i18n } = useTranslation();
  // --- Core State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [budget] = useState<number>(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? Number(saved) : 5000;
  });

  // --- UI State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart' | 'calendar' | 'discovery'>('list');
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('onboarding_done') === 'true');
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem('auth_done') === 'true');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // --- Pro Features State ---
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProActivated] = useState(true);
  const [timeContext, setTimeContext] = useState<'morning' | 'afternoon' | 'evening'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  });

  // --- Discovery State ---
  const [monthlySalary, setSalary] = useState<number>(10000);
  const WEALTH_TIPS = useMemo(() => [
    "区分‘想要’和‘需要’，是理财的第一步。",
    "记账是为了更好的花钱，而不是限制你的生活。",
    "先付给自己：每月发工资先存下一部分，剩下的才是能花的。",
    "复利是世界第八大奇迹，越早理财越好。",
    "不要为打翻的牛奶哭泣，也不要为昨天的超支后悔。",
    "你的钱包决定你的生活质量，你的记账习惯决定你的钱包厚度。",
    "理财不在于钱多钱少，而在于习惯的养成。",
    "每一分存下的钱，都是通往自由的基石。",
    "记得给未来的自己留一份礼物。",
    "理性消费，快乐记账。😊"
  ], []);

  const [wealthTip, setWealthTip] = useState(WEALTH_TIPS[0]);

  useEffect(() => {
    if (activeTab === 'discovery') {
      setWealthTip(WEALTH_TIPS[Math.floor(Math.random() * WEALTH_TIPS.length)]);
    }
  }, [activeTab, WEALTH_TIPS]);

  // --- Privacy & Theme ---
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [pin] = useState(() => localStorage.getItem('privacy_pin') || '');
  const [isLockEnabled] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [inputPin, setInputPin] = useState('');
  const [themeKey] = useState<ThemeKey>(() => (localStorage.getItem('app_theme') as ThemeKey) || 'black');
  const theme = THEMES[themeKey];

  // --- Settings & i18n ---
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('app_dark_mode') === 'true');
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [showOriginalCurrency, setShowOriginalCurrency] = useState<Record<string, boolean>>({});

  const toggleCurrency = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOriginalCurrency(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('exchange_rates');
    return saved ? JSON.parse(saved) : { USD: 7.25, EUR: 7.85, JPY: 0.046, KRW: 0.0053, THB: 0.19, HKD: 0.93, CNY: 1 };
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/CNY');
        const data = await res.json();
        if (data.rates) {
          const newRates: Record<string, number> = {};
          CURRENCIES.forEach(c => {
            if (data.rates[c.code]) {
              newRates[c.code] = 1 / data.rates[c.code];
            }
          });
          const now = format(new Date(), 'HH:mm');
          setRates(newRates);
          localStorage.setItem('exchange_rates', JSON.stringify(newRates));
          localStorage.setItem('last_rate_update', now);
        }
      } catch (e) {
        console.error('Failed to fetch rates', e);
      }
    };
    fetchRates();

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeContext('morning');
    else if (hour >= 12 && hour < 18) setTimeContext('afternoon');
    else setTimeContext('evening');
  }, []);

  const parseVoiceIntent = (text: string) => {
    const amountMatch = text.match(/(\d+(\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;

    let category: Category = '其他';
    const text_lower = text.toLowerCase();

    const categoryMap: Record<string, string[]> = {
      '餐饮': ['吃', '饭', '餐', '肯德基', '麦当劳', '火锅', '奶茶', '咖啡', '零食', '超市', '水果'],
      '交通': ['打车', '地铁', '公交', '加油', '油费', '停车', '机票', '火车', '共享单车'],
      '购物': ['买', '购', '衣服', '鞋', '包', '化妆品', '电器', '手机'],
      '娱乐': ['玩', '游戏', '影', 'ktv', '酒吧', '旅游', '门票'],
      '医疗': ['药', '医', '看病', '挂号', '手术', '体检'],
      '教育': ['学', '书', '课', '培训', '考试', '文具'],
      '收入': ['工资', '收入', '赚', '红包', '奖金', '兼职', '理财收益']
    };

    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => text_lower.includes(k))) {
        category = cat as Category;
        break;
      }
    }

    const note = text
      .replace(/(\d+(\.\d+)?)/, '')
      .replace(/块|元|钱|花了|支出|收入|买了|去吃/g, '')
      .trim();

    return { amount, category, note: note || '语音记账' };
  };

  const exportAsImage = async () => {
    const element = document.getElementById('stats-content');
    if (!element) return;

    // Temporarily show branding for export
    const branding = element.querySelector('.show-on-export');
    if (branding) branding.classList.remove('hidden');

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('stats-content');
          if (clonedElement) {
            const b = clonedElement.querySelector('.show-on-export');
            if (b) b.classList.remove('hidden');
          }
        }
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `我的账单总结_${format(currentDate, 'yyyy-MM')}.png`;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      if (branding) branding.classList.add('hidden');
    }
  };

  // --- Persistence ---
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('monthly_budget', budget.toString()), [budget]);
  useEffect(() => {
    localStorage.setItem('privacy_lock_enabled', isLockEnabled.toString());
    localStorage.setItem('privacy_pin', pin);
  }, [isLockEnabled, pin]);
  useEffect(() => localStorage.setItem('app_theme', themeKey), [themeKey]);
  useEffect(() => localStorage.setItem('app_lang', i18n.language), [i18n.language]);
  useEffect(() => localStorage.setItem('app_dark_mode', isDarkMode.toString()), [isDarkMode]);

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

    const today = new Date();

    // MoM comparison
    const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));
    const lastMonthExpense = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: lastMonthStart, end: lastMonthEnd }))
      .reduce((sum, t) => sum + t.amount, 0);

    const momDiff = expense - lastMonthExpense;
    const momChange = lastMonthExpense === 0 ? 0 : (momDiff / lastMonthExpense) * 100;

    // Daily budget
    const daysInMonthCount = differenceInDays(endOfMonth(currentDate), today) + 1;
    const remainingBudget = Math.max(budget - expense, 0);
    const dailyBudget = daysInMonthCount > 0 ? remainingBudget / daysInMonthCount : 0;

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

    // Last Week Comparison
    const lastWeekStart = subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
    const lastWeekEnd = subDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 7);
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const lastWeekExpense = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: lastWeekStart, end: lastWeekEnd }))
      .reduce((sum, t) => sum + t.amount, 0);
    const currentWeekExpense = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: currentWeekStart, end: currentWeekEnd }))
      .reduce((sum, t) => sum + t.amount, 0);

    const weekDiff = currentWeekExpense - lastWeekExpense;
    const weekChange = lastWeekExpense === 0 ? 0 : (weekDiff / lastWeekExpense) * 100;

    // Forecast logic
    const daysPassed = differenceInDays(today, startOfMonth(currentDate)) + 1;
    const totalDaysInMonth = differenceInDays(endOfMonth(currentDate), startOfMonth(currentDate)) + 1;
    const predictedTotal = (expense / Math.max(daysPassed, 1)) * totalDaysInMonth;
    const isOverBudgetRisk = predictedTotal > budget;

    // Radar Data (MoM Comparison)
    const lastMonthCategoryMap: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: lastMonthStart, end: lastMonthEnd }))
      .forEach(t => {
        lastMonthCategoryMap[t.category] = (lastMonthCategoryMap[t.category] || 0) + t.amount;
      });

    const radarData = CATEGORIES.filter(c => c.label !== '收入').map(c => ({
      subject: c.label,
      A: (categoryMap[c.label] || 0),
      B: (lastMonthCategoryMap[c.label] || 0),
      fullMark: Math.max(...Object.values(categoryMap), ...Object.values(lastMonthCategoryMap), 100)
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

    return {
      income,
      expense,
      balance: income - expense,
      budgetUsage: (expense / budget) * 100,
      momDiff,
      momChange,
      dailyBudget,
      pieData,
      filtered,
      trendData,
      heatmapData,
      weekChange,
      predictedTotal,
      isOverBudgetRisk,
      radarData
    };
  }, [transactions, budget, currentDate, filterType, searchQuery]);

  const totalAssets = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

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

  const handleLogout = () => {
    localStorage.removeItem('auth_done');
    setIsAuthed(false);
    setIsLogoutDialogOpen(false);
    setIsBudgetModalOpen(false);
    setIsMenuOpen(false);
  };

  if (!hasOnboarded) {
    return (
      <OnboardingScreen
        onGoLogin={() => {
          localStorage.setItem('onboarding_done', 'true');
          setHasOnboarded(true);
        }}
      />
    );
  }

  if (!isAuthed) {
    return (
      <LoginScreen
        onAuthed={() => {
          localStorage.setItem('auth_done', 'true');
          setIsAuthed(true);
        }}
      />
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 pb-32 font-sans relative overflow-hidden",
      isDarkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900",
      !isDarkMode && timeContext === 'morning' && "bg-gradient-to-br from-orange-50 via-white to-blue-50",
      !isDarkMode && timeContext === 'afternoon' && "bg-gradient-to-br from-blue-50 via-white to-emerald-50",
      !isDarkMode && timeContext === 'evening' && "bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-50",
      isDarkMode && "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950"
    )}>
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Privacy Lock Screen */}
      {isLocked && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center p-8", isDarkMode ? "bg-slate-900" : "bg-white")}>
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce", theme.primary)}>
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">安全验证</h2>
          <div className="flex space-x-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("w-4 h-4 rounded-full border-2", inputPin.length >= i ? theme.primary : (isDarkMode ? "border-slate-700" : "border-gray-200"))} />
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
              }} className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-black active:scale-90", isDarkMode ? "bg-slate-800" : "bg-gray-50", n === '' && "invisible")}>
                {n === 'del' ? <X size={20} /> : n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Menu */}
      <div className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity", isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsMenuOpen(false)} />
      <aside className={cn(
        "fixed top-0 left-0 h-full w-[280px] z-[70] shadow-2xl transition-transform duration-500 rounded-r-[2.5rem] p-8",
        isDarkMode ? "bg-slate-800 text-white" : "bg-white text-gray-900",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", isDarkMode ? "bg-white text-black" : "bg-black text-white")}>
              <Wallet size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter">我的账本</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-50")}><X size={20} /></button>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'list', label: t('bill_detail'), icon: <History size={20} /> },
            { id: 'chart', label: t('stats'), icon: <PieIcon size={20} /> },
            { id: 'calendar', label: t('calendar'), icon: <CalendarIcon size={20} /> },
            { id: 'discovery', label: '发现', icon: <Compass size={20} /> },
            { id: 'settings', label: t('settings'), icon: <Settings size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => {
              if (item.id === 'settings') setIsBudgetModalOpen(true);
              else setActiveTab(item.id as any);
              setIsMenuOpen(false);
            }} className={cn(
              "w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all",
              activeTab === item.id ? theme.primary + " text-white shadow-lg" : (isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50")
            )}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-6 pt-12 space-y-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsMenuOpen(true)} className={cn("p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
              <Menu size={20} />
            </button>
            <button onClick={() => setIsVoiceModalOpen(true)} className={cn("p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{getFilterLabel()}</p>
            <div className="flex items-center justify-center space-x-4">
              <button onClick={() => changeDate('prev')} className="p-1 hover:scale-125 transition-transform"><ChevronLeft size={16} /></button>
              <h1 onClick={() => setIsFilterModalOpen(true)} className="text-xl font-black cursor-pointer hover:opacity-70">{t('app_name')}</h1>
              <button onClick={() => changeDate('next')} className="p-1 hover:scale-125 transition-transform"><ChevronRight size={16} /></button>
            </div>
          </div>
          <button onClick={() => setIsSearchModalOpen(true)} className={cn("p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
            <Search size={20} />
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {activeTab === 'list' && (
              <div className="space-y-8">
                {/* Summary Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={cn(
                    "p-10 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group border border-white/20",
                    theme.primary
                  )}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-125" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-3">{t('total_assets')}</p>
                      <p className="text-5xl font-black tracking-tighter drop-shadow-lg">¥{formatCurrency(totalAssets)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>{i18n.language}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 transition-transform hover:scale-105">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-red-400/20 rounded-lg flex items-center justify-center">
                          <TrendingDown size={12} className="text-red-200" />
                        </div>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t('expense')}</span>
                      </div>
                      <p className="text-2xl font-black">¥{formatCurrency(stats.expense)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 transition-transform hover:scale-105">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center">
                          <TrendingUp size={12} className="text-green-200" />
                        </div>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t('income')}</span>
                      </div>
                      <p className="text-2xl font-black">¥{formatCurrency(stats.income)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Budget Progress Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={cn(
                    "rounded-[3rem] p-8 shadow-xl border backdrop-blur-xl transition-all",
                    isDarkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-white/40 border-white/50"
                  )}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg", theme.primary)}>
                        <PieIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('monthly_budget')}</span>
                        <p className="text-lg font-black">¥{formatCurrency(budget)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">剩余额度</p>
                      <p className={cn("text-lg font-black", stats.budgetUsage > 90 ? "text-red-500" : "text-indigo-500")}>
                        ¥{formatCurrency(Math.max(budget - stats.expense, 0))}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-gray-100/50 rounded-full overflow-hidden mb-6 p-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.budgetUsage, 100)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-all relative overflow-hidden",
                        stats.budgetUsage > 90 ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-gradient-to-r from-indigo-500 to-purple-400"
                      )}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center space-x-2">
                      <div className={cn("px-2 py-1 rounded-md text-[8px] font-black uppercase", stats.budgetUsage > 90 ? "bg-red-100 text-red-500" : "bg-indigo-100 text-indigo-500")}>
                        已用 {stats.budgetUsage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <Calculator size={14} />
                      <span className="text-[10px] font-black uppercase tracking-tight">日均可用: ¥{stats.dailyBudget.toFixed(0)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Transactions List */}
                {stats.filtered.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-400 font-bold italic">{t('no_bills')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(stats.filtered.reduce((acc, t) => {
                      const date = t.date.split('T')[0];
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(t);
                      return acc;
                    }, {} as Record<string, Transaction[]>)).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
                      <div key={date}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">{format(parseISO(date), 'MM月dd日 EEEE', { locale: i18n.language === 'zh-CN' ? zhCN : undefined })}</p>
                        <div className={cn("rounded-[2.5rem] shadow-sm border overflow-hidden", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}>
                          {items.map((item, idx) => (
                            <div key={item.id} onClick={() => { setEditingTransaction(item); setIsModalOpen(true); }} className={cn("p-5 flex items-center active:bg-gray-50 transition-colors group", idx !== items.length - 1 && "border-b", isDarkMode ? "border-slate-700" : "border-gray-50")}>
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm mr-4", CATEGORIES.find(c => c.label === item.category)?.color)}>
                                {CATEGORIES.find(c => c.label === item.category)?.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sm">{t(`categories.${item.category}`)}</span>
                                  <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-bold uppercase">{t(`accounts.${accounts.find(a => a.id === item.accountId)?.name}`)}</span>
                                  {item.mood && (
                                    <span className="text-[10px] ml-1 opacity-80">
                                      {item.mood === 'happy' ? '😊' : item.mood === 'neutral' ? '😐' : '😭'}
                                    </span>
                                  )}
                                </div>
                                {item.note && <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.note}</p>}
                                <div className="flex flex-wrap gap-1 mt-1 items-center">
                                  {item.tags?.map(tag => <span key={tag} className="text-[8px] text-indigo-400 font-bold">#{tag}</span>)}
                                  {item.hasImage && <Camera size={10} className="text-gray-300 ml-1" />}
                                  {item.currency && item.currency !== 'CNY' && (
                                    <div className="flex items-center space-x-1 ml-1 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                      <Globe size={8} className="text-blue-400" />
                                      <span className="text-[8px] text-blue-400 font-black">{CURRENCIES.find(c => c.code === item.currency)?.flag} {item.originalAmount?.toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => toggleCurrency(item.id, e)}
                                  className="text-right cursor-pointer"
                                >
                                  <div className={cn("font-black text-sm", item.type === 'expense' ? "text-red-500" : "text-green-500")}>
                                    {item.type === 'expense' ? '-' : '+'}
                                    {showOriginalCurrency[item.id] && item.currency && item.currency !== 'CNY'
                                      ? `${CURRENCIES.find(c => c.code === item.currency)?.symbol}${item.originalAmount?.toFixed(2)}`
                                      : `¥${formatCurrency(item.amount)}`
                                    }
                                  </div>
                                  {item.currency && item.currency !== 'CNY' && (
                                    <p className="text-[8px] text-gray-400 font-bold mt-0.5">
                                      {showOriginalCurrency[item.id] ? `≈ ¥${formatCurrency(item.amount)}` : `${CURRENCIES.find(c => c.code === item.currency)?.flag} ${item.originalAmount?.toFixed(2)}`}
                                    </p>
                                  )}
                                </motion.div>
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
              <div id="stats-content" className="space-y-6 pb-10 p-4">
                {/* Branding for Export */}
                <div className="hidden show-on-export mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", theme.primary)}>
                        <Wallet size={24} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black tracking-tighter">我的账本 · 专业版</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{getFilterLabel()} 消费月报</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase">Pro 会员专享</p>
                      <div className="flex items-center justify-end space-x-1 text-amber-500">
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pro Forecast Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("rounded-[2.5rem] p-8 shadow-sm border relative overflow-hidden", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Pro Analysis</div>
                  </div>
                  <h3 className="font-black text-lg mb-6 flex items-center"><TrendingUp size={20} className="mr-2 text-amber-500" />{t('spending_forecast')}</h3>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">预计本月总支出</p>
                      <p className="text-3xl font-black">¥{formatCurrency(stats.predictedTotal)}</p>
                    </div>
                    <div className={cn("text-right", stats.isOverBudgetRisk ? "text-red-500" : "text-green-500")}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">超支风险</p>
                      <p className="text-lg font-black">{stats.isOverBudgetRisk ? '极高 ⚠️' : '极低 ✅'}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.predictedTotal / budget) * 100, 100)}%` }}
                      className={cn("h-full", stats.isOverBudgetRisk ? "bg-red-500" : theme.primary)}
                    />
                  </div>
                  <p className="mt-4 text-[10px] text-gray-400 font-bold leading-relaxed">
                    基于您本月前 {differenceInDays(new Date(), startOfMonth(currentDate)) + 1} 天的消费频率，预测月底总额将达到 ¥{formatCurrency(stats.predictedTotal)}。
                    {stats.isOverBudgetRisk ? "建议削减非必要开支。" : "目前预算控制良好，请继续保持。"}
                  </p>
                </motion.div>

                {/* Radar Comparison Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}
                >
                  <h3 className="font-black text-lg mb-6 flex items-center"><PieIcon size={20} className="mr-2 text-indigo-500" />{t('spending_radar')}</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                        <PolarGrid stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                        <Radar
                          name="本月"
                          dataKey="A"
                          stroke={themeKey === 'black' ? (isDarkMode ? '#fff' : '#000') : theme.text.replace('text-', '')}
                          fill={themeKey === 'black' ? (isDarkMode ? '#fff' : '#000') : theme.text.replace('text-', '')}
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="上月"
                          dataKey="B"
                          stroke="#94a3b8"
                          fill="#94a3b8"
                          fillOpacity={0.3}
                        />
                        <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-3 h-3 rounded-full", theme.primary)} />
                      <span className="text-[10px] font-black text-gray-400">本月</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <span className="text-[10px] font-black text-gray-400">上月</span>
                    </div>
                  </div>
                </motion.div>

                <div className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}>
                  <h3 className="font-black text-lg mb-6 flex items-center"><LineIcon size={20} className="mr-2 text-blue-500" />{t('trend_title')}</h3>
                  {stats.trendData.some(d => d.amount > 0) ? (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trendData}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={themeKey === 'black' ? (isDarkMode ? '#fff' : '#000') : theme.text.replace('text-', '')} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={themeKey === 'black' ? (isDarkMode ? '#fff' : '#000') : theme.text.replace('text-', '')} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                          <YAxis hide />
                          <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="amount" stroke={themeKey === 'black' ? (isDarkMode ? '#fff' : '#000') : theme.text.replace('text-', '')} fillOpacity={1} fill="url(#colorAmount)" strokeWidth={4} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className={cn("h-48 flex flex-col items-center justify-center text-gray-300 rounded-2xl border-2 border-dashed", isDarkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-100")}>
                      <Smile size={32} className="mb-2 opacity-20" />
                      <p className="text-xs font-bold">{t('no_bills')}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={exportAsImage}
                    className={cn("px-8 py-4 rounded-full flex items-center space-x-3 shadow-xl active:scale-95 transition-all", theme.primary, "text-white font-black")}
                  >
                    <Share2 size={20} />
                    <span>生成精美账单长图</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'discovery' && (
              <div className="space-y-6">
                {/* Wealth Tip Card */}
                <div className={cn("p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden", theme.primary)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12" />
                  <div className="flex items-center space-x-3 mb-4">
                    <Smile className="text-white" size={24} />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">理财实验室 · 省钱小贴士</span>
                  </div>
                  <p className="text-white text-lg font-black leading-relaxed italic">“{wealthTip}”</p>
                </div>

                {/* Wealth Calculator Card */}
                <div className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}>
                  <h3 className="font-black text-lg mb-6 flex items-center"><Calculator size={20} className="mr-2 text-indigo-500" />财富自测 (5:3:2)</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">输入预计月薪</label>
                      <input
                        type="number"
                        value={monthlySalary}
                        onChange={e => setSalary(Number(e.target.value))}
                        className={cn("w-full bg-transparent text-3xl font-black focus:outline-none border-b-2 transition-colors pb-2", isDarkMode ? "border-slate-700 focus:border-white" : "border-gray-100 focus:border-black")}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { label: '生活开支 (50%)', amount: monthlySalary * 0.5, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: '理财储蓄 (30%)', amount: monthlySalary * 0.3, color: 'text-green-500', bg: 'bg-green-50' },
                        { label: '娱乐享受 (20%)', amount: monthlySalary * 0.2, color: 'text-pink-500', bg: 'bg-pink-50' },
                      ].map(item => (
                        <div key={item.label} className={cn("p-4 rounded-2xl flex justify-between items-center", isDarkMode ? "bg-slate-700" : item.bg)}>
                          <span className="text-xs font-bold opacity-60">{item.label}</span>
                          <span className={cn("text-lg font-black", isDarkMode ? "text-white" : item.color)}>¥{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spending Warning Card */}
                <div className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}>
                  <h3 className="font-black text-lg mb-6 flex items-center"><AlertTriangle size={20} className="mr-2 text-orange-500" />消费预警</h3>
                  <div className="flex flex-col items-center py-6">
                    <div className={cn(
                      "w-32 h-32 rounded-full border-[10px] flex flex-col items-center justify-center transition-all",
                      stats.weekChange > 20 ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"
                    )}>
                      <span className={cn("text-2xl font-black", stats.weekChange > 20 ? "text-red-500" : "text-green-500")}>
                        {stats.weekChange > 0 ? '+' : ''}{stats.weekChange.toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-6 text-sm font-bold text-gray-400">
                      较上周同期 {stats.weekChange > 0 ? '多花' : '少花'} ¥{formatCurrency(Math.abs(stats.weekChange * 100))}
                    </p>
                    {stats.weekChange > 20 && (
                      <div className="mt-4 px-4 py-2 bg-red-100 text-red-500 rounded-full text-[10px] font-black uppercase flex items-center">
                        <ZapIcon size={12} className="mr-1" /> 剁手警报：最近花钱有点猛！
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-50 text-gray-900")}>
                  <h3 className="font-black text-lg mb-8 flex items-center"><CalendarIcon size={20} className="mr-2 text-orange-500" />{t('calendar')}</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-300 pb-4">{d}</div>)}
                    {eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }).map(day => {
                      const dayData = transactions.filter(t => isSameDay(parseISO(t.date), day));
                      const dayExpense = dayData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                      return (
                        <div key={day.toString()} onClick={() => setSelectedCalendarDate(day)} className={cn("aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative cursor-pointer", isSameDay(day, selectedCalendarDate) ? theme.primary + " text-white" : (isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"))}>
                          <span className="text-xs font-black">{format(day, 'd')}</span>
                          {dayExpense > 0 && (
                            <span className={cn(
                              "text-[6px] font-black absolute bottom-1",
                              isSameDay(day, selectedCalendarDate) ? "text-white/80" : "text-red-400"
                            )}>
                              -{Math.floor(dayExpense)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Summary Card */}
                <div className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}>
                  <h3 className="font-black text-sm text-gray-400 mb-6 uppercase tracking-widest">{format(selectedCalendarDate, 'MM月dd日')} 结余</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20">
                      <p className="text-[10px] font-black text-red-400 uppercase mb-1">支出</p>
                      <p className="text-xl font-black text-red-500">¥{formatCurrency(transactions.filter(t => isSameDay(parseISO(t.date), selectedCalendarDate) && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100/50 dark:border-green-900/20">
                      <p className="text-[10px] font-black text-green-400 uppercase mb-1">收入</p>
                      <p className="text-xl font-black text-green-500">¥{formatCurrency(transactions.filter(t => isSameDay(parseISO(t.date), selectedCalendarDate) && t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}</p>
                    </div>
                  </div>
                </div>

                {/* Month Progress */}
                <div className={cn("rounded-[2.5rem] p-8 shadow-sm border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50")}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">本月进度</span>
                    <span className="text-[10px] font-black">{stats.budgetUsage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.budgetUsage, 100)}%` }}
                      className={cn("h-full", stats.budgetUsage > 90 ? "bg-red-500" : theme.primary)}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Voice Recognition Modal */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-3xl p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm flex flex-col items-center bg-white/10 p-10 rounded-[4rem] border border-white/20 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 animate-gradient-x" />

              <div className="relative mb-12">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-4 bg-indigo-500 rounded-full blur-xl"
                />
                <div className="relative w-24 h-24 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              <h2 className="text-white text-2xl font-black mb-2 tracking-tight">AI 智能记账</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">Listening for intent...</p>

              <div className="w-full space-y-6">
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="今天吃肯德基花了 50 块"
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && voiceText) {
                        const parsed = parseVoiceIntent(voiceText);
                        if (parsed.amount > 0) {
                          addOrUpdateTransaction({
                            amount: parsed.amount,
                            type: 'expense',
                            category: parsed.category,
                            date: new Date().toISOString(),
                            note: parsed.note,
                            accountId: accounts[0].id,
                            mood: 'happy'
                          });
                          setIsVoiceModalOpen(false);
                          setVoiceText('');
                        }
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-6 text-white text-center text-lg font-bold focus:outline-none focus:ring-4 ring-indigo-500/20 transition-all placeholder:text-white/20"
                  />
                  {voiceText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md"
                    >
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">AI 解析结果</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">
                            {CATEGORIES.find(c => c.label === parseVoiceIntent(voiceText).category)?.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-sm">{parseVoiceIntent(voiceText).category}</p>
                            <p className="text-white/40 text-[10px]">{parseVoiceIntent(voiceText).note}</p>
                          </div>
                        </div>
                        <p className="text-white font-black text-xl">¥{parseVoiceIntent(voiceText).amount}</p>
                      </div>
                      <button
                        onClick={() => {
                          const parsed = parseVoiceIntent(voiceText);
                          addOrUpdateTransaction({
                            amount: parsed.amount,
                            type: 'expense',
                            category: parsed.category,
                            date: new Date().toISOString(),
                            note: parsed.note,
                            accountId: accounts[0].id,
                            mood: 'happy'
                          });
                          setIsVoiceModalOpen(false);
                          setVoiceText('');
                        }}
                        className="w-full mt-6 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                        确认入账
                      </button>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={() => setIsVoiceModalOpen(false)}
                  className="mx-auto w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-white/40 hover:text-white transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden",
              isDarkMode ? "bg-slate-800/90 text-white" : "bg-white/90 text-gray-900"
            )}
          >
            <div className="absolute inset-0 backdrop-blur-2xl -z-10" />

            {/* Close button for mobile accessibility */}
            <button
              onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }}
              className={cn(
                "absolute top-6 right-6 p-2 rounded-full transition-all active:scale-90 z-10",
                isDarkMode ? "bg-slate-700 text-white/60" : "bg-gray-100 text-gray-400"
              )}
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black">{editingTransaction ? t('edit_bill') : t('add_bill')}</h2>
            </div>

            <div className="max-h-[70vh] overflow-y-auto no-scrollbar pb-4">
              <TransactionForm
                accounts={accounts}
                transactions={transactions}
                rates={rates}
                onSubmit={addOrUpdateTransaction}
                initialData={editingTransaction || undefined}
                onDelete={editingTransaction ? () => { deleteTransaction(editingTransaction.id, { stopPropagation: () => { } } as any); setIsModalOpen(false); } : undefined}
                isDarkMode={isDarkMode}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Search & Advanced Filter Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-start justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "w-full max-w-md rounded-b-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden",
                isDarkMode ? "bg-slate-800/95 text-white" : "bg-white/95 text-gray-900"
              )}
            >
              <div className="absolute inset-0 backdrop-blur-2xl -z-10" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">账单搜索</h2>
                <button onClick={() => { setIsSearchModalOpen(false); setSearchQuery(''); }} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-100")}>
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="搜索备注、分类或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl font-bold focus:outline-none transition-all",
                    isDarkMode ? "bg-slate-700 text-white placeholder:text-slate-500" : "bg-gray-100 text-black placeholder:text-gray-400"
                  )}
                />
              </div>

              <div className="max-h-[50vh] overflow-y-auto no-scrollbar space-y-3">
                {searchQuery ? (
                  transactions
                    .filter(t =>
                      t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(t => (
                      <div key={t.id} onClick={() => { setEditingTransaction(t); setIsModalOpen(true); setIsSearchModalOpen(false); }} className={cn("p-4 rounded-2xl flex items-center justify-between border transition-all active:scale-[0.98]", isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", CATEGORIES.find(c => c.label === t.category)?.color)}>
                            {CATEGORIES.find(c => c.label === t.category)?.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{t.note || t.category}</p>
                            <p className="text-[10px] text-gray-400">{format(parseISO(t.date), 'yyyy-MM-dd')}</p>
                          </div>
                        </div>
                        <p className={cn("font-black", t.type === 'expense' ? "text-red-500" : "text-green-500")}>
                          {t.type === 'expense' ? '-' : '+'}¥{formatCurrency(t.amount)}
                        </p>
                      </div>
                    ))
                    .slice(0, 10)
                ) : (
                  <div className="py-10 text-center text-gray-400">
                    <Search size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">输入关键词开始搜索</p>
                  </div>
                )}
                {searchQuery && transactions.filter(t => t.note?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-center py-10 text-gray-400 text-xs font-bold">未找到相关账单</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "w-full max-w-sm rounded-[3rem] p-10 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar relative",
              isDarkMode ? "bg-slate-800 text-white" : "bg-white text-gray-900"
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black">{t('settings')}</h2>
                {isProActivated && (
                  <div className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Star size={8} fill="currentColor" />
                    <span>PRO</span>
                  </div>
                )}
              </div>
              <button onClick={() => { setIsBudgetModalOpen(false); setIsLogoutDialogOpen(false); }} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-100")}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Pro User Card */}
              <div className={cn("p-6 rounded-[2rem] relative overflow-hidden group", theme.primary)}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"
                />
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center relative">
                    <User className="text-white" size={28} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="text-white" size={10} fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-black">{t('user_nickname')}</p>
                      <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-black">PRO</span>
                    </div>
                    <p className="text-white/60 text-[10px] font-bold">已激活永久高级会员</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className="flex-1 py-2 bg-white/10 rounded-xl text-white text-[8px] font-black uppercase text-center backdrop-blur-sm">
                    云端同步中...
                  </div>
                  <div className="flex-1 py-2 bg-white/20 rounded-xl text-white text-[8px] font-black uppercase text-center backdrop-blur-sm">
                    自动冷备份
                  </div>
                </div>
              </div>

              {/* Settings List Groups */}
              <div className="space-y-6">
                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">账户与安全</label>
                  <div className={cn("rounded-[2rem] overflow-hidden", isDarkMode ? "bg-slate-700" : "bg-gray-50")}>
                    <div className="p-5 flex items-center justify-between border-b border-black/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded-lg flex items-center justify-center">
                          <Cloud size={18} />
                        </div>
                        <span className="text-sm font-bold">自动云端备份</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-black text-green-500">已开启</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">{t('general')}</label>
                  <div className={cn("rounded-[2rem] overflow-hidden", isDarkMode ? "bg-slate-700" : "bg-gray-50")}>
                    {/* Language Switch */}
                    <button onClick={() => setIsLangPickerOpen(true)} className="w-full p-5 flex items-center justify-between hover:bg-black/5 active:scale-[0.98] transition-all border-b border-black/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-500 rounded-lg flex items-center justify-center">
                          <Languages size={18} />
                        </div>
                        <span className="text-sm font-bold">{t('language')}</span>
                      </div>
                      <span className="text-xs font-black opacity-40">{i18n.language}</span>
                    </button>
                    {/* Dark Mode */}
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center">
                          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <span className="text-sm font-bold">{t('dark_mode')}</span>
                      </div>
                      <button onClick={() => setIsDarkMode(!isDarkMode)} className={cn("w-12 h-6 rounded-full relative transition-colors", isDarkMode ? theme.primary : "bg-gray-300")}>
                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", isDarkMode ? "left-7" : "left-1")} />
                      </button>
                    </div>
                  </div>
                </section>

                <button onClick={handleReset} className="w-full p-4 flex items-center justify-center space-x-2 text-rose-500 hover:bg-rose-500/5 active:scale-[0.98] transition-all mt-4 font-black text-sm">
                  <LogOut size={18} />
                  <span>{t('clear_data')}</span>
                </button>

                <button
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className={cn(
                    "w-full p-5 flex items-center justify-between rounded-[2rem] overflow-hidden border active:scale-[0.98] transition-all",
                    isDarkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600/80" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded-lg flex items-center justify-center">
                      <LogOut size={18} />
                    </div>
                    <span className="text-sm font-black text-rose-500">退出登录</span>
                  </div>
                  <ChevronRight size={18} className="text-rose-400 opacity-70" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {isLogoutDialogOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border",
                isDarkMode ? "bg-slate-800/95 text-white border-slate-700" : "bg-white/95 text-gray-900 border-gray-100"
              )}
            >
              <div className="text-center">
                <h3 className="text-lg font-black">确定要退出登录吗？</h3>
                <p className={cn("mt-2 text-xs font-bold", isDarkMode ? "text-white/50" : "text-gray-500")}>退出后可随时重新登录。</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className={cn(
                    "py-4 rounded-2xl font-black text-xs active:scale-95 transition-all border",
                    isDarkMode ? "bg-slate-700 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-600"
                  )}
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="py-4 rounded-2xl font-black text-xs bg-rose-500 text-white shadow-lg active:scale-95 transition-all"
                >
                  退出登录
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Picker */}
      <AnimatePresence>
        {isLangPickerOpen && (
          <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsLangPickerOpen(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full max-w-md rounded-t-[3rem] p-8 pb-12",
                isDarkMode ? "bg-slate-800 text-white" : "bg-white text-gray-900"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className={cn("w-12 h-1.5 rounded-full mx-auto mb-8", isDarkMode ? "bg-slate-700" : "bg-gray-100")} />
              <h3 className="text-lg font-black mb-6">{t('select_lang')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
                  { id: 'en-US', label: 'English', flag: '🇺🇸' },
                  { id: 'ja-JP', label: '日本語', flag: '🇯🇵' },
                  { id: 'ko-KR', label: '한국어', flag: '🇰🇷' },
                  { id: 'es-ES', label: 'Español', flag: '🇪🇸' },
                  { id: 'fr-FR', label: 'Français', flag: '🇫🇷' }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { i18n.changeLanguage(l.id); setIsLangPickerOpen(false); }}
                    className={cn(
                      "w-full p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all border",
                      i18n.language === l.id ? theme.primary + " text-white border-transparent" : (isDarkMode ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600" : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100")
                    )}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <span className="text-[10px] font-black">{l.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Time Filter */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-md" onClick={() => setIsFilterModalOpen(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn("w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl", isDarkMode ? "bg-slate-800 text-white" : "bg-white text-gray-900")}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black">筛选维度</h2><button onClick={() => setIsFilterModalOpen(false)} className="p-3 bg-gray-100 rounded-full"><X size={20} /></button></div>
              <div className="grid grid-cols-2 gap-4">
                {[{ id: 'today', label: t('today'), icon: '🕒' }, { id: 'week', label: t('week'), icon: '📅' }, { id: 'month', label: t('month'), icon: '📊' }, { id: 'year', label: t('year'), icon: '🗓️' }].map(dim => (
                  <button key={dim.id} onClick={() => { setFilterType(dim.id as any); setCurrentDate(new Date()); setIsFilterModalOpen(false); }} className={cn("flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all", filterType === dim.id ? "bg-black text-white border-black" : "bg-gray-50 text-gray-500 border-transparent")}>
                    <span className="text-2xl mb-2">{dim.icon}</span><span className="font-black text-[10px] uppercase tracking-widest">{dim.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl border-t border-white/5 shadow-2xl transition-all duration-500",
        isDarkMode ? "bg-slate-900/80" : "bg-white/80"
      )}>
        <div className="flex justify-between items-center max-w-lg mx-auto relative">
          {[
            { id: 'list', icon: <History size={22} />, label: t('bill_detail') },
            { id: 'chart', icon: <PieIcon size={22} />, label: t('stats') },
            { id: 'plus', icon: null, label: '' }, // Placeholder for the big plus
            { id: 'calendar', icon: <CalendarIcon size={22} />, label: t('calendar') },
            { id: 'discovery', icon: <Compass size={22} />, label: '发现' },
          ].map((tab) => {
            if (tab.id === 'plus') {
              return (
                <div key="plus-container" className="relative flex-1 flex justify-center -mt-12">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                    className={cn(
                      "w-16 h-16 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-4 border-white dark:border-slate-900 transition-all pointer-events-auto",
                      theme.primary
                    )}
                  >
                    <Plus size={32} strokeWidth={3} />
                  </motion.button>
                  <span className="absolute -bottom-6 text-[8px] font-black uppercase tracking-tighter text-gray-400">记一笔</span>
                </div>
              );
            }
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex flex-col items-center space-y-1 transition-all relative group",
                  activeTab === tab.id ? theme.text : "text-gray-400"
                )}
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-500",
                  activeTab === tab.id ? "bg-gray-100/50 scale-110 shadow-sm" : "group-hover:bg-gray-50"
                )}>
                  {tab.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
                {activeTab === tab.id && <motion.div layoutId="nav-dot" className={cn("absolute -top-1 w-1 h-1 rounded-full", theme.primary)} />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function TransactionForm({
  accounts,
  transactions,
  rates,
  onSubmit,
  initialData,
  onDelete,
  isDarkMode
}: {
  accounts: Account[],
  transactions: Transaction[],
  rates: Record<string, number>,
  onSubmit: (t: Omit<Transaction, 'id'>) => void,
  initialData?: Transaction,
  onDelete?: () => void,
  isDarkMode: boolean
}) {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.originalAmount?.toString() || initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || '餐饮');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0].id);
  const [note, setNote] = useState(initialData?.note || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [hasImage, setHasImage] = useState(initialData?.hasImage || false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageData || null);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>(initialData?.mood || 'happy');

  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('data:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- Currency State ---
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    if (initialData?.currency) return initialData.currency;
    return (localStorage.getItem('last_used_currency') as CurrencyCode) || 'CNY';
  });
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [isAmountAnimating, setIsAmountAnimating] = useState(false);

  const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode)!;
  const convertedCNY = useMemo(() => {
    const num = Number(amount);
    if (isNaN(num)) return 0;
    if (currencyCode === 'CNY') return num;
    return num * (rates[currencyCode] || 1);
  }, [amount, currencyCode, rates]);

  const suggestions = useMemo(() => Array.from(new Set(transactions.filter(t => t.category === category && t.note).map(t => t.note as string))).slice(0, 3), [category, transactions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setHasImage(true);
      if (previewUrl && !previewUrl.startsWith('data:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setHasImage(false);
    if (previewUrl && !previewUrl.startsWith('data:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    let imageData = initialData?.imageData;
    if (imageFile) {
      // Convert to base64 for storage
      imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    } else if (!hasImage) {
      imageData = undefined;
    }

    localStorage.setItem('last_used_currency', currencyCode);
    onSubmit({
      amount: convertedCNY,
      type,
      category,
      date,
      note,
      accountId,
      tags,
      hasImage,
      imageData,
      mood,
      originalAmount: Number(amount),
      currency: currencyCode,
      exchangeRate: rates[currencyCode]
    });
  };

  const handleCurrencySelect = (code: CurrencyCode) => {
    setIsAmountAnimating(true);
    setCurrencyCode(code);
    setIsCurrencyDrawerOpen(false);
    setTimeout(() => setIsAmountAnimating(false), 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cn("flex p-1.5 rounded-2xl", isDarkMode ? "bg-slate-700" : "bg-gray-100")}>
        <button type="button" onClick={() => setType('expense')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'expense' ? (isDarkMode ? "bg-slate-600 shadow-md text-red-400" : "bg-white shadow-md text-red-500") : "text-gray-400")}>{t('expense')}</button>
        <button type="button" onClick={() => setType('income')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'income' ? (isDarkMode ? "bg-slate-600 shadow-md text-green-400" : "bg-white shadow-md text-green-500") : "text-gray-400")}>{t('income')}</button>
      </div>

      <div className={cn("relative border-b-4 transition-colors pb-6", isDarkMode ? "border-slate-700 focus-within:border-white" : "border-gray-50 focus-within:border-black")}>
        <div className="flex justify-between items-center mb-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">输入金额</label>
          {currencyCode !== 'CNY' && (
            <div className="flex items-center space-x-2 bg-blue-50/50 px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">实时汇率同步中</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setIsCurrencyDrawerOpen(true)}
            className={cn(
              "flex items-center space-x-2 px-5 py-4 rounded-[1.5rem] border shadow-sm active:scale-95 transition-all shrink-0",
              isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-100 border-gray-200"
            )}
          >
            <span className="text-xl font-black">{selectedCurrency.flag} {selectedCurrency.code}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </motion.button>
          <div className="flex-1 flex items-baseline">
            <span className="text-3xl font-black text-gray-300 mr-2">{selectedCurrency.symbol}</span>
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={cn(
                "w-full text-6xl font-black focus:outline-none placeholder:text-gray-100 transition-all duration-500 bg-transparent",
                isAmountAnimating && "translate-y-2 opacity-0",
                isDarkMode ? "text-white" : "text-black"
              )}
              required
            />
          </div>
        </div>
        <AnimatePresence>
          {currencyCode !== 'CNY' && amount && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="mt-6 flex items-center space-x-3 text-blue-500 font-black bg-blue-50/80 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-blue-100 shadow-sm"
            >
              <div className="bg-blue-500 p-1 rounded-lg">
                <ArrowRightLeft size={10} className="text-white" />
              </div>
              <span className="text-xs">约合 ￥{convertedCNY.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} CNY</span>
              <div className="w-[1px] h-3 bg-blue-200 mx-1" />
              <span className="text-[8px] opacity-60">1 {currencyCode} = {rates[currencyCode]?.toFixed(4)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Currency Drawer */}
      <AnimatePresence>
        {isCurrencyDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsCurrencyDrawerOpen(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full max-w-md rounded-t-[2.5rem] p-8 pb-12",
                isDarkMode ? "bg-slate-800 text-white" : "bg-white text-gray-900"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className={cn("w-12 h-1.5 rounded-full mx-auto mb-8", isDarkMode ? "bg-slate-700" : "bg-gray-100")} />
              <h3 className="text-lg font-black mb-6">{t('select_currency')}</h3>
              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                {CURRENCIES.map(c => (
                  <button key={c.code} type="button" onClick={() => handleCurrencySelect(c.code)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all", currencyCode === c.code ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") : (isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-50 text-gray-600"))}>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{c.flag}</span>
                      <div className="text-left">
                        <p className="text-sm font-black">{c.code}</p>
                        <p className="text-[10px] opacity-60 font-bold">{c.name}</p>
                      </div>
                    </div>
                    {currencyCode === c.code ? (
                      <div className={cn("w-2 h-2 rounded-full", isDarkMode ? "bg-black" : "bg-white")} />
                    ) : (
                      <span className="text-xs font-bold opacity-40">1 {c.code} ≈ {rates[c.code]?.toFixed(4)} CNY</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">日期</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">支付账户</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none appearance-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")}>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {t(`accounts.${acc.name}`)}</option>)}</select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">所属分类</label>
          <select value={category} onChange={e => setCategory(e.target.value as Category)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none appearance-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")}>{CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {t(`categories.${c.label}`)}</option>)}</select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{i18n.language === 'zh-CN' ? '心情' : 'MOOD'}</label>
          <div className={cn("flex p-1.5 rounded-2xl", isDarkMode ? "bg-slate-700" : "bg-gray-50")}>
            {(['happy', 'neutral', 'sad'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMood(m)} className={cn(
                "flex-1 py-2 rounded-xl text-xl transition-all",
                mood === m ? (isDarkMode ? "bg-slate-600 shadow-md scale-110" : "bg-white shadow-md scale-110") : "opacity-40"
              )}>
                {m === 'happy' ? '😊' : m === 'neutral' ? '😐' : '😭'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 mb-2 block">备注与标签</label>
        <textarea placeholder="输入账单详情（支持长文本）..." value={note} onChange={e => setNote(e.target.value)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none mb-2 min-h-[80px] resize-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")} />
        {suggestions.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{suggestions.map((s, i) => <button key={i} type="button" onClick={() => setNote(s)} className={cn("px-3 py-1 rounded-full text-[8px] font-bold", isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-500")}>{s}</button>)}</div>}
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input type="text" placeholder="添加标签..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput) { e.preventDefault(); setTags([...tags, tagInput]); setTagInput(''); } }} className={cn("w-full pl-9 pr-4 py-3 rounded-xl text-[10px] font-bold focus:outline-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">{tags.map((tag, i) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-black flex items-center">#{tag} <X size={10} className="ml-1 cursor-pointer" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} /></span>)}</div>
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 mb-2 block">附件凭证</label>
        <div className="relative group">
          {previewUrl ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-sm group">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-all active:scale-90"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={cn(
              "flex flex-col items-center justify-center w-full aspect-video rounded-[2rem] border-2 border-dashed cursor-pointer transition-all active:scale-[0.98] group",
              isDarkMode ? "bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700" : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
            )}>
              <div className="flex flex-col items-center justify-center">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all group-hover:scale-110", isDarkMode ? "bg-slate-600" : "bg-white shadow-sm")}>
                  <Camera size={24} className="text-gray-400" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">点击拍照或选择凭证</p>
                <p className="text-[8px] text-gray-300 mt-1">支持图片格式 (JPG, PNG)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>
      <div className="flex space-x-3 pt-4 pb-[env(safe-area-inset-bottom)]">
        {onDelete && <button type="button" onClick={onDelete} className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black text-sm active:scale-95 transition-all">{t('delete')}</button>}
        <button type="submit" className={cn("flex-[3] py-5 rounded-[2.5rem] font-black text-sm shadow-xl active:scale-95 transition-all", isDarkMode ? "bg-white text-black" : "bg-black text-white")}>{t('save_bill')}</button>
      </div>
    </form>
  );
}
