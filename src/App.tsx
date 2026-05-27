import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Plus,
  X,
  Minus,
  Trash2,
  Check,
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
  Search,
  Camera,
  Hash,
  Smile,
  Globe,
  ArrowRightLeft,
  Pencil,
  Languages,
  Share2,
  LogOut,
  GripVertical,
  Users,
  Trophy,
  Sprout,
  TreePine,
  Vault,
  LineChart as LineIcon,
  Cloud,
  User,
  Compass,
  Zap as ZapIcon,
  Calculator,
  Sparkles,
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
import { enUS, zhCN } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { motion, AnimatePresence, Reorder, useMotionValue, useScroll, useTransform, useSpring } from 'framer-motion';
const SAVING_CHALLENGE_TIPS_FALLBACK = [
  'Keep going — small wins compound.',
  'Steady progress beats perfection.',
  'One calm choice today, more freedom tomorrow.',
];
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from './i18n/lang';
import { I18N_KEYS } from './i18n/keys';
import { LiquidGlass } from '@ybouane/liquidglass';
import type { Transaction, Category, TransactionType, Account, CurrencyCode, Currency } from './types';
import StatsCharts from './components/StatsCharts';
import LoginScreen from './components/LoginScreen';
import AiBookkeepingChat from './components/AiBookkeepingChat';
import { supabase } from './lib/supabaseClient';
import { parseBillIntent, type ParsedBillIntent } from './utils/parseBillIntent';
import { signOutSupabase } from './utils/loginAuth';

const SESSION_AUTH_KEY = 'session_authed';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


function SplashScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('exit'), 1400);
    const exitTimer = setTimeout(onDone, 2000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F6F8FA]"
    >
      <motion.div
        animate={
          phase === 'enter'
            ? { scale: [0.6, 1.15, 1], opacity: [0, 1, 1] }
            : { scale: 0.8, opacity: 0 }
        }
        transition={
          phase === 'enter'
            ? { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }
            : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-[#1D1D1F] flex items-center justify-center shadow-2xl mb-6">
          <Wallet size={44} className="text-white" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl font-black tracking-tight text-[#1D1D1F]"
        >
          My Money
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-sm font-bold text-[#6E6E73]"
        >
          {t('splash.tagline')}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

const CURRENCIES: Currency[] = [
  { code: 'CNY', name: 'CNY', flag: '🇨🇳', symbol: '¥' },
  { code: 'USD', name: 'USD', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'EUR', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', name: 'JPY', flag: '🇯🇵', symbol: '¥' },
  { code: 'KRW', name: 'KRW', flag: '🇰🇷', symbol: '₩' },
  { code: 'THB', name: 'THB', flag: '🇹🇭', symbol: '฿' },
  { code: 'HKD', name: 'HKD', flag: '🇭🇰', symbol: '$' },
  { code: 'MYR', name: 'MYR', flag: '🇲🇾', symbol: 'RM' },
];

const APPLE_LIGHT_THEME = {
  primary: 'bg-[#1D1D1F] text-white',
  text: 'text-[#1D1D1F]',
  border: 'lux-ios-glass-subtle',
  shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.02)]',
  ring: 'ring-[#1D1D1F]',
  appBg: 'bg-[#F6F8FA]',
  appText: 'text-[#111111]',
  surface: 'lux-carbon',
  surfaceSoft: 'lux-carbon-soft',
  surfaceBorder: 'lux-gold-hairline',
  mutedText: 'text-[#6E6E73]',
} as const;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

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

type HomeWidgetId = 'todayBoard' | 'weekTrend' | 'topCategories' | 'summary' | 'budgetProgress';
type HomeWidgetConfig = { order: HomeWidgetId[]; enabled: Record<HomeWidgetId, boolean> };

const HOME_WIDGETS_STORAGE_KEY = 'home_widgets_v1';

const HOME_WIDGET_META: Record<HomeWidgetId, { titleKey: string; descKey: string }> = {
  todayBoard: { titleKey: 'home_widgets.today_board', descKey: 'home_widget_meta.today_board_desc' },
  weekTrend: { titleKey: 'home_widgets.week_trend', descKey: 'home_widget_meta.week_trend_desc' },
  topCategories: { titleKey: 'home_widgets.top_categories', descKey: 'home_widget_meta.top_categories_desc' },
  summary: { titleKey: 'home_widget_meta.summary_title', descKey: 'home_widget_meta.summary_desc' },
  budgetProgress: { titleKey: 'home_widget_meta.budget_progress_title', descKey: 'home_widget_meta.budget_progress_desc' },
};

const DEFAULT_HOME_WIDGET_CONFIG: HomeWidgetConfig = {
  order: ['summary', 'todayBoard', 'weekTrend', 'topCategories', 'budgetProgress'],
  enabled: {
    todayBoard: true,
    weekTrend: true,
    topCategories: true,
    summary: true,
    budgetProgress: true,
  },
};

const normalizeHomeWidgetConfig = (raw: any): HomeWidgetConfig => {
  const allIds = new Set<HomeWidgetId>(DEFAULT_HOME_WIDGET_CONFIG.order);
  const rawOrder = Array.isArray(raw?.order) ? raw.order : [];
  const order: HomeWidgetId[] = [];
  const seen = new Set<HomeWidgetId>();
  rawOrder.forEach((id: any) => {
    if (allIds.has(id) && !seen.has(id)) {
      order.push(id);
      seen.add(id);
    }
  });
  DEFAULT_HOME_WIDGET_CONFIG.order.forEach((id) => {
    if (!seen.has(id)) order.push(id);
  });

  const enabled = { ...DEFAULT_HOME_WIDGET_CONFIG.enabled };
  const rawEnabled = raw?.enabled || {};
  (Object.keys(enabled) as HomeWidgetId[]).forEach((id) => {
    if (typeof rawEnabled[id] === 'boolean') enabled[id] = rawEnabled[id];
  });

  enabled.summary = true;
  const withoutSummary = order.filter(id => id !== 'summary');
  const prioritizedOrder: HomeWidgetId[] = ['summary', ...withoutSummary];

  const anyEnabled = order.some(id => enabled[id]);
  if (!anyEnabled) enabled.todayBoard = true;

  return { order: prioritizedOrder, enabled };
};

type GroupSavingMember = { id: string; name: string; color: string; emoji: string };
type GroupSavingGroup = {
  id: string;
  name: string;
  code: string;
  members: GroupSavingMember[];
  publicBudget: number;
  createdAt: number;
};
type GroupActivity = {
  id: string;
  ts: number;
  actorId: string;
  actorName: string;
  action: 'add' | 'edit' | 'delete';
  type: TransactionType;
  category: Category;
  amount: number;
  note?: string;
  toGroupPool: boolean;
  likes: string[];
  urges: string[];
};

const GROUP_SAVING_STORAGE_KEY = 'group_saving_v1';
const groupActivitiesKey = (groupId: string) => `group_saving_activities_${groupId}`;

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

  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? Number(saved) : 5000;
  });

  // --- UI State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isBudgetEditModalOpen, setIsBudgetEditModalOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [discoveryTool, setDiscoveryTool] = useState<null | 'exchange' | 'calculator' | 'savingChallenge'>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart' | 'vault' | 'groupSaving' | 'discovery' | 'assets'>('list');
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isHomeEditMode, setIsHomeEditMode] = useState(false);
  const [homeWidgetConfig, setHomeWidgetConfig] = useState<HomeWidgetConfig>(() => {
    const saved = localStorage.getItem(HOME_WIDGETS_STORAGE_KEY);
    if (!saved) return DEFAULT_HOME_WIDGET_CONFIG;
    try {
      return normalizeHomeWidgetConfig(JSON.parse(saved));
    } catch {
      return DEFAULT_HOME_WIDGET_CONFIG;
    }
  });
  const HOME_EDIT_HINT_KEY = 'has_interacted_with_edit';
  const [hasInteractedWithEdit, setHasInteractedWithEdit] = useState(() => localStorage.getItem(HOME_EDIT_HINT_KEY) === 'true');

  const toastTimerRef = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const homeLongPressTimeoutRef = useRef<number | null>(null);
  const homeLongPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const homeLongPressFiredRef = useRef(false);
  const vaultJarRef = useRef<HTMLDivElement>(null);
  const tabbarGlassRef = useRef<HTMLElement>(null);
  const liquidGlassRef = useRef<LiquidGlass | null>(null);

  const [localUserId] = useState(() => {
    const existing = sessionStorage.getItem('local_user_id');
    if (existing) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem('local_user_id', next);
    return next;
  });
  const [localUserName, setLocalUserName] = useState(() => {
    const existing = localStorage.getItem('local_user_name');
    if (existing) return existing;
    const next = t('user_title');
    localStorage.setItem('local_user_name', next);
    return next;
  });
  const [localUserAvatar, setLocalUserAvatar] = useState(() => localStorage.getItem('local_user_avatar') || '');
  const [isAvatarActionSheetOpen, setIsAvatarActionSheetOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [draftUserName, setDraftUserName] = useState('');

  const GROUP_SAVING_POOL_KEY = 'group_saving_pool_v1';
  const [groupSaving, setGroupSaving] = useState<GroupSavingGroup | null>(() => {
    const saved = localStorage.getItem(GROUP_SAVING_STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as GroupSavingGroup;
    } catch {
      return null;
    }
  });
  const [groupActivities, setGroupActivities] = useState<GroupActivity[]>([]);
  const [groupDraftName, setGroupDraftName] = useState('');
  const [groupJoinCode, setGroupJoinCode] = useState('');

  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(SESSION_AUTH_KEY) === 'true');
  const [loginFadeOut, setLoginFadeOut] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || !session) return;
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      localStorage.setItem('auth_done', 'true');
      setIsAuthed(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        localStorage.setItem('auth_done', 'true');
        setIsAuthed(true);
        return;
      }
      if (_event === 'SIGNED_OUT') {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        localStorage.removeItem('auth_done');
        setIsAuthed(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAiBookkeepingOpen, setIsAiBookkeepingOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isWealthMilestoneSheetOpen, setIsWealthMilestoneSheetOpen] = useState(false);
  const [timeContext, setTimeContext] = useState<'morning' | 'afternoon' | 'evening'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  });

  // --- Discovery State ---
  const [monthlySalary, setSalary] = useState<number>(10000);
  const wealthTips = useMemo(() => (t('wealth_tips', { returnObjects: true }) as string[]), [t, i18n.language]);
  const savingChallengeTips = useMemo(
    () => ((t('saving_challenge.tips', { returnObjects: true }) as unknown as string[]) || SAVING_CHALLENGE_TIPS_FALLBACK),
    [t, i18n.language]
  );

  const [wealthTip, setWealthTip] = useState(() => wealthTips[0] || '');

  const SAVING_CHALLENGE_LAST_KEY = 'saving_challenge_last_v1';
  const SAVING_CHALLENGE_STREAK_KEY = 'saving_challenge_streak_v1';
  const [savingChallengeLast, setSavingChallengeLast] = useState(() => localStorage.getItem(SAVING_CHALLENGE_LAST_KEY) || '');
  const [savingChallengeStreak, setSavingChallengeStreak] = useState(() => {
    const raw = localStorage.getItem(SAVING_CHALLENGE_STREAK_KEY);
    return raw ? Number(raw) || 0 : 0;
  });
  const savingChallengeTodayKey = format(new Date(), 'yyyy-MM-dd');
  const savingChallengeCheckedToday = savingChallengeLast === savingChallengeTodayKey;
  const savingChallengeProgressPct = Math.max(0, Math.min(100, (Math.max(0, savingChallengeStreak) / 30) * 100));
  const savingChallengeDayCount = Math.min(30, Math.max(0, savingChallengeStreak));
  const [savingChallengeTip, setSavingChallengeTip] = useState(() => {
    return savingChallengeTips[Math.floor(Math.random() * savingChallengeTips.length)] || savingChallengeTips[0] || '';
  });

  const savingChallengeStage = useMemo(() => {
    const day = savingChallengeDayCount;
    if (day <= 0) {
      return {
        Icon: Sprout,
        title: t(I18N_KEYS.savingChallenge.stageSeedTitle),
        subtitle: t(I18N_KEYS.savingChallenge.stageSeedSubtitle),
        tone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      };
    }
    if (day <= 1) {
      return {
        Icon: Sprout,
        title: t(I18N_KEYS.savingChallenge.stageSproutTitle),
        subtitle: t(I18N_KEYS.savingChallenge.stageSproutSubtitle),
        tone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      };
    }
    if (day <= 10) {
      return {
        Icon: Sprout,
        title: t(I18N_KEYS.savingChallenge.stageSeedlingTitle),
        subtitle: t(I18N_KEYS.savingChallenge.stageSeedlingSubtitle),
        tone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      };
    }
    if (day <= 20) {
      return {
        Icon: TreePine,
        title: t(I18N_KEYS.savingChallenge.stageSaplingTitle),
        subtitle: t(I18N_KEYS.savingChallenge.stageSaplingSubtitle),
        tone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      };
    }
    return {
      Icon: TreePine,
      title: t(I18N_KEYS.savingChallenge.stageTreeTitle),
      subtitle: t(I18N_KEYS.savingChallenge.stageTreeSubtitle),
      tone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    };
  }, [savingChallengeDayCount, t]);

  useEffect(() => {
    if (discoveryTool !== 'savingChallenge') return;
    setSavingChallengeTip(savingChallengeTips[Math.floor(Math.random() * savingChallengeTips.length)] || savingChallengeTips[0] || '');
    const id = window.setInterval(() => {
      setSavingChallengeTip(savingChallengeTips[Math.floor(Math.random() * savingChallengeTips.length)] || savingChallengeTips[0] || '');
    }, 3200);
    return () => window.clearInterval(id);
  }, [discoveryTool, savingChallengeTips]);

  const handleSavingChallengeCheckIn = () => {
    if (savingChallengeCheckedToday) return;
    const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    setSavingChallengeStreak((prev) => {
      const next = savingChallengeLast === yesterdayKey ? prev + 1 : 1;
      return Math.max(0, Math.min(365, next));
    });
    setSavingChallengeLast(savingChallengeTodayKey);
  };

  useEffect(() => {
    localStorage.setItem(SAVING_CHALLENGE_LAST_KEY, savingChallengeLast);
  }, [savingChallengeLast]);

  useEffect(() => {
    localStorage.setItem(SAVING_CHALLENGE_STREAK_KEY, String(savingChallengeStreak));
  }, [savingChallengeStreak]);

  const pickRandomWealthTip = useCallback(() => {
    if (!wealthTips.length) return;
    if (wealthTips.length === 1) {
      setWealthTip(wealthTips[0] || '');
      return;
    }
    let next = wealthTips[Math.floor(Math.random() * wealthTips.length)] || '';
    while (next === wealthTip) {
      next = wealthTips[Math.floor(Math.random() * wealthTips.length)] || '';
    }
    setWealthTip(next);
  }, [wealthTips, wealthTip]);

  useEffect(() => {
    if (activeTab !== 'discovery') return;
    if (!wealthTips.length) return;
    setWealthTip(wealthTips[Math.floor(Math.random() * wealthTips.length)] || '');
  }, [activeTab, wealthTips]);

  const [dividendYield, setDividendYield] = useState<number>(128.45);

  useEffect(() => {
    if (activeTab !== 'vault') return;
    const id = window.setInterval(() => {
      setDividendYield(prev => {
        const delta = (Math.random() - 0.45) * 7.5;
        const next = Math.max(0, Math.min(9999, prev + delta));
        return Number(next.toFixed(2));
      });
    }, 1200);
    return () => window.clearInterval(id);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'list') setIsHomeEditMode(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(HOME_WIDGETS_STORAGE_KEY, JSON.stringify(homeWidgetConfig));
  }, [homeWidgetConfig]);

  useEffect(() => {
    const existing = localStorage.getItem(HOME_EDIT_HINT_KEY);
    if (existing == null) localStorage.setItem(HOME_EDIT_HINT_KEY, 'false');
  }, []);

  useEffect(() => {
    if (groupSaving) localStorage.setItem(GROUP_SAVING_STORAGE_KEY, JSON.stringify(groupSaving));
    else localStorage.removeItem(GROUP_SAVING_STORAGE_KEY);
  }, [groupSaving]);

  useEffect(() => {
    if (!groupSaving) {
      setGroupActivities([]);
      return;
    }
    const saved = localStorage.getItem(groupActivitiesKey(groupSaving.id));
    if (!saved) {
      setGroupActivities([]);
      return;
    }
    try {
      setGroupActivities(JSON.parse(saved) as GroupActivity[]);
    } catch {
      setGroupActivities([]);
    }
  }, [groupSaving?.id]);

  useEffect(() => {
    if (!groupSaving) return;
    localStorage.setItem(groupActivitiesKey(groupSaving.id), JSON.stringify(groupActivities));
  }, [groupSaving?.id, groupActivities]);

  useEffect(() => {
    localStorage.setItem('local_user_name', localUserName);
  }, [localUserName]);

  useEffect(() => {
    if (localUserAvatar) localStorage.setItem('local_user_avatar', localUserAvatar);
    else localStorage.removeItem('local_user_avatar');
  }, [localUserAvatar]);

  useEffect(() => {
    if (activeTab !== 'list') {
      setIsHomeEditMode(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'chart') return;
    const t1 = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 360);
    return () => window.clearTimeout(t1);
  }, [activeTab]);

  // ── LiquidGlass WebGL TabBar ──
  // Initialise the real-time liquid glass effect on the bottom
  // navigation bar.  The .tabbar-glass nav is the root container;
  // .tabbar-surface is the glass element that receives the WebGL
  // refraction / blur / chromatic aberration shader.
  useEffect(() => {
    const root = tabbarGlassRef.current;
    if (!root) return;

    const glassEl = root.querySelector<HTMLElement>('.tabbar-surface');
    if (!glassEl) return;

    // Per-element glass configuration — tuned for a thin, elegant
    // navigation bar with a subtle liquid refraction.
    glassEl.dataset.config = JSON.stringify({
      blurAmount: 0.15,       // gentle background blur
      refraction: 0.55,       // moderate light bending
      chromAberration: 0.03,  // subtle colour fringing
      edgeHighlight: 0.04,    // soft rim light
      specular: 0.02,         // faint specular highlight
      fresnel: 0.85,          // grazing-angle reflection
      distortion: 0.01,       // micro-distortion for organic feel
      cornerRadius: 24,       // matches CSS border-radius
      zRadius: 16,            // shallow bevel depth for a thin bar
      opacity: 0.92,          // slightly transparent
      saturation: 0.05,       // near-neutral
      tintStrength: 0.02,     // barely-there cool tint
      brightness: 0.02,       // subtle brightening
      shadowOpacity: 0.12,    // soft floating shadow
      shadowSpread: 12,
      shadowOffsetY: 2,
      floating: false,
      button: false,
      bevelMode: 0,
    });

    let instance: LiquidGlass | null = null;

    (async () => {
      try {
        instance = await LiquidGlass.init({
          root,
          glassElements: [glassEl],
          defaults: {
            cornerRadius: 24,
            zRadius: 16,
          },
        });
        liquidGlassRef.current = instance;
      } catch (err) {
        console.warn('[LiquidGlass] init failed — falling back to CSS glassmorphism', err);
      }
    })();

    return () => {
      instance?.destroy();
      liquidGlassRef.current = null;
    };
  }, []);

  const avatarLibraryInputRef = useRef<HTMLInputElement>(null);
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);

  const fileToAvatarDataUrl = async (file: File) => {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('read_failed'));
      reader.readAsDataURL(file);
    });

    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('image_decode_failed'));
      i.src = dataUrl;
    });

    const side = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const sx = Math.max(0, ((img.naturalWidth || img.width) - side) / 2);
    const sy = Math.max(0, ((img.naturalHeight || img.height) - side) / 2);

    const outSize = 320;
    const canvas = document.createElement('canvas');
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, outSize, outSize);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleAvatarFile = async (file: File | null | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setLocalUserAvatar(dataUrl);
    } finally {
      setIsAvatarActionSheetOpen(false);
    }
  };

  const openEditName = () => {
    setDraftUserName(localUserName);
    setIsEditNameModalOpen(true);
    setIsAvatarActionSheetOpen(false);
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setIsToastOpen(true);
    toastTimerRef.current = window.setTimeout(() => setIsToastOpen(false), 1800);
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };


  // --- Settings & i18n ---
  const isDarkMode = false;
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [showOriginalCurrency, setShowOriginalCurrency] = useState<Record<string, boolean>>({});

  // --- Privacy & Theme ---
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [pin] = useState(() => localStorage.getItem('privacy_pin') || '');
  const [isLockEnabled] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [inputPin, setInputPin] = useState('');
  const theme = APPLE_LIGHT_THEME;
  const isBlackGold = false;
  const isDarkUI = false;
  const accentHex = '#1D1D1F';

  const mutedText = theme.mutedText;
  const chipNeutral = "bg-[#F2F2F7] text-[#6E6E73]";
  const surfaceCard = (...extra: ClassValue[]) => cn(
    "rounded-2xl overflow-hidden lux-gold-hairline",
    cn(theme.surfaceSoft, theme.appText),
    ...extra
  );

  const toggleCurrency = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOriginalCurrency(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('exchange_rates');
    return saved ? JSON.parse(saved) : { USD: 7.25, EUR: 7.85, JPY: 0.046, KRW: 0.0053, THB: 0.19, HKD: 0.93, CNY: 1 };
  });
  const DISPLAY_CURRENCY_KEY = 'display_currency_v1';
  const [displayCurrencyCode, setDisplayCurrencyCode] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(DISPLAY_CURRENCY_KEY) as CurrencyCode | null;
    if (saved) return saved;
    return (localStorage.getItem('last_used_currency') as CurrencyCode) || 'CNY';
  });
  useEffect(() => {
    localStorage.setItem(DISPLAY_CURRENCY_KEY, displayCurrencyCode);
  }, [displayCurrencyCode]);

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

  const parseVoiceIntent = (text: string) =>
    parseBillIntent(text, t('voice.default_note'));

  const recordAiBookkeepingExpense = (parsed: ParsedBillIntent) => {
    const defaultAccount = accounts[0];
    if (!defaultAccount || parsed.amount <= 0) return;
    addOrUpdateTransaction({
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: new Date().toISOString(),
      note: parsed.note,
      accountId: defaultAccount.id,
      mood: 'happy',
    });
  };

  const buildBackupKV = () => {
    const exactKeys = new Set<string>([
      'transactions',
      'accounts',
      'monthly_budget',
      'app_lang',
      'auth_done',
      'privacy_lock_enabled',
      'privacy_pin',
      'exchange_rates',
      'last_rate_update',
      'last_used_currency',
      'local_user_id',
      'local_user_name',
      HOME_WIDGETS_STORAGE_KEY,
      GROUP_SAVING_STORAGE_KEY,
      GROUP_SAVING_POOL_KEY,
    ]);

    const kv: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (exactKeys.has(key) || key.startsWith('group_saving_activities_')) {
        kv[key] = localStorage.getItem(key);
      }
    }

    kv.transactions = JSON.stringify(transactions);
    kv.accounts = JSON.stringify(accounts);
    kv.monthly_budget = String(budget);
    kv.app_lang = i18n.language;
    kv.auth_done = String(isAuthed);
    kv.local_user_id = localUserId;
    kv.local_user_name = localUserName;

    return kv;
  };

  const exportBackup = () => {
    const payload = {
      schema: 1 as const,
      exportedAt: new Date().toISOString(),
      kv: buildBackupKV(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-money-backup-${format(new Date(), 'yyyyMMdd-HHmm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsImage = async () => {
    const element = document.getElementById('stats-content');
    if (!element) return;

    const setExportMode = (root: HTMLElement, on: boolean) => {
      root.querySelectorAll('.show-on-export').forEach((el) => el.classList.toggle('hidden', !on));
      root.querySelectorAll('.export-only').forEach((el) => el.classList.toggle('hidden', !on));
      root.querySelectorAll('.export-hide').forEach((el) => el.classList.toggle('hidden', on));
    };

    setExportMode(element, true);

    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const canvas = await html2canvas(element, {
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('stats-content');
          if (clonedElement) {
            setExportMode(clonedElement as any, true);
          }
        }
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = t('export_files.image', { month: format(currentDate, 'yyyy-MM') });
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExportMode(element, false);
    }
  };

  const exportAsCSV = async () => {
    const rows = (stats.filtered || []).map(t => ({
      date: t.date.split('T')[0],
      type: t.type,
      category: t.category,
      amount: t.amount,
      currency: t.currency || 'CNY',
      originalAmount: t.originalAmount ?? '',
      note: (t.note || '').replace(/\n/g, ' ').trim(),
      accountId: t.accountId,
    }));

    const header = ['date', 'type', 'category', 'amount', 'currency', 'originalAmount', 'note', 'accountId'];
    const csv = [
      header.join(','),
      ...rows.map(r => header.map(k => {
        const value = (r as any)[k];
        const s = String(value ?? '');
        const escaped = s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        return escaped;
      }).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = t('export_files.csv', { month: format(currentDate, 'yyyy-MM') });
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('stats-content');
    if (!element) return;

    const setExportMode = (root: HTMLElement, on: boolean) => {
      root.querySelectorAll('.show-on-export').forEach((el) => el.classList.toggle('hidden', !on));
      root.querySelectorAll('.export-only').forEach((el) => el.classList.toggle('hidden', !on));
      root.querySelectorAll('.export-hide').forEach((el) => el.classList.toggle('hidden', on));
    };

    setExportMode(element, true);

    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const canvas = await html2canvas(element, {
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const image = canvas.toDataURL("image/png");
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<html><head><title>${t('export_files.report_title')}</title></head><body style="margin:0;background:#fff"><img src="${image}" style="width:100%;height:auto" /></body></html>`);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExportMode(element, false);
    }
  };

  const doExport = async (kind: 'image' | 'csv' | 'pdf') => {
    if (kind === 'image') await exportAsImage();
    if (kind === 'csv') await exportAsCSV();
    if (kind === 'pdf') await exportAsPDF();
  };

  const requestExport = (kind: 'image' | 'csv' | 'pdf' = 'image') => {
    doExport(kind);
  };

  // --- Persistence ---
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('monthly_budget', budget.toString()), [budget]);
  useEffect(() => {
    localStorage.setItem('privacy_lock_enabled', isLockEnabled.toString());
    localStorage.setItem('privacy_pin', pin);
  }, [isLockEnabled, pin]);
  useEffect(() => localStorage.setItem('app_lang', i18n.language), [i18n.language]);

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
  const normalizeCategory = (raw: any): Category => {
    const key = String(raw ?? '');
    const map: Record<string, Category> = {
      '餐饮': '餐饮',
      Food: '餐饮',
      '交通': '交通',
      Transport: '交通',
      '购物': '购物',
      Shopping: '购物',
      '娱乐': '娱乐',
      Entertainment: '娱乐',
      '医疗': '医疗',
      Medical: '医疗',
      '教育': '教育',
      Education: '教育',
      '收入': '收入',
      Income: '收入',
      '其他': '其他',
      Other: '其他',
    };
    return map[key] || '其他';
  };

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
      const cat = normalizeCategory(t.category);
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });
    let pieData = Object.entries(categoryMap).map(([name, value]) => ({
      name, value, color: CATEGORIES.find(c => c.label === name)?.hex || '#ccc'
    })).sort((a, b) => b.value - a.value);

    // Mock pie data when no transactions
    if (pieData.length === 0) {
      pieData = [
        { name: '餐饮', value: 1280, color: '#FF6B6B' },
        { name: '交通', value: 420, color: '#4ECDC4' },
        { name: '购物', value: 860, color: '#FFE66D' },
        { name: '娱乐', value: 350, color: '#A78BFA' },
        { name: '医疗', value: 200, color: '#F97316' },
        { name: '教育', value: 150, color: '#34D399' },
      ];
    }

    // Trend Data (Last 7 Days)
    const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    const rawTrendData = last7Days.map(day => ({
      date: format(day, 'MM-dd'),
      amount: transactions.filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), day)).reduce((sum, t) => sum + t.amount, 0)
    }));
    // Mock trend data when all amounts are 0
    const trendData = rawTrendData.every(d => d.amount === 0)
      ? [
          { date: format(subDays(new Date(), 6), 'MM-dd'), amount: 180 },
          { date: format(subDays(new Date(), 5), 'MM-dd'), amount: 320 },
          { date: format(subDays(new Date(), 4), 'MM-dd'), amount: 150 },
          { date: format(subDays(new Date(), 3), 'MM-dd'), amount: 480 },
          { date: format(subDays(new Date(), 2), 'MM-dd'), amount: 260 },
          { date: format(subDays(new Date(), 1), 'MM-dd'), amount: 390 },
          { date: format(new Date(), 'MM-dd'), amount: 210 },
        ]
      : rawTrendData;

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
      isOverBudgetRisk
    };
  }, [transactions, budget, currentDate, filterType, searchQuery]);


  const totalAssets = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  const [vaultCap, setVaultCap] = useState<number>(() => {
    const raw = localStorage.getItem('vault_cap_v1');
    const v = raw ? Number(raw) : NaN;
    return Number.isFinite(v) && v > 0 ? v : 10000;
  });
  const [vaultCoins, setVaultCoins] = useState<Array<{ id: string; seed: number }>>([]);
  const [vaultGlowTick, setVaultGlowTick] = useState(0);
  const [vaultRipples, setVaultRipples] = useState<Array<{ id: string; seed: number }>>([]);
  const [vaultPopCoin, setVaultPopCoin] = useState<{ id: string; seed: number } | null>(null);
  const [vaultMilestoneRipples, setVaultMilestoneRipples] = useState<Array<{ id: string; amount: number }>>([]);
  const vaultMilestoneRippledRef = useRef<Set<number>>(new Set());
  const isVaultMutedRef = useRef(false);
  const pendingVaultDropsRef = useRef(0);
  const prevTotalAssetsRef = useRef<number>(totalAssets);
  const vaultTiltX = useMotionValue(0);
  const vaultTiltY = useMotionValue(0);
  const vaultTiltXSmooth = useSpring(vaultTiltX, { mass: 1, damping: 18, stiffness: 120 });
  const vaultTiltYSmooth = useSpring(vaultTiltY, { mass: 1, damping: 18, stiffness: 120 });
  const [hasVaultTiltPermission, setHasVaultTiltPermission] = useState(false);
  const vaultReflectionX = useTransform(vaultTiltXSmooth, [-1, 1], ['-30%', '30%']);
  const vaultReflectionY = useTransform(vaultTiltYSmooth, [-1, 1], ['-14%', '14%']);
  const vaultPileX = useTransform(vaultTiltXSmooth, [-1, 1], [-6, 6]);
  const vaultPileY = useTransform(vaultTiltYSmooth, [-1, 1], [4, -4]);

  const vaultAudioCtxRef = useRef<AudioContext | null>(null);
  const vaultLastAudioAtRef = useRef(0);
  const vaultCoinRuntimesRef = useRef(new Map<string, any>());

  const vaultFillPct = useMemo(() => {
    const cap = Math.max(1000, vaultCap);
    return clamp(totalAssets / cap, 0, 1);
  }, [totalAssets, vaultCap]);

  const computeVaultMilestones = (amount: number) => {
    const a = Math.max(0, amount);
    const minMajor = 10000;
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1, a))));
    const multipliers = [1, 2, 5, 10];
    const majorFound = multipliers.map(m => m * pow).find(v => v > a) ?? 10 * pow;
    const major = Math.max(minMajor, majorFound);
    const minor = major / 5;

    const prevMinor = Math.floor(a / minor) * minor;
    let nextMinor = Math.ceil(a / minor) * minor;
    if (nextMinor <= a) nextMinor += minor;

    const out: number[] = [];
    if (prevMinor > 0 && prevMinor < a) out.push(prevMinor);
    out.push(nextMinor);
    if (major !== nextMinor) out.push(major);
    while (out.length < 3) out.push(out[out.length - 1] + major / 2);
    return Array.from(new Set(out.map(v => Math.round(v)))).sort((x, y) => x - y).slice(0, 3);
  };

  const vaultMilestones = useMemo(() => computeVaultMilestones(totalAssets), [totalAssets]);
  const vaultNextTarget = useMemo(() => {
    return vaultMilestones.find(v => v > totalAssets) ?? (vaultMilestones[vaultMilestones.length - 1] || 10000);
  }, [vaultMilestones, totalAssets]);

  useEffect(() => {
    if (activeTab !== 'vault') return;
    const pilePct = clamp(10 + vaultFillPct * 72, 10, 84);
    for (const m of vaultMilestones) {
      const linePct = clamp(10 + clamp(m / Math.max(1000, vaultCap), 0, 1) * 72, 10, 84);
      if (pilePct < linePct) continue;
      if (vaultMilestoneRippledRef.current.has(m)) continue;
      vaultMilestoneRippledRef.current.add(m);
      const id = crypto.randomUUID();
      setVaultMilestoneRipples(prev => [...prev, { id, amount: m }].slice(-8));
      window.setTimeout(() => setVaultMilestoneRipples(prev => prev.filter(r => r.id !== id)), 950);
    }
  }, [activeTab, vaultFillPct, vaultMilestones, vaultCap]);

  const queueVaultCoins = (count: number) => {
    const next = Math.max(0, Math.min(30, count));
    if (next === 0) return;
    setVaultGlowTick(v => v + 1);
    setVaultCoins(prev => {
      const added = Array.from({ length: next }).map(() => ({ id: crypto.randomUUID(), seed: Math.random() }));
      const merged = [...prev, ...added];
      return merged.length > 24 ? merged.slice(merged.length - 24) : merged;
    });
  };

  useEffect(() => {
    const prev = prevTotalAssetsRef.current;
    prevTotalAssetsRef.current = totalAssets;
    if (totalAssets <= prev) return;

    const nextCap = Math.max(vaultCap, totalAssets, ...computeVaultMilestones(totalAssets), 10000);
    if (nextCap !== vaultCap) {
      setVaultCap(nextCap);
      localStorage.setItem('vault_cap_v1', String(nextCap));
    }

    const dropCount = 6;
    if (activeTab === 'vault') {
      queueVaultCoins(dropCount);
    } else {
      pendingVaultDropsRef.current = Math.min(30, pendingVaultDropsRef.current + dropCount);
    }
  }, [totalAssets, activeTab, vaultCap]);

  useEffect(() => {
    if (activeTab !== 'vault') return;
    const pending = pendingVaultDropsRef.current;
    if (pending <= 0) return;
    pendingVaultDropsRef.current = 0;
    queueVaultCoins(pending);
  }, [activeTab]);

  const requestVaultTiltPermission = async () => {
    if (hasVaultTiltPermission) return true;
    const req = (DeviceOrientationEvent as any)?.requestPermission;
    if (typeof req !== 'function') {
      setHasVaultTiltPermission(true);
      return true;
    }
    try {
      const result = await req();
      const ok = result === 'granted';
      setHasVaultTiltPermission(ok);
      return ok;
    } catch {
      setHasVaultTiltPermission(false);
      return false;
    }
  };

  useEffect(() => {
    if (activeTab !== 'vault') return;
    const handler = (e: DeviceOrientationEvent) => {
      if (typeof e.gamma !== 'number' || typeof e.beta !== 'number') return;
      const nx = clamp(e.gamma / 30, -1, 1);
      const ny = clamp((e.beta - 20) / 40, -1, 1);
      vaultTiltX.set(nx);
      vaultTiltY.set(ny);
    };
    window.addEventListener('deviceorientation', handler, { passive: true });
    return () => window.removeEventListener('deviceorientation', handler as any);
  }, [activeTab, vaultTiltX, vaultTiltY]);

  const triggerVaultRipple = () => {
    const id = crypto.randomUUID();
    const seed = Math.random();
    setVaultRipples(prev => [...prev, { id, seed }].slice(-3));
    window.setTimeout(() => setVaultRipples(prev => prev.filter(r => r.id !== id)), 900);
  };

  const triggerVaultPopCoin = () => {
    const id = crypto.randomUUID();
    const seed = Math.random();
    setVaultPopCoin({ id, seed });
    window.setTimeout(() => setVaultPopCoin(cur => (cur?.id === id ? null : cur)), 900);
  };

  const ensureVaultAudio = async () => {
    const AudioCtor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return null;
    if (!vaultAudioCtxRef.current) vaultAudioCtxRef.current = new AudioCtor();
    const ctx = vaultAudioCtxRef.current;
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { }
    }
    return ctx;
  };

  const playVaultClink = async (intensity: number) => {
    if (isVaultMutedRef.current) return;
    const now = performance.now();
    if (now - vaultLastAudioAtRef.current < 70) return;
    vaultLastAudioAtRef.current = now;

    const ctx = await ensureVaultAudio();
    if (!ctx) return;
    if (ctx.state !== 'running') return;

    const t0 = ctx.currentTime;
    const i = clamp(intensity, 0, 1);
    const variant = Math.floor(Math.random() * 4);
    const base = [980, 1220, 1480, 1780][variant] * (0.92 + Math.random() * 0.16);

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const gain = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    const hp = ctx.createBiquadFilter();

    oscA.type = 'triangle';
    oscB.type = 'sine';
    oscA.frequency.setValueAtTime(base, t0);
    oscB.frequency.setValueAtTime(base * 2.01, t0);

    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(base * 1.18, t0);
    bp.Q.setValueAtTime(10 + i * 14, t0);

    hp.type = 'highpass';
    hp.frequency.setValueAtTime(520, t0);

    const vol = 0.02 + i * 0.085;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.20 + i * 0.10);

    oscA.connect(bp);
    oscB.connect(bp);
    bp.connect(hp);
    hp.connect(gain);
    gain.connect(ctx.destination);

    const bend = 1 + i * 0.12;
    oscA.frequency.exponentialRampToValueAtTime(base * bend, t0 + 0.04);
    oscB.frequency.exponentialRampToValueAtTime(base * 2.01 * (1 + i * 0.08), t0 + 0.05);

    oscA.start(t0);
    oscB.start(t0);
    oscA.stop(t0 + 0.28);
    oscB.stop(t0 + 0.28);

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(10 + Math.round(i * 16));
      }
    } catch { }
  };

  useEffect(() => {
    if (activeTab !== 'vault') return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.028, Math.max(0.008, (now - last) / 1000));
      last = now;
      const runtimes = Array.from(vaultCoinRuntimesRef.current.values());
      if (!runtimes.length) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const g = 2600;
      const bounce = 0.42;
      const pairRestitution = 0.06;
      const pairFriction = 0.86;

      for (const r of runtimes) {
        r.velY += g * dt;
        r.posY += r.velY * dt;
        r.posX += r.velX * dt;

        r.velX += Math.sin(now / 620 + r.seed * 12) * 26 * dt;
        r.velX = clamp(r.velX, -520, 520);

        r.rotateY.set((r.rotateY.get() + r.spin * dt) % 360);
        r.rotateZ.set((r.rotateZ.get() + r.spin * 0.6 * dt + Math.sin(now / 480 + r.seed * 18) * 6 * dt) % 360);

        if (r.posY >= r.groundY) {
          const impactSpeed = Math.abs(r.velY);
          r.posY = r.groundY;
          if (!r.landed) {
            r.landed = true;
            const intensity = clamp(impactSpeed / 1700, 0, 1);
            void playVaultClink(intensity);
          }

          if (impactSpeed > 140) r.bounces += 1;
          const k = r.bounces >= 3 ? 0.18 : bounce;
          r.velY = -r.velY * k;
          r.velX *= 0.82;
          r.scale.set(1.02);
        } else {
          r.scale.set(1);
        }

        r.x.set(r.posX);
        r.y.set(r.posY);
      }

      for (let i = 0; i < runtimes.length; i += 1) {
        for (let j = i + 1; j < runtimes.length; j += 1) {
          const a = runtimes[i];
          const b = runtimes[j];
          const dx = b.posX - a.posX;
          const dy = b.posY - a.posY;
          const dist2 = dx * dx + dy * dy;
          const r = Math.max(10, Math.min(a.radius, b.radius));
          const minDist = r * 2;
          if (dist2 <= 0 || dist2 > minDist * minDist) continue;

          const dist = Math.sqrt(dist2);
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          a.posX -= nx * overlap * 0.5;
          a.posY -= ny * overlap * 0.5;
          b.posX += nx * overlap * 0.5;
          b.posY += ny * overlap * 0.5;

          const rvx = b.velX - a.velX;
          const rvy = b.velY - a.velY;
          const vn = rvx * nx + rvy * ny;
          if (vn > 0) continue;

          const impulse = -(1 + pairRestitution) * vn * 0.5;
          a.velX -= impulse * nx;
          a.velY -= impulse * ny;
          b.velX += impulse * nx;
          b.velY += impulse * ny;

          a.velX *= pairFriction;
          b.velX *= pairFriction;

          const strength = Math.abs(vn);
          if (strength > 520) {
            const intensity = clamp(strength / 1800, 0, 1);
            void playVaultClink(intensity);
          }
        }
      }

      for (const r of runtimes) {
        if (r.posY > r.groundY) r.posY = r.groundY;
        r.x.set(r.posX);
        r.y.set(r.posY);
      }

      for (const r of runtimes) {
        if (r.posY >= r.groundY - 0.5 && Math.abs(r.velY) < 36 && Math.abs(r.velX) < 18 && r.bounces >= 2) {
          r.settledFrames += 1;
        } else {
          r.settledFrames = 0;
        }
        if (r.settledFrames > 22) {
          vaultCoinRuntimesRef.current.delete(r.id);
          r.onRest(r.id);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeTab]);

  const assetDashboard = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
    const netChangeByDay: Record<string, number> = {};
    days.forEach(d => { netChangeByDay[format(d, 'yyyy-MM-dd')] = 0; });

    transactions.forEach(t => {
      const key = format(parseISO(t.date), 'yyyy-MM-dd');
      if (key in netChangeByDay) {
        netChangeByDay[key] += t.type === 'income' ? t.amount : -t.amount;
      }
    });

    const netChangeTotal = Object.values(netChangeByDay).reduce((s, v) => s + v, 0);
    let running = totalAssets - netChangeTotal;
    const netWorthSeries = days.map(d => {
      const key = format(d, 'yyyy-MM-dd');
      running += netChangeByDay[key] || 0;
      return { date: format(d, 'MM-dd'), value: Math.max(0, running) };
    });

    const liabilities = accounts.reduce((sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
    const assetsPositive = accounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
    const netAssets = Math.max(assetsPositive - liabilities, 0);

    const cash = accounts
      .filter(a => a.type === 'cash' || a.type === 'wechat' || a.type === 'alipay')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const savings = accounts
      .filter(a => a.type === 'bank')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const investment = 0;

    return {
      netWorthSeries,
      liabilityPie: [
        { name: t('assets_dashboard.net_assets'), value: netAssets, color: '#22c55e' },
        { name: t('assets_dashboard.liabilities'), value: liabilities, color: '#ef4444' },
      ],
      distributionPie: [
        { name: t('assets_dashboard.cash'), value: cash, color: '#3b82f6' },
        { name: t('assets_dashboard.savings'), value: savings, color: '#a855f7' },
        { name: t('assets_dashboard.investment'), value: investment, color: '#f59e0b' },
      ],
      liabilities,
      netAssets,
      cash,
      savings,
      investment,
    };
  }, [transactions, accounts, totalAssets, t, i18n.language]);

  const vaultTrendPath = useMemo(() => {
    const series = assetDashboard.netWorthSeries;
    if (!series.length) return '';
    const values = series.map(s => s.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    const last = Math.max(1, series.length - 1);
    return series.map((p, idx) => {
      const x = (idx / last) * 100;
      const y = 100 - ((p.value - min) / range) * 100;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  }, [assetDashboard.netWorthSeries]);

  const moduleQuery = searchQuery.trim().toLowerCase();
  const matchesModuleQuery = (t: Transaction) => {
    if (!moduleQuery) return true;
    const note = (t.note || '').toLowerCase();
    const category = (t.category || '').toLowerCase();
    const tags = (t.tags || []).map(x => x.toLowerCase());
    return note.includes(moduleQuery) || category.includes(moduleQuery) || tags.some(tag => tag.includes(moduleQuery));
  };

  const homeToday = useMemo(() => {
    const today = new Date();
    const items = transactions.filter(t => isSameDay(parseISO(t.date), today) && matchesModuleQuery(t));
    const expense = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { expense, count: items.length };
  }, [transactions, moduleQuery]);

  const homeMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const items = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }) && matchesModuleQuery(t));
    const expenseItems = items.filter(t => t.type === 'expense');
    const expense = expenseItems.reduce((s, t) => s + t.amount, 0);
    const usedPct = budget <= 0 ? 0 : clamp(expense / budget, 0, 1) * 100;
    const remaining = Math.max(budget - expense, 0);

    const categoryTotals: Record<string, number> = {};
    expenseItems.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const topCategories = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(item => {
        const pct = expense <= 0 ? 0 : (item.value / expense) * 100;
        const meta = CATEGORIES.find(c => c.label === item.name);
        return { ...item, pct, color: meta?.hex || '#6366f1', icon: meta?.icon || '•' };
      });

    return { expense, usedPct, remaining, topCategories };
  }, [transactions, currentDate, budget, moduleQuery]);

  const homeWeekSeries = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
    return days.map(d => {
      const amount = transactions
        .filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), d) && matchesModuleQuery(t))
        .reduce((s, t) => s + t.amount, 0);
      return { date: format(d, 'MM-dd'), amount };
    });
  }, [transactions, moduleQuery]);

  const useViewportVisible = (ref: React.RefObject<HTMLElement | null>, enabled: boolean) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (!enabled || isVisible) return;
      const el = ref.current;
      if (!el) return;
      const root = el.closest('main');
      let observer: IntersectionObserver | null = null;
      const timer = window.setTimeout(() => {
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const ratio = typeof entry.intersectionRatio === 'number' ? entry.intersectionRatio : 0;
            const rootBounds = entry.rootBounds;
            const boundsOk = !rootBounds || (
              entry.boundingClientRect.bottom > rootBounds.top
              && entry.boundingClientRect.top < rootBounds.bottom
            );
            if (entry.isIntersecting && ratio >= 0.2 && boundsOk) {
              setIsVisible(true);
              observer?.unobserve(entry.target);
              break;
            }
          }
        }, { root, threshold: 0.2, rootMargin: "0px 0px -50px 0px" });
        observer.observe(el);
      }, 300);

      return () => {
        window.clearTimeout(timer);
        observer?.disconnect();
      };
    }, [enabled, isVisible, ref]);

    return isVisible;
  };

  const TopCategoriesWidget = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const isVisible = useViewportVisible(ref, activeTab === 'list');

    return (
      <div ref={ref} className={cn("p-6", surfaceCard())}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.top_categories')}</div>
            <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-[#6E6E73]" : "text-gray-800")}>{t('home_widgets.top_categories_desc')}</div>
          </div>
          <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>TOP3</div>
        </div>

        {homeMonth.topCategories.length === 0 ? (
          <div className={cn("p-6 rounded-2xl border-2 border-dashed text-center", isDarkUI ? "border-slate-700 text-white/50" : "border-gray-100 text-gray-400")}>
            <div className="text-xs font-bold">{t('home_widgets.month_no_expense')}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {homeMonth.topCategories.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={(e) => { e.stopPropagation(); setSearchQuery(c.name); setFilterType('month'); }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.99]",
                  isDarkUI ? "bg-slate-800/40 border-slate-700 hover:bg-slate-800/55" : "bg-white/60 border-white/70 hover:bg-white/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}22`, color: c.color }}>
                      <span className="text-sm">{c.icon}</span>
                    </div>
                    <div className="text-sm font-black">{t(`categories.${c.name}`)}</div>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{c.pct.toFixed(0)}%</div>
                  </div>
                  <div className={cn("text-[10px] font-black", mutedText)}>{formatMoney(c.value)}</div>
                </div>
                <div className={cn("mt-3 h-2 rounded-full overflow-hidden", isDarkUI ? "bg-[#F2F2F7]" : "bg-[#E8E8ED]")}>
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ width: isVisible ? `${clamp(c.pct, 0, 100)}%` : '0%', backgroundColor: c.color }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
        <div className={cn("mt-4 text-[10px] font-bold", mutedText)}>{t('home_widgets.top_categories_click_hint')}</div>
      </div>
    );
  };

  const MonthRemainingBudgetCard = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const isVisible = useViewportVisible(ref, activeTab === 'list');
    const pct = Math.min(homeMonth.usedPct, 100);
    return (
      <motion.div
        ref={ref}
        layout
        className={cn("min-w-[240px] snap-start p-5", surfaceCard())}
      >
        <div className="flex items-center justify-between">
          <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.month_remaining_budget')}</div>
          <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{Math.max(0, 100 - homeMonth.usedPct).toFixed(0)}%</div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="text-lg font-black">{formatMoney(homeMonth.remaining)}</div>
          <div className={cn("text-[10px] font-bold", mutedText)}>{t('home_widgets.used_prefix')} {formatMoney(homeMonth.expense)}</div>
        </div>
        <div className={cn("mt-4 h-3 rounded-full overflow-hidden", isDarkUI ? "bg-[#F2F2F7]" : "bg-gray-100")}>
          <div
            className={cn("h-full transition-all duration-1000 ease-out", homeMonth.usedPct > 90 ? "bg-rose-500" : "bg-emerald-500")}
            style={{ width: isVisible ? `${pct}%` : '0%' }}
          />
        </div>
        <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>{t('home_widgets.progress_hint')}</div>
      </motion.div>
    );
  };

  const BudgetProgressWidget = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const isVisible = useViewportVisible(ref, activeTab === 'list');
    const pct = Math.min(stats.budgetUsage, 100);
    return (
      <div
        ref={ref}
        className={cn(
          "p-[5vw] backdrop-blur-[3vw] transition-all",
          surfaceCard()
        )}
      >
        <div className="flex flex-col mb-[4vw]">
          <div className="flex justify-between items-baseline gap-[4vw]">
            <div className="min-w-0 flex items-baseline space-x-[2.5vw] overflow-hidden">
              <div className={cn("w-[7vw] h-[7vw] rounded-[2.8vw] flex items-center justify-center shadow-[0_1vw_3vw_rgba(0,0,0,0.25)] flex-shrink-0 text-[4vw]", theme.primary)}>
                <PieIcon size="1em" className="text-white max-w-full h-auto" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="text-[3.2vw] leading-none font-black text-gray-400 uppercase tracking-widest max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {t('monthly_budget')}
                </div>
              </div>
            </div>
            <div className="min-w-0 overflow-hidden text-right">
              <div className="text-[3.2vw] leading-none font-black text-gray-400 uppercase tracking-widest max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {t('budget_remaining')}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-baseline gap-[4vw] mt-[1.8vw]">
            <div className="min-w-0 flex items-baseline space-x-[2.5vw] overflow-hidden">
              <div aria-hidden className="w-[7vw] h-[7vw] flex-shrink-0" />
              <div className="min-w-0 overflow-hidden flex-shrink flex items-center gap-[2vw]">
                <p className="text-[4.5vw] leading-none font-black max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {formatMoney(budget)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBudgetDraft(String(budget));
                    setIsBudgetEditModalOpen(true);
                  }}
                  className="w-[5vw] h-[5vw] rounded-full flex items-center justify-center bg-[#F2F2F7] hover:bg-[#E8E8ED] active:scale-90 transition-all flex-shrink-0"
                >
                  <Pencil size="0.55em" className="text-[#6E6E73]" />
                </button>
              </div>
            </div>
            <p
              className={cn(
                "text-[4.5vw] leading-none font-black max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                stats.budgetUsage > 90 ? "text-red-500" : "text-[#1D1D1F]"
              )}
            >
              {formatMoney(Math.max(budget - stats.expense, 0))}
            </p>
          </div>
        </div>

        <div className="w-full h-[2.2vw] bg-gray-100/50 rounded-full overflow-hidden mb-[4vw] p-[0.6vw]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
              stats.budgetUsage > 90 ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-[#1D1D1F]"
            )}
            style={{ width: isVisible ? `${pct}%` : '0%' }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between items-center px-[1vw]">
          <div className="flex items-center space-x-[2vw] min-w-0 overflow-hidden">
            <div className={cn("px-[2vw] py-[1vw] rounded-[1.5vw] text-[2.8vw] leading-none font-black uppercase whitespace-nowrap", stats.budgetUsage > 90 ? "bg-red-100 text-red-500" : "bg-indigo-100 text-indigo-500")}>
              {t('home_widgets.used_prefix')} {stats.budgetUsage.toFixed(1)}%
            </div>
          </div>
          <div className="flex items-center space-x-[1.5vw] text-gray-500 min-w-0 overflow-hidden">
            <span className="text-[3.4vw] leading-none flex-shrink-0">
              <Calculator size="1em" className="max-w-full h-auto" />
            </span>
            <span className="text-[3.2vw] leading-none font-black uppercase tracking-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {t('daily_available', { amount: formatMoney(stats.dailyBudget) })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const groupMonthPoolSpent = useMemo(() => {
    if (!groupSaving) return 0;
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return transactions
      .filter(t =>
        t.type === 'expense'
        && t.visibility === 'group'
        && t.groupId === groupSaving.id
        && !!t.toGroupPool
        && isWithinInterval(parseISO(t.date), { start, end })
      )
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, currentDate, groupSaving?.id]);

  const groupWeekPoolSpent = useMemo(() => {
    if (!groupSaving) return 0;
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    return transactions
      .filter(t =>
        t.type === 'expense'
        && t.visibility === 'group'
        && t.groupId === groupSaving.id
        && !!t.toGroupPool
        && isWithinInterval(parseISO(t.date), { start, end })
      )
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, groupSaving?.id]);

  const groupMonthProgressPct = groupSaving?.publicBudget
    ? clamp((groupMonthPoolSpent / Math.max(groupSaving.publicBudget, 1)) * 100, 0, 100)
    : 0;

  const groupWeekSaved = useMemo(() => {
    if (!groupSaving?.publicBudget) return 0;
    const weeklyBudget = groupSaving.publicBudget / 4;
    return Math.max(weeklyBudget - groupWeekPoolSpent, 0);
  }, [groupSaving?.publicBudget, groupWeekPoolSpent]);

  const appendGroupActivity = (action: GroupActivity['action'], tx: Transaction) => {
    if (!groupSaving) return;
    const activity: GroupActivity = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      actorId: localUserId,
      actorName: localUserName,
      action,
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      note: tx.note,
      toGroupPool: !!tx.toGroupPool,
      likes: [],
      urges: [],
    };
    setGroupActivities(prev => [activity, ...prev].slice(0, 80));
  };

  const toggleGroupReaction = (activityId: string, kind: 'like' | 'urge') => {
    setGroupActivities(prev => prev.map(a => {
      if (a.id !== activityId) return a;
      const key = kind === 'like' ? 'likes' : 'urges';
      const current = a[key];
      const has = current.includes(localUserId);
      const next = has ? current.filter(x => x !== localUserId) : [...current, localUserId];
      return { ...a, [key]: next } as GroupActivity;
    }));
  };

  const loadGroupPool = (): Record<string, GroupSavingGroup> => {
    const raw = localStorage.getItem(GROUP_SAVING_POOL_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, GroupSavingGroup>;
    } catch {
      return {};
    }
  };

  const saveGroupPool = (pool: Record<string, GroupSavingGroup>) => {
    localStorage.setItem(GROUP_SAVING_POOL_KEY, JSON.stringify(pool));
  };

  const createGroupSaving = (name: string) => {
    const pool = loadGroupPool();
    const generateInviteCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let out = '';
      for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
      return out;
    };
    let code = generateInviteCode();
    for (let i = 0; i < 50 && pool[code]; i += 1) code = generateInviteCode();
    const id = crypto.randomUUID();
    const memberMe: GroupSavingMember = { id: localUserId, name: localUserName, color: '#60a5fa', emoji: '🧑' };
    const group: GroupSavingGroup = {
      id,
      name: name.trim() || t('group.default_name'),
      code,
      members: [memberMe],
      publicBudget: 3000,
      createdAt: Date.now(),
    };
    pool[code] = group;
    saveGroupPool(pool);
    setGroupSaving(group);
    setDiscoveryTool(null);
    setActiveTab('groupSaving');
    setGroupActivities([]);
  };

  const joinGroupSaving = (codeRaw: string) => {
    const code = codeRaw.trim().toUpperCase();
    if (!code) return;
    const pool = loadGroupPool();
    const found = pool[code];
    if (!found) {
      alert(t('group_not_found'));
      return;
    }
    const already = found.members.some(m => m.id === localUserId);
    const next: GroupSavingGroup = already ? found : { ...found, members: [{ id: localUserId, name: localUserName, color: '#60a5fa', emoji: '🧑' }, ...found.members] };
    pool[code] = next;
    saveGroupPool(pool);
    setGroupSaving(next);
    setDiscoveryTool(null);
    setActiveTab('groupSaving');
  };

  const [pendingInvite, setPendingInvite] = useState<null | { code: string; name: string }>(null);

  const clearInviteParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('inviteCode');
    url.searchParams.delete('inviteName');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  };

  const ensureGroupForInvite = (code: string, name: string) => {
    const pool = loadGroupPool();
    if (pool[code]) return;
    const memberMe: GroupSavingMember = { id: localUserId, name: localUserName, color: '#60a5fa', emoji: '🧑' };
    const group: GroupSavingGroup = {
      id: crypto.randomUUID(),
      name: name.trim() || t('group.default_name'),
      code,
      members: [memberMe],
      publicBudget: 3000,
      createdAt: Date.now(),
    };
    pool[code] = group;
    saveGroupPool(pool);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeRaw = params.get('inviteCode');
    if (!codeRaw) return;
    const code = codeRaw.trim().toUpperCase();
    if (!code) return;
    const nameParam = params.get('inviteName') || '';
    const pool = loadGroupPool();
    const name = (nameParam || pool[code]?.name || t('group.default_name')).trim();
    setPendingInvite({ code, name });
  }, [t]);

  const updateGroupSaving = (patch: Partial<GroupSavingGroup>) => {
    setGroupSaving(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      const pool = loadGroupPool();
      pool[next.code] = next;
      saveGroupPool(pool);
      return next;
    });
  };

  const leaveGroupSaving = () => {
    if (!confirm(t('leave_group_confirm'))) return;
    setGroupSaving(null);
    setGroupActivities([]);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!groupSaving) return;
      if (e.key !== GROUP_SAVING_POOL_KEY) return;
      const pool = loadGroupPool();
      const updated = pool[groupSaving.code];
      if (!updated) return;
      setGroupSaving(updated);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [groupSaving]);

  const enabledHomeWidgetOrder = useMemo(
    () => homeWidgetConfig.order.filter(id => homeWidgetConfig.enabled[id]),
    [homeWidgetConfig]
  );

  const setHomeWidgetEnabled = (id: HomeWidgetId, enabled: boolean) => {
    setHomeWidgetConfig(prev => {
      const nextEnabled = { ...prev.enabled, [id]: enabled };
      const anyEnabled = prev.order.some(w => nextEnabled[w]);
      if (!anyEnabled) nextEnabled.todayBoard = true;
      return { ...prev, enabled: nextEnabled };
    });
  };

  const handleHomeWidgetsReorder = (nextEnabledOrder: HomeWidgetId[]) => {
    setHomeWidgetConfig(prev => {
      let i = 0;
      const nextOrder = prev.order.map(id => (prev.enabled[id] ? nextEnabledOrder[i++] : id));
      return { ...prev, order: nextOrder };
    });
  };

  const clearHomeLongPress = () => {
    if (homeLongPressTimeoutRef.current != null) {
      window.clearTimeout(homeLongPressTimeoutRef.current);
      homeLongPressTimeoutRef.current = null;
    }
    homeLongPressStartRef.current = null;
    homeLongPressFiredRef.current = false;
  };

  const markHomeEditInteracted = () => {
    if (hasInteractedWithEdit) return;
    setHasInteractedWithEdit(true);
    localStorage.setItem(HOME_EDIT_HINT_KEY, 'true');
  };

  const beginHomeLongPress = (e: React.PointerEvent) => {
    if (isHomeEditMode) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    homeLongPressStartRef.current = { x: e.clientX, y: e.clientY };
    homeLongPressFiredRef.current = false;
    if (homeLongPressTimeoutRef.current != null) window.clearTimeout(homeLongPressTimeoutRef.current);
    homeLongPressTimeoutRef.current = window.setTimeout(() => {
      homeLongPressFiredRef.current = true;
      markHomeEditInteracted();
      setIsHomeEditMode(true);
    }, 420);
  };

  const moveHomeLongPress = (e: React.PointerEvent) => {
    if (!homeLongPressStartRef.current) return;
    const dx = e.clientX - homeLongPressStartRef.current.x;
    const dy = e.clientY - homeLongPressStartRef.current.y;
    if (dx * dx + dy * dy > 12 * 12) {
      clearHomeLongPress();
    }
  };

  const endHomeLongPress = () => {
    if (!homeLongPressFiredRef.current) clearHomeLongPress();
    else {
      if (homeLongPressTimeoutRef.current != null) {
        window.clearTimeout(homeLongPressTimeoutRef.current);
        homeLongPressTimeoutRef.current = null;
      }
      homeLongPressStartRef.current = null;
    }
  };

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
    const normalizedVisibility = t.visibility || 'private';
    const normalizedGroupId = normalizedVisibility === 'group' ? (t.groupId || groupSaving?.id) : undefined;
    const normalizedToPool = normalizedVisibility === 'group' ? !!t.toGroupPool : false;
    const newTransaction: Transaction = { ...t, id, visibility: normalizedVisibility, groupId: normalizedGroupId, toGroupPool: normalizedToPool };

    if (editingTransaction) {
      const wasGroup = editingTransaction.visibility === 'group' && !!editingTransaction.groupId;
      const nowGroup = newTransaction.visibility === 'group' && !!newTransaction.groupId;
      if (!wasGroup && nowGroup && newTransaction.groupId === groupSaving?.id) appendGroupActivity('add', newTransaction);
      else if (wasGroup && !nowGroup && editingTransaction.groupId === groupSaving?.id) appendGroupActivity('delete', editingTransaction);
      else if (wasGroup && nowGroup && newTransaction.groupId === groupSaving?.id) appendGroupActivity('edit', newTransaction);
      setTransactions(prev => prev.map(item => item.id === id ? newTransaction : item));
    } else {
      if (newTransaction.visibility === 'group' && newTransaction.groupId === groupSaving?.id) appendGroupActivity('add', newTransaction);
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== t.accountId) return acc;
      if (editingTransaction) {
        const oldImpact = editingTransaction.type === 'expense' ? -editingTransaction.amount : editingTransaction.amount;
        const newImpact = t.type === 'expense' ? -t.amount : t.amount;
        return { ...acc, balance: acc.balance - oldImpact + newImpact };
      }
      const impact = t.type === 'expense' ? -t.amount : t.amount;
      return { ...acc, balance: acc.balance + impact };
    }));
    setIsModalOpen(false);
    setEditingTransaction(null);
    if (activeTab === 'list' && searchQuery) setSearchQuery('');
  };

  const deleteTransaction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirm_delete'))) {
      const toDelete = transactions.find(tx => tx.id === id);
      if (toDelete && toDelete.visibility === 'group' && toDelete.groupId === groupSaving?.id) appendGroupActivity('delete', toDelete);
      if (toDelete) {
        setAccounts(prev => prev.map(acc => {
          if (acc.id !== toDelete.accountId) return acc;
          const impact = toDelete.type === 'expense' ? -toDelete.amount : toDelete.amount;
          return { ...acc, balance: acc.balance - impact };
        }));
      }
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm(t('confirm_reset'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatCurrency = (v: number) => v.toLocaleString(i18n.language === 'en-US' ? 'en-US' : 'zh-CN', { minimumFractionDigits: 2 });
  const formatAssetTotal = (v: number) =>
    v.toLocaleString(i18n.language === 'en-US' ? 'en-US' : 'zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatMilestoneCurrency = (v: number) => Math.round(v).toLocaleString(i18n.language === 'en-US' ? 'en-US' : 'zh-CN', { maximumFractionDigits: 0 });
  const dateLocale = i18n.language === 'zh-CN' ? zhCN : enUS;

  const displayCurrency = useMemo(() => CURRENCIES.find(c => c.code === displayCurrencyCode) || CURRENCIES[0], [displayCurrencyCode]);
  const convertCNYToDisplay = (v: number) => {
    if (displayCurrencyCode === 'CNY') return v;
    const rate = rates[displayCurrencyCode] || 1;
    return v / rate;
  };
  const formatMoney = (amountCNY: number) => `${displayCurrency.symbol}${formatCurrency(convertCNYToDisplay(amountCNY))}`;
  const formatMilestoneMoney = (amountCNY: number) => `${displayCurrency.symbol}${formatMilestoneCurrency(convertCNYToDisplay(amountCNY))}`;

  const proUpsellSheetEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

  const RollingNumber = ({ value }: { value: number }) => {
    const prevRef = useRef(value);
    const direction = value >= prevRef.current ? 1 : -1;
    useEffect(() => {
      prevRef.current = value;
    }, [value]);

    const str = formatCurrency(value);
    return (
      <span className="inline-flex items-end tabular-nums">
        {str.split('').map((ch, idx) => {
          const isDigit = ch >= '0' && ch <= '9';
          if (!isDigit) {
            return <span key={`s-${idx}`} className="inline-block">{ch}</span>;
          }
          return (
            <span key={`d-${idx}`} className="relative inline-block w-[0.62em] h-[1.05em] overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={`${idx}-${ch}`}
                  initial={{ y: 14 * direction, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -14 * direction, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-0 flex items-end justify-center"
                >
                  {ch}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
      </span>
    );
  };

  const GoldCoin = ({
    coinId,
    seed,
    onRest,
  }: {
    coinId: string;
    seed: number;
    onRest: (coinId: string) => void;
  }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useMotionValue(62);
    const rotateY = useMotionValue(0);
    const rotateZ = useMotionValue(seed * 120 - 60);
    const scale = useMotionValue(1);

    useEffect(() => {
      const rect = vaultJarRef.current?.getBoundingClientRect();
      if (!rect) {
        onRest(coinId);
        return;
      }

      const jarW = rect.width;
      const targetX = rect.left + rect.width / 2 + (seed - 0.5) * jarW * 0.6;
      const groundY = rect.top + rect.height * 0.76;
      const radius = Math.max(10, jarW * 0.042);

      let posX = targetX + (seed - 0.5) * jarW * 0.38;
      let posY = -window.innerHeight * 0.18;
      let velX = (seed - 0.5) * 260 + (Math.random() - 0.5) * 80;
      let velY = 0;
      const spin = (seed - 0.5) * 360 + (Math.random() - 0.5) * 140;

      x.set(posX);
      y.set(posY);
      rotateY.set(Math.random() * 360);
      rotateZ.set(seed * 220 - 110);

      const runtime = {
        id: coinId,
        seed,
        x,
        y,
        rotateX,
        rotateY,
        rotateZ,
        scale,
        posX,
        posY,
        velX,
        velY,
        spin,
        groundY,
        radius,
        bounces: 0,
        settledFrames: 0,
        landed: false,
        onRest,
      };
      vaultCoinRuntimesRef.current.set(coinId, runtime);
      return () => { vaultCoinRuntimesRef.current.delete(coinId); };
    }, [coinId, onRest, seed, x, y, rotateX, rotateY, rotateZ, scale]);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-0 pointer-events-none z-[130] will-change-transform"
        style={{
          x,
          y,
          rotateX,
          rotateY,
          rotateZ,
          scale,
          transformPerspective: 900,
          translateZ: 0,
        }}
      >
        <div className="w-[clamp(0.9rem,4vw,1.15rem)] aspect-square rounded-full relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 22%, rgba(29,29,31,0.95) 48%, rgba(29,29,31,0.65) 70%, rgba(0,0,0,0.25) 100%)",
              boxShadow: "0 10px 22px rgba(0,0,0,0.35), 0 0 22px rgba(29,29,31,0.25)",
            }}
          />
          <div
            className="absolute inset-[12%] rounded-full"
            style={{
              backgroundImage:
                "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(0,0,0,0.20)), radial-gradient(circle at 40% 40%, rgba(255,255,255,0.25), transparent 55%)",
              mixBlendMode: "screen",
              opacity: 0.85,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "0.5px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "inset 0 0 0 0.5px rgba(255, 255, 255, 0.8)",
              maskImage: "radial-gradient(circle at 50% 50%, black 48%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 48%, transparent 70%)",
              opacity: 0.75,
            }}
          />
        </div>
      </motion.div>
    );
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'today': return format(currentDate, t('date_formats.filter.today'), { locale: dateLocale });
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, t('date_formats.filter.week'), { locale: dateLocale })} - ${format(end, t('date_formats.filter.week'), { locale: dateLocale })}`;
      }
      case 'year': return format(currentDate, t('date_formats.filter.year'), { locale: dateLocale });
      case 'month': default: return format(currentDate, t('date_formats.filter.month'), { locale: dateLocale });
    }
  };

  const handleLoginSuccess = useCallback(() => {
    localStorage.setItem('auth_done', 'true');
    sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    setLoginFadeOut(true);
    setIsAuthed(true);
    window.setTimeout(() => setLoginFadeOut(false), 450);
  }, []);

  const handleLogout = () => {
    void signOutSupabase();
    localStorage.removeItem('auth_done');
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    sessionStorage.removeItem('login_phone_e164');
    setIsAuthed(false);
    setLoginFadeOut(false);
    setIsLogoutDialogOpen(false);
    setIsBudgetModalOpen(false);
    setIsMenuOpen(false);
  };

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (!isAuthed) {
    return (
      <>
        <LoginScreen onAuthed={handleLoginSuccess} onNotify={showToast} />
        {isToastOpen && (
          <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+1rem)] z-[400] -translate-x-1/2 rounded-full bg-[#1D1D1F]/90 px-4 py-2 text-[11px] font-black text-white shadow-lg backdrop-blur-md">
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <>
    {loginFadeOut && <LoginScreen exiting onAuthed={() => {}} />}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "min-h-screen transition-all duration-1000 pb-[calc(52px+env(safe-area-inset-bottom)+12px)] font-sans relative overflow-hidden",
        cn(theme.appBg, theme.appText)
      )}
    >
      {/* Privacy Lock Screen — main shell */}
      {isLocked && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center p-8", "lux-carbon text-[#111111]")}>
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce", theme.primary)}>
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">{t('security_verification')}</h2>
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
                    else { alert(t('password_incorrect')); setInputPin(''); }
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
      <div
        className={cn(
          "sidebar-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <aside className={cn(
        "sidebar drawer menu-container fixed top-0 left-0 h-[100dvh] w-[280px] z-[70] shadow-2xl transition-transform duration-500 rounded-r-[2.5rem] p-8",
        cn(theme.surface, theme.surfaceBorder, theme.appText, "lux-glass-divider-r"),
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="sidebar-header flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3 min-w-0">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", isDarkMode ? "bg-white text-black" : "bg-black text-white")}>
              <Wallet size={20} />
            </div>
            <span className="min-w-0 truncate whitespace-nowrap font-black text-[clamp(1.05rem,4.6vw,1.25rem)] leading-none tracking-tighter">
              {t('app_name')}
            </span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-50")}><X size={20} /></button>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'list', label: t('bill_detail'), icon: <History size={20} /> },
            { id: 'chart', label: t('stats'), icon: <PieIcon size={20} /> },
            { id: 'groupSaving', label: t('group_saving_title'), icon: <Users size={20} /> },
            { id: 'discovery', label: t('discovery'), icon: <Compass size={20} /> },
            { id: 'settings', label: t('settings'), icon: <Settings size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => {
              if (item.id === 'settings') setIsBudgetModalOpen(true);
              else setActiveTab(item.id as any);
              setIsMenuOpen(false);
            }} className={cn(
              "w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all",
              activeTab === item.id ? cn("bg-[#F2F2F7] lux-ios-glass-subtle", theme.text) : "hover:bg-[#F2F2F7] text-[#6E6E73]"
            )}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "main-content max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-[clamp(1rem,3vw,2rem)] pb-[clamp(1.25rem,3vw,2rem)] space-y-[clamp(1.25rem,3vw,2rem)] relative z-10 flex-1",
        activeTab === 'list'
          ? "pt-[calc(clamp(3.5rem,8vw,5rem)+env(safe-area-inset-top))]"
          : "pt-[env(safe-area-inset-top)]"
      )}>
        {activeTab === 'list' && (
          <header className="main-header flex items-center gap-2 mb-12">
            <button onClick={() => setIsMenuOpen(true)} className={cn("shrink-0 p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
              <Menu size={20} />
            </button>
            <button
              type="button"
              onClick={() => setIsAiBookkeepingOpen(true)}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border p-3 shadow-sm transition-all active:scale-90 hover:opacity-90",
                isDarkMode ? "border-indigo-500/30 bg-slate-800" : "border-indigo-100 bg-white shadow-[0_0_20px_-6px_rgba(99,102,241,0.45)]"
              )}
            >
              <Sparkles size={20} className="shrink-0 text-indigo-500" />
              <span className="text-[10px] font-black leading-none text-indigo-600 whitespace-nowrap">
                {t('ai_bookkeeping.header_button')}
              </span>
            </button>
            <div className="min-w-0 flex-1 text-center px-0.5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{getFilterLabel()}</p>
              <div className="flex items-center justify-center space-x-3 min-w-0">
                <button onClick={() => changeDate('prev')} className="p-1 hover:scale-125 transition-transform"><ChevronLeft size={16} /></button>
                <h1
                  onClick={() => setIsFilterModalOpen(true)}
                  className="min-w-0 truncate whitespace-nowrap text-[clamp(1.05rem,4.6vw,1.25rem)] leading-none font-black cursor-pointer hover:opacity-70"
                >
                  {t('app_name')}
                </h1>
                <button onClick={() => changeDate('next')} className="p-1 hover:scale-125 transition-transform"><ChevronRight size={16} /></button>
              </div>
            </div>
            <button onClick={() => setIsSearchModalOpen(true)} className={cn("shrink-0 p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
              <Search size={20} />
            </button>
          </header>
        )}

        <input
          ref={avatarLibraryInputRef}
          type="file"
          accept="image/*"
          hidden
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.currentTarget.value = '';
            await handleAvatarFile(file);
          }}
        />
        <input
          ref={avatarCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.currentTarget.value = '';
            await handleAvatarFile(file);
          }}
        />

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="tab-panel"
            >
              {activeTab === 'list' && (
                <div className="space-y-8">
                  {isHomeEditMode && (
                    <motion.div
                      className="fixed inset-0 z-[80] bg-white backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => setIsHomeEditMode(false)}
                    />
                  )}

                  <div className="relative z-[90] space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.section_title')}</div>
                        {isHomeEditMode ? (
                          <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-[#6E6E73]" : "text-gray-800")}>
                            {t('home_widgets.hint_edit')}
                          </div>
                        ) : (
                          <AnimatePresence>
                            {!hasInteractedWithEdit && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className={cn("text-xs font-black mt-1", "text-[#86868B]")}
                              >
                                {t('home_widgets.hint_view')}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { markHomeEditInteracted(); setIsHomeEditMode(v => !v); }}
                          className={cn(
                            "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                            isHomeEditMode ? "bg-rose-500 border-rose-500 text-white" : (isDarkUI ? "bg-slate-800/60 border-slate-700 text-[#6E6E73]" : "bg-white/60 border-white/70 text-gray-700")
                          )}
                        >
                          {isHomeEditMode ? t('home_widgets.done') : t('home_widgets.edit')}
                        </motion.button>
                      </div>
                    </div>

                    <Reorder.Group axis="y" values={enabledHomeWidgetOrder} onReorder={handleHomeWidgetsReorder} className="space-y-4">
                      {enabledHomeWidgetOrder.map((wid) => (
                        <Reorder.Item
                          key={wid}
                          value={wid}
                          as="div"
                          layout
                          dragListener={isHomeEditMode}
                          whileDrag={{ scale: 1.02 }}
                          transition={{ type: "spring", damping: 22, stiffness: 260 }}
                          onPointerDown={beginHomeLongPress}
                          onPointerMove={moveHomeLongPress}
                          onPointerUp={(e) => {
                            if (homeLongPressFiredRef.current) { e.preventDefault(); e.stopPropagation(); }
                            endHomeLongPress();
                          }}
                          onPointerCancel={clearHomeLongPress}
                          className="relative"
                        >
                          <motion.div
                            animate={isHomeEditMode ? { rotate: [-0.6, 0.6, -0.6] } : { rotate: 0 }}
                            transition={isHomeEditMode ? { duration: 0.22, repeat: Infinity, ease: "easeInOut" } : { duration: 0.18 }}
                            className="relative"
                          >
                            {isHomeEditMode && (
                              <>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); setHomeWidgetEnabled(wid, false); }}
                                  className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-rose-500 border-4 border-white/90 shadow-xl flex items-center justify-center z-10"
                                  aria-label="remove"
                                >
                                  <Minus size={16} className="text-white" strokeWidth={4} />
                                </motion.button>
                                <div className={cn("absolute -top-2 -left-2 w-9 h-9 rounded-full border-4 shadow-xl flex items-center justify-center z-10", isDarkUI ? "bg-slate-900/80 border-slate-900" : "bg-white/80 border-white")}>
                                  <GripVertical size={16} className={cn(isDarkUI ? "text-[#6E6E73]" : "text-gray-700")} />
                                </div>
                              </>
                            )}

                            {wid === 'todayBoard' && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                  <div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.today_board')}</div>
                                    <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-[#6E6E73]" : "text-gray-800")}>
                                      {moduleQuery ? t('home_widgets.filtered', { query: searchQuery }) : t('home_widgets.swipe_hint')}
                                    </div>
                                  </div>
                                  {moduleQuery && (
                                    <motion.button
                                      whileTap={{ scale: 0.96 }}
                                      onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                                      className={cn(
                                        "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                        isDarkUI ? "bg-slate-800/60 border-slate-700 text-[#6E6E73]" : "bg-white/60 border-white/70 text-gray-700"
                                      )}
                                    >
                                      {t('home_widgets.clear_filter')}
                                    </motion.button>
                                  )}
                                </div>

                                <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
                                  <MonthRemainingBudgetCard />

                                  <motion.div
                                    layout
                                    className={cn("min-w-[240px] snap-start p-5", surfaceCard())}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.today_expense')}</div>
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{format(new Date(), t('date_formats.mm_dd_dot'), { locale: dateLocale })}</div>
                                    </div>
                                    <div className="mt-3 text-2xl font-black tracking-tight">{formatMoney(homeToday.expense)}</div>
                                    <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>{t('home_widgets.search_link_hint')}</div>
                                  </motion.div>

                                  <motion.div
                                    layout
                                    className={cn("min-w-[240px] snap-start p-5", surfaceCard())}
                                  >
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.today_count')}</div>
                                    <div className="mt-3 text-2xl font-black tracking-tight">{homeToday.count} {t('home_widgets.count_unit')}</div>
                                    <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>{t('home_widgets.category_hot_hint')}</div>
                                  </motion.div>
                                </div>
                              </div>
                            )}

                            {wid === 'weekTrend' && (
                              <div className={cn("p-6", surfaceCard())}>
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.week_trend')}</div>
                                    <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-[#6E6E73]" : "text-gray-800")}>{t('home_widgets.week_trend_desc')}</div>
                                  </div>
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>7D</div>
                                </div>

                                {(() => {
                                  const w = 320;
                                  const h = 72;
                                  const max = Math.max(...homeWeekSeries.map(d => d.amount), 1);
                                  const step = homeWeekSeries.length > 1 ? w / (homeWeekSeries.length - 1) : w;
                                  const points = homeWeekSeries.map((d, i) => {
                                    const x = i * step;
                                    const y = h - (d.amount / max) * (h - 10) - 5;
                                    return { x, y };
                                  });
                                  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
                                  return (
                                    <div>
                                      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[80px]">
                                        <defs>
                                          <linearGradient id={`weekLineFill-${wid}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                                          </linearGradient>
                                        </defs>
                                        <motion.path
                                          d={d}
                                          fill="none"
                                          stroke="#10B981"
                                          strokeWidth="4"
                                          strokeLinecap="round"
                                          initial={{ pathLength: 0, opacity: 0.0 }}
                                          animate={{ pathLength: 1, opacity: 1 }}
                                          transition={{ duration: 0.9, ease: "easeOut" }}
                                        />
                                        <motion.path
                                          d={`${d} L ${w} ${h} L 0 ${h} Z`}
                                          fill={`url(#weekLineFill-${wid})`}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
                                        />
                                      </svg>
                                      <div className="mt-3 flex items-center justify-between">
                                        <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.week_total')}</div>
                                        <div className="text-sm font-black">{formatMoney(homeWeekSeries.reduce((s, x) => s + x.amount, 0))}</div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {wid === 'topCategories' && (
                              <TopCategoriesWidget />
                            )}

                            {wid === 'summary' && (
                              <div
                                className={cn(
                                  "p-[6vw] rounded-[10vw] relative overflow-hidden lux-gold-hairline bg-white text-[#111111]"
                                )}
                              >
                                <div className="flex flex-wrap justify-between items-start gap-[4vw] mb-[8vw] relative z-10">
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className={cn("text-[3.5vw] font-black uppercase tracking-[0.2em] mb-[2.5vw]", "text-[#6E6E73]", "max-w-full overflow-hidden text-ellipsis whitespace-nowrap")}>{t('total_assets')}</p>
                                    <div className="text-[8vw] leading-none font-black tracking-tighter flex items-end min-w-0 overflow-hidden text-[#111111]">
                                      <span className="mr-[1.2vw] flex-shrink-0 whitespace-nowrap">{displayCurrency.symbol}</span>
                                      <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap tabular-nums">
                                        {formatAssetTotal(convertCNYToDisplay(totalAssets))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-[#F2F2F7] backdrop-blur-[3vw] lux-ios-glass px-[3vw] py-[1.5vw] rounded-[4vw] text-[3.2vw] font-black uppercase tracking-widest flex items-center space-x-[2vw] max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                    <div className="w-[2vw] h-[2vw] bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                                    <span>{i18n.language}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-[4vw] relative z-10">
                                  <div className="bg-[#F2F2F7] backdrop-blur-[2vw] p-[4vw] rounded-[7vw] lux-ios-glass-subtle transition-transform hover:scale-105 overflow-hidden">
                                    <div className="flex items-center space-x-[2vw] mb-[2vw] min-w-0 overflow-hidden">
                                      <div className="w-[6vw] h-[6vw] bg-red-400/20 rounded-[2vw] flex items-center justify-center flex-shrink-0 text-[4vw]">
                                        <TrendingDown size="4vw" className="text-red-200 max-w-full h-auto" />
                                      </div>
                                      <span className={cn("text-[3.2vw] font-black uppercase tracking-widest", "text-[#6E6E73]", "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-shrink")}>{t('expense')}</span>
                                    </div>
                                    <p className="text-[5vw] font-black max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{formatMoney(stats.expense)}</p>
                                  </div>
                                  <div className="bg-[#F2F2F7] backdrop-blur-[2vw] p-[4vw] rounded-[7vw] lux-ios-glass-subtle transition-transform hover:scale-105 overflow-hidden">
                                    <div className="flex items-center space-x-[2vw] mb-[2vw] min-w-0 overflow-hidden">
                                      <div className="w-[6vw] h-[6vw] bg-green-400/20 rounded-[2vw] flex items-center justify-center flex-shrink-0 text-[4vw]">
                                        <TrendingUp size="4vw" className="text-green-200 max-w-full h-auto" />
                                      </div>
                                      <span className={cn("text-[3.2vw] font-black uppercase tracking-widest", "text-[#6E6E73]", "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-shrink")}>{t('income')}</span>
                                    </div>
                                    <p className="text-[5vw] font-black max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{formatMoney(stats.income)}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {wid === 'budgetProgress' && (
                              <BudgetProgressWidget />
                            )}
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>

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
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-4 ml-1", mutedText)}>{format(parseISO(date), t('date_formats.transactions_group'), { locale: dateLocale })}</p>
                          <div className={cn("overflow-hidden", surfaceCard())}>
                            {items.map((item, idx) => (
                              <div key={item.id} onClick={() => { setEditingTransaction(item); setIsModalOpen(true); }} className={cn("p-5 flex items-center transition-colors group", idx !== items.length - 1 && "border-b", isBlackGold ? "border-[#2A2A2A]" : isDarkMode ? "border-slate-700" : "border-gray-50")}>
                                <div className={cn("w-[44px] h-[44px] rounded-2xl flex items-center justify-center shadow-sm mr-4 shrink-0", CATEGORIES.find(c => c.label === item.category)?.color)}>
                                  <span className="w-[24px] h-[24px] inline-flex items-center justify-center">
                                    <span className="text-[22px] leading-none">
                                      {CATEGORIES.find(c => c.label === item.category)?.icon}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-sm">{t(`categories.${item.category}`)}</span>
                                    <span className={cn("text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase inline-flex items-center justify-center shrink-0 min-w-[65px] whitespace-nowrap ![word-break:keep-all]", chipNeutral)}>{t(`accounts.${accounts.find(a => a.id === item.accountId)?.name}`)}</span>
                                    {item.mood && (
                                      <span className="text-[10px] ml-1 opacity-80">
                                        {item.mood === 'happy' ? '😊' : item.mood === 'neutral' ? '😐' : '😭'}
                                      </span>
                                    )}
                                  </div>
                                  {item.note && <p className={cn("text-[10px] mt-1 line-clamp-1", mutedText)}>{item.note}</p>}
                                  <div className="flex flex-wrap gap-1 mt-1 items-center">
                                    {item.tags?.map(tag => <span key={tag} className="text-[8px] text-indigo-400 font-bold">#{tag}</span>)}
                                    {item.hasImage && <Camera size={10} className="text-gray-300 ml-1" />}
                                    {item.currency && item.currency !== 'CNY' && (
                                      <div className={cn("flex items-center space-x-1 ml-1 px-1.5 py-0.5 rounded-md", isBlackGold ? "bg-[#F2F2F7]" : "bg-blue-50")}>
                                        <Globe size={8} className={cn(isBlackGold ? "text-[#1D1D1F]" : "text-blue-400")} />
                                        <span className={cn("text-[8px] font-black", isBlackGold ? "text-[#1D1D1F]" : "text-blue-400")}>{CURRENCIES.find(c => c.code === item.currency)?.flag} {item.originalAmount?.toFixed(2)}</span>
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
                                        : formatMoney(item.amount)
                                      }
                                    </div>
                                    {item.currency && item.currency !== 'CNY' && (
                                      <p className={cn("text-[8px] font-bold mt-0.5", mutedText)}>
                                        {showOriginalCurrency[item.id] ? `≈ ${formatMoney(item.amount)}` : `${CURRENCIES.find(c => c.code === item.currency)?.flag} ${item.originalAmount?.toFixed(2)}`}
                                      </p>
                                    )}
                                  </motion.div>
                                  <button onClick={(e) => deleteTransaction(item.id, e)} className={cn("p-2 transition-opacity opacity-0 group-hover:opacity-100", isBlackGold ? "text-[#86868B] hover:text-[#1D1D1F]" : "text-gray-200 hover:text-red-400")}><Trash2 size={14} /></button>
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

              {activeTab === 'assets' && (
                <div className="space-y-6 pb-10 p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('discovery')}
                      className={cn("p-2 rounded-2xl active:scale-95 transition-all", surfaceCard("rounded-2xl"))}
                    >
                      <ChevronLeft size={18} className={cn(isDarkUI ? "text-white" : "text-gray-900")} />
                    </button>
                    <div className="text-center">
                      <p className={cn("text-sm font-black", isDarkUI ? "text-white" : "text-gray-900")}>{t('assets_dashboard.title')}</p>
                      <p className={cn("text-[10px] font-bold", mutedText)}>{t('assets_dashboard.subtitle')}</p>
                    </div>
                    <div className="w-10" />
                  </div>

                  <div className={cn("p-8", surfaceCard("lux-asset-sheen"))}>
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.current_total_assets')}</p>
                        <p className="text-3xl font-black font-cinzel">{formatMoney(totalAssets)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.net_assets')}</p>
                        <p className={cn("text-lg font-black font-cinzel", theme.text)}>{formatMoney(assetDashboard.netAssets)}</p>
                      </div>
                    </div>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={assetDashboard.netWorthSeries}>
                          <defs>
                            <linearGradient id="assetsLine" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={accentHex} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={accentHex} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkUI ? "#334155" : "#f1f5f9"} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                          <YAxis hide />
                          <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkUI ? '#1e293b' : '#fff', color: isDarkUI ? '#fff' : '#000', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="value" stroke={accentHex} fillOpacity={1} fill="url(#assetsLine)" strokeWidth={4} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className={cn("p-8", surfaceCard())}>
                      <h3 className="font-black text-lg mb-4 flex items-center"><PieIcon size={20} className="mr-2 text-emerald-500" />{t('assets_dashboard.liability_vs_net')}</h3>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={assetDashboard.liabilityPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                              {assetDashboard.liabilityPie.map((d) => (
                                <Cell key={d.name} fill={d.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkUI ? '#1e293b' : '#fff', color: isDarkUI ? '#fff' : '#000' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className={cn("p-4 rounded-2xl", surfaceCard("rounded-2xl"))}>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.liabilities')}</p>
                          <p className="text-lg font-black text-rose-500">{formatMoney(assetDashboard.liabilities)}</p>
                        </div>
                        <div className={cn("p-4 rounded-2xl", surfaceCard("rounded-2xl"))}>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.net_assets')}</p>
                          <p className={cn("text-lg font-black", theme.text)}>{formatMoney(assetDashboard.netAssets)}</p>
                        </div>
                      </div>
                    </div>

                    <div className={cn("p-8", surfaceCard())}>
                      <h3 className="font-black text-lg mb-4 flex items-center"><Wallet size={20} className="mr-2 text-indigo-500" />{t('assets_dashboard.distribution')}</h3>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={assetDashboard.distributionPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                              {assetDashboard.distributionPie.map((d) => (
                                <Cell key={d.name} fill={d.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkUI ? '#1e293b' : '#fff', color: isDarkUI ? '#fff' : '#000' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {assetDashboard.distributionPie.map(d => {
                          const total = assetDashboard.distributionPie.reduce((s, x) => s + x.value, 0) || 1;
                          const pct = (d.value / total) * 100;
                          return (
                            <div key={d.name} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className={cn("text-xs font-bold", isDarkUI ? "text-[#6E6E73]" : "text-gray-700")}>{d.name}</span>
                              </div>
                              <span className={cn("text-xs font-black", mutedText)}>{pct.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chart' && (
                <StatsCharts />
              )}

              {activeTab === 'discovery' && (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className={cn("p-6 overflow-hidden relative", surfaceCard())}>
                    <div className="absolute inset-0 backdrop-blur-2xl" />
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[90px] opacity-40 bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setIsAvatarActionSheetOpen(true)}
                          className={cn("w-14 h-14 rounded-full backdrop-blur-xl overflow-hidden flex items-center justify-center", isBlackGold ? "lux-carbon-soft" : "bg-white/30 lux-ios-glass-subtle")}
                        >
                          {localUserAvatar ? (
                            <img src={localUserAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <User size={24} className={cn(isBlackGold ? "text-[#1D1D1F]" : (isDarkMode ? "text-white" : "text-gray-800"))} />
                          )}
                        </motion.button>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={openEditName}
                              className={cn("text-sm font-black truncate flex items-center gap-1.5", isDarkMode ? "text-white" : "text-gray-900")}
                            >
                              <span className="min-w-0 truncate">{localUserName}</span>
                              <Pencil size={14} className="text-gray-400" />
                            </motion.button>
                          </div>
                          <p className={cn("text-[10px] font-bold mt-1", mutedText)}>
                            {t(`greeting.${timeContext}`)}{i18n.language === 'zh-CN' ? '，' : ', '}{t('greeting.welcome_back')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tools Grid */}
                  <div className={cn("p-6", surfaceCard())}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-black">{t('common_tools')}</h3>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('toolkit_tag')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'assets', label: t('assets'), Icon: LineIcon, onClick: () => setActiveTab('assets') },
                        { key: 'budget', label: t('settings'), Icon: Settings, onClick: () => setIsBudgetModalOpen(true) },
                        { key: 'export', label: t('export'), Icon: Share2, onClick: () => requestExport('image') },
                        { key: 'savingChallenge', label: t(I18N_KEYS.savingChallenge.title), Icon: Trophy, onClick: () => setDiscoveryTool('savingChallenge') },
                        { key: 'fx', label: t('exchange'), Icon: ArrowRightLeft, onClick: () => setDiscoveryTool('exchange') },
                      ].map(item => (
                        <motion.button
                          key={item.key}
                          whileTap={{ scale: 0.96 }}
                          onClick={item.onClick}
                          className={cn(
                            "p-4 rounded-[1.75rem] border flex flex-col items-center justify-center space-y-2 transition-all",
                            "lux-carbon lux-gold-hairline"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center border",
                            "lux-carbon-soft text-[#1D1D1F]"
                          )}>
                            <item.Icon size={18} />
                          </div>
                          <span className={cn("text-[10px] font-black", isBlackGold ? "text-[#111111]" : isDarkMode ? "text-[#6E6E73]" : "text-gray-700")}>{item.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Finance Management Card */}
                  <div className={cn("p-6 overflow-hidden relative", surfaceCard())}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-sm">{t('finance_management')}</h3>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-[#86868B]" : "text-gray-400")}>
                        {t('finance_health')}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('finance_health')}</div>
                        <div className="flex items-end space-x-2">
                          <div className={cn("text-4xl font-black", stats.budgetUsage > 90 ? "text-rose-500" : theme.text)}>
                            {Math.max(0, Math.min(100, Math.round(100 - stats.budgetUsage)))}
                          </div>
                          <div className={cn("text-xs font-black mb-1", isDarkMode ? "text-white/50" : "text-gray-400")}>/ 100</div>
                        </div>
                        <div className="mt-4 w-full h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700/60">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            style={{ width: `${Math.max(0, Math.min(100, 100 - stats.budgetUsage))}%` }}
                          />
                        </div>
                      </div>
                      <div className={cn("rounded-[2rem] p-4 border", isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-100")}>
                        <div className={cn("text-[10px] font-black uppercase tracking-widest mb-3", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('last7_expense')}</div>
                        <div className="flex items-end justify-between h-14">
                          {stats.trendData.map((d, idx) => (
                            <div key={d.date + idx} className="flex-1 flex justify-center">
                              <div
                                className={cn("w-2 rounded-full", idx === stats.trendData.length - 1 ? "bg-emerald-500" : (isDarkMode ? "bg-white/20" : "bg-emerald-100"))}
                                style={{ height: `${Math.min(56, Math.max(6, d.amount / 20))}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saving tips — fixed quote, random on each visit */}
                  <motion.button
                    type="button"
                    key={wealthTip}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={pickRandomWealthTip}
                    className={cn(
                      "w-full text-left rounded-[2.5rem] p-6 border shadow-sm transition-all active:scale-[0.99]",
                      isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Smile size={18} className={cn(isDarkMode ? "text-[#6E6E73]" : "text-gray-700")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('saving_tips')}</span>
                    </div>
                    <p className={cn("text-sm font-bold leading-relaxed break-words", isDarkMode ? "text-[#E5E5EA]" : "text-zinc-700")}>
                      “{wealthTip}”
                    </p>
                  </motion.button>
                </div>
              )}

              {activeTab === 'groupSaving' && (
                <div className="space-y-5 pt-16">
                  {!groupSaving ? (
                    <>
                      <div className={cn("p-5 rounded-[2rem] border", "lux-carbon-soft")}>
                        <div className="text-sm font-black mb-2">{t('group.create_title')}</div>
                        <div className="text-[10px] font-bold mb-4 text-[#111111]/60">
                          {t('group.create_desc')}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            value={groupDraftName}
                            onChange={(e) => setGroupDraftName(e.target.value)}
                            placeholder={t('group.create_placeholder')}
                            className={cn("flex-1 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none border", "lux-carbon lux-gold-hairline text-[#111111] placeholder:text-[#111111]/35")}
                          />
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => createGroupSaving(groupDraftName)}
                            className={cn("px-5 py-3 rounded-2xl text-xs font-black shadow-lg", "bg-[#1D1D1F] text-white")}
                          >
                            {t('group.create')}
                          </motion.button>
                        </div>
                      </div>

                      <div className={cn("p-5 rounded-[2rem] border", "lux-carbon-soft")}>
                        <div className="text-sm font-black mb-2">{t('group.join_title')}</div>
                        <div className="text-[10px] font-bold mb-4 text-[#111111]/60">
                          {t('group.join_desc')}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            value={groupJoinCode}
                            onChange={(e) => setGroupJoinCode(e.target.value.toUpperCase())}
                            placeholder={t('group.join_placeholder')}
                            className={cn("flex-1 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none tracking-widest uppercase border", "lux-carbon lux-gold-hairline text-[#111111] placeholder:text-[#111111]/35")}
                          />
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => joinGroupSaving(groupJoinCode)}
                            className={cn("px-5 py-3 rounded-2xl text-xs font-black shadow-lg", "lux-carbon-soft text-[#1D1D1F]")}
                          >
                            {t('group.join')}
                          </motion.button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={cn(
                        "p-6 rounded-[2.25rem] border overflow-hidden relative",
                        "lux-carbon-soft"
                      )}>
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[110px] opacity-35 bg-[#1D1D1F]/25" />
                        <div className="relative">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <div className="text-lg font-black">{groupSaving.name}</div>
                                <span
                                  style={{
                                    background: 'rgba(0, 0, 0, 0.04)',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    color: '#6E6E73',
                                    fontSize: '13px',
                                    marginLeft: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  邀请码：{groupSaving.code}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold mt-2 text-[#111111]/60">
                                {t('group.record_tip')}
                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={leaveGroupSaving}
                              className={cn("px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border", "lux-carbon lux-gold-hairline text-[#111111]/70")}
                            >
                              {t('group.leave')}
                            </motion.button>
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <div className="flex -space-x-3">
                              {groupSaving.members.slice(0, 6).map((m) => (
                                <div
                                  key={m.id}
                                  className="w-11 h-11 rounded-2xl border-2 border-white/80 flex items-center justify-center text-sm font-black shadow-sm"
                                  style={{ backgroundColor: `${m.color}22`, color: m.color }}
                                >
                                  <span>{m.emoji}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  const url = new URL(window.location.origin + window.location.pathname);
                                  url.searchParams.set('inviteCode', groupSaving.code);
                                  url.searchParams.set('inviteName', groupSaving.name);
                                  const link = url.toString();
                                  try {
                                    await copyToClipboard(link);
                                    showToast(t('group.invite_copied'));
                                  } catch {
                                    showToast(t('group.invite_copied'));
                                  }
                                }}
                                className="px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-white/55"
                                style={{ color: '#526E60', borderColor: 'rgba(26, 62, 45, 0.12)' }}
                              >
                                {t('group.invite')}
                              </button>
                              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#526E60' }}>
                                {t('group.members', { count: groupSaving.members.length })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn("p-6 rounded-[2.25rem] border", "lux-carbon-soft")}
                        style={{ backgroundColor: '#F2F8F5', borderColor: 'rgba(26, 62, 45, 0.10)' }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm font-black" style={{ color: '#1A3E2D' }}>{t('group.public_pool')}</div>
                            <div className="text-[10px] font-bold mt-1" style={{ color: '#526E60' }}>{t('group.pool_desc')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#526E60' }}>{t('group.used')}</div>
                            <div className="text-sm font-black" style={{ color: '#1A3E2D' }}>{formatMoney(groupMonthPoolSpent)}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <input
                            type="number"
                            value={groupSaving.publicBudget}
                            onChange={(e) => updateGroupSaving({ publicBudget: Number(e.target.value) || 0 })}
                            className={cn("flex-1 px-4 py-3 rounded-2xl text-xs font-black focus:outline-none border", "lux-carbon lux-gold-hairline")}
                            style={{ color: '#1A3E2D', borderColor: 'rgba(26, 62, 45, 0.12)', backgroundColor: 'rgba(255,255,255,0.55)' }}
                          />
                          <div
                            className={cn("px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", "lux-carbon-soft")}
                            style={{ color: '#526E60', borderColor: 'rgba(26, 62, 45, 0.12)', backgroundColor: 'rgba(255,255,255,0.55)' }}
                          >
                            {t('group.month_budget')}
                          </div>
                        </div>

                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(26, 62, 45, 0.08)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${groupMonthProgressPct}%` }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="h-full"
                            style={{ backgroundColor: '#22573E' }}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#526E60' }}>{t('group.progress')}</div>
                          <div className="text-[10px] font-black" style={{ color: '#1A3E2D' }}>{groupMonthProgressPct.toFixed(0)}%</div>
                        </div>
                      </div>

                      <div className={cn("p-6 rounded-[2.25rem] border", "lux-carbon-soft")}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-black">{t('group.saving_wall')}</div>
                            <div className="text-[10px] font-bold mt-1 text-[#111111]/60">{t('group.saved_this_week')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#1D1D1F]">{formatMoney(groupWeekSaved)}</div>
                            <div className="text-[10px] font-bold text-[#111111]/45">{t('group.week_pool_spent', { amount: formatMoney(groupWeekPoolSpent) })}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="text-sm font-black">{t('group.feed')}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#111111]/50">{t('live')}</div>
                        </div>

                        {groupActivities.length === 0 ? (
                          <div className={cn("p-6 rounded-[2rem] border text-center", "lux-carbon-soft text-[#111111]/65")}>
                            <div className="text-sm font-black mb-2">{t('group.empty_title')}</div>
                            <div className="text-[10px] font-bold opacity-70">{t('group.empty_desc')}</div>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[42vh] overflow-y-auto no-scrollbar pr-1">
                            {groupActivities.map((a) => (
                              <div key={a.id} className={cn("p-4 rounded-2xl border", "lux-carbon-soft")}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-xs font-black">
                                      {a.actorId === localUserId ? t('user_title') : a.actorName}
                                      <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-[#111111]/50">
                                        {t(`group.action.${a.action}`)}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold mt-2 text-[#111111]/75">
                                      {t(`categories.${a.category}`)} · {a.type === 'expense' ? '-' : '+'}{formatMoney(a.amount)}
                                      {a.toGroupPool && <span className="ml-2 text-[#1D1D1F] font-black">{t('group.pool_tag')}</span>}
                                    </div>
                                    {a.note && (
                                      <div className="text-[10px] font-bold mt-1 text-[#111111]/45">
                                        {a.note}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-[#111111]/45">
                                    {format(new Date(a.ts), t('date_formats.activity_time'), { locale: dateLocale })}
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center space-x-2">
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => toggleGroupReaction(a.id, 'like')}
                                    className={cn(
                                      "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                      a.likes.includes(localUserId)
                                        ? "bg-[#1D1D1F] text-white"
                                        : "lux-carbon lux-gold-hairline text-[#111111]/70"
                                    )}
                                  >
                                    {t('group.like')} {a.likes.length}
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => toggleGroupReaction(a.id, 'urge')}
                                    className={cn(
                                      "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                      a.urges.includes(localUserId)
                                        ? "bg-rose-500 text-white border-rose-400"
                                        : "lux-carbon lux-gold-hairline text-[#111111]/70"
                                    )}
                                  >
                                    {t('group.urge')} {a.urges.length}
                                  </motion.button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AiBookkeepingChat
        open={isAiBookkeepingOpen}
        onClose={() => setIsAiBookkeepingOpen(false)}
        isDarkMode={isDarkMode}
        formatMoney={formatMoney}
        trCategory={(cat) => {
          const key = `categories.${cat}`;
          const translated = t(key);
          return translated && translated !== key ? translated : cat;
        }}
        parseIntent={parseVoiceIntent}
        onRecordExpense={recordAiBookkeepingExpense}
        onNotify={showToast}
      />

      {/* Voice Recognition Modal */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="speech-modal-overlay fixed inset-0 z-[200] flex items-start justify-center bg-black/20 backdrop-blur-3xl px-[clamp(0.75rem,3vw,1.25rem)] pt-[calc(clamp(0.75rem,3vw,1.25rem)+env(safe-area-inset-top))] pb-[calc(clamp(0.75rem,3vw,1.25rem)+env(safe-area-inset-bottom))] overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="speech-container speech-modal-dialog w-full max-w-sm flex flex-col items-center bg-[#F2F2F7] p-[clamp(1.25rem,4.5vw,2rem)] rounded-[clamp(2.25rem,10vw,3.25rem)] lux-ios-glass shadow-2xl relative overflow-hidden max-h-[calc(100dvh-(clamp(1.5rem,6vw,2.5rem)+env(safe-area-inset-top)+env(safe-area-inset-bottom)))]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 animate-gradient-x" />

              <div className="relative mb-[clamp(1.75rem,6vw,3rem)]">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-4 bg-indigo-500 rounded-full blur-xl"
                />
                <div className="relative w-[clamp(4.25rem,18vw,6rem)] h-[clamp(4.25rem,18vw,6rem)] bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <svg className="w-[clamp(1.75rem,7vw,2.5rem)] h-[clamp(1.75rem,7vw,2.5rem)] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              <h2 className="text-white text-[clamp(1.125rem,5vw,1.5rem)] font-black mb-2 tracking-tight text-center max-w-full">{t('voice.title')}</h2>
              <p className="text-[#86868B] text-[clamp(0.55rem,2.5vw,0.625rem)] font-black uppercase tracking-widest mb-[clamp(1.25rem,4.5vw,2.25rem)] text-center max-w-full">{t('voice.listening')}</p>

              <div className="w-full space-y-[clamp(1rem,4vw,1.5rem)] overflow-y-auto no-scrollbar">
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('voice.placeholder')}
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
                    className="w-full bg-[#F2F2F7] lux-ios-glass-subtle rounded-3xl py-[clamp(0.85rem,3.8vw,1.25rem)] px-[clamp(0.9rem,4vw,1.5rem)] text-white text-center text-[clamp(0.95rem,4vw,1.125rem)] font-bold focus:outline-none focus:ring-4 ring-indigo-500/20 transition-all placeholder:text-white/20 max-w-full"
                  />
                  {voiceText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-[clamp(0.85rem,3.8vw,1.5rem)] p-[clamp(0.85rem,3.8vw,1.5rem)] bg-[#F2F2F7] rounded-[clamp(1.5rem,7vw,2.5rem)] lux-ios-glass-subtle backdrop-blur-md max-w-full"
                    >
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{t('voice.parse_result')}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">
                            {CATEGORIES.find(c => c.label === parseVoiceIntent(voiceText).category)?.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-sm">{parseVoiceIntent(voiceText).category}</p>
                            <p className="text-[#86868B] text-[10px]">{parseVoiceIntent(voiceText).note}</p>
                          </div>
                        </div>
                        <p className="text-white font-black text-xl">{formatMoney(parseVoiceIntent(voiceText).amount)}</p>
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
                        className="w-full mt-[clamp(0.85rem,3.8vw,1.5rem)] py-[clamp(0.75rem,3.5vw,1rem)] bg-indigo-500 text-white rounded-2xl font-black text-[clamp(0.55rem,2.5vw,0.75rem)] uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all max-w-full"
                      >
                        {t('voice.confirm_post')}
                      </button>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={() => setIsVoiceModalOpen(false)}
                  className="mx-auto w-[clamp(2.5rem,12vw,3rem)] h-[clamp(2.5rem,12vw,3rem)] flex items-center justify-center bg-[#F2F2F7] rounded-full text-[#86868B] hover:text-white transition-all lux-ios-glass-subtle"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal — 70vh stacking sheet (方案 B) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="transaction-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }}
          >
            <motion.div
              key="transaction-modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 96 || info.velocity.y > 520) {
                  setIsModalOpen(false);
                  setEditingTransaction(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'w-full max-w-md flex flex-col relative overflow-hidden',
                'rounded-t-[2.5rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)]',
                'bg-white backdrop-blur-[24px] lux-gold-hairline text-[#111111]',
                'h-[70dvh] max-h-[70dvh] min-h-0',
                'pb-[env(safe-area-inset-bottom)]',
                'sm:rounded-[2.5rem] sm:mb-4 sm:h-auto sm:max-h-[min(70dvh,720px)]'
              )}
            >
              <div className="absolute inset-0 backdrop-blur-2xl -z-10 pointer-events-none" />

              <div className="pt-3 pb-3 flex justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none">
                <div className="w-12 h-1.5 rounded-full bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              </div>
              <div className="relative mb-4 h-10 shrink-0 px-8">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }}
                  className={cn(
                    'absolute left-6 -top-1 p-2 rounded-full transition-all active:scale-90 z-10',
                    'lux-carbon-soft text-[#1D1D1F] lux-shimmer-tap'
                  )}
                  aria-label={t('cancel')}
                >
                  <X size={20} />
                </button>
                <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-center whitespace-nowrap pointer-events-none">
                  {editingTransaction ? t('edit_bill') : t('add_bill')}
                </h2>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-8">
                <TransactionForm
                  accounts={accounts}
                  transactions={transactions}
                  rates={rates}
                  onSubmit={addOrUpdateTransaction}
                  initialData={editingTransaction || undefined}
                  onDelete={editingTransaction ? () => { deleteTransaction(editingTransaction.id, { stopPropagation: () => { } } as any); setIsModalOpen(false); } : undefined}
                  isDarkMode={isDarkMode}
                  groupSaving={groupSaving}
                  displayCurrencyCode={displayCurrencyCode}
                  onDisplayCurrencyCodeChange={setDisplayCurrencyCode}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Advanced Filter Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-start justify-center p-0 sm:p-4 bg-black/20 backdrop-blur-md">
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "w-full max-w-md rounded-b-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border",
                "lux-carbon lux-gold-hairline text-[#111111]"
              )}
            >
              <div className="absolute inset-0 backdrop-blur-2xl -z-10" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">{t('search_title')}</h2>
                <button onClick={() => { setIsSearchModalOpen(false); setSearchQuery(''); }} className={cn("p-2 rounded-full border", "lux-carbon-soft text-[#1D1D1F]")}>
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/45" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl font-bold focus:outline-none transition-all",
                    "lux-carbon-soft text-[#111111] placeholder:text-[#111111]/35"
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
                          {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount)}
                        </p>
                      </div>
                    ))
                    .slice(0, 10)
                ) : (
                  <div className="py-10 text-center text-gray-400">
                    <Search size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">{t('search.start_hint')}</p>
                  </div>
                )}
                {searchQuery && transactions.filter(t => t.note?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-center py-10 text-gray-400 text-xs font-bold">{t('search.no_result')}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/20 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[3rem] pt-10 px-10',
              'pb-[calc(8rem+env(safe-area-inset-bottom,0px))]',
              'shadow-2xl max-h-[min(92dvh,100%)] sm:max-h-[85vh] overflow-y-auto no-scrollbar relative',
              isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
            )}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black">{t('settings')}</h2>
              </div>
              <button onClick={() => { setIsBudgetModalOpen(false); setIsLogoutDialogOpen(false); }} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-100")}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-8">
              {/* User Card — 方案 A：高定白悬浮卡，高对比文字 */}
              <div className="p-6 rounded-[2rem] relative overflow-hidden bg-white border border-[rgba(0,0,0,0.06)] shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 right-0 w-32 h-32 bg-zinc-100/90 rounded-full -mr-12 -mt-12 pointer-events-none"
                />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-orange-500/[0.04] rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center space-x-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => avatarLibraryInputRef.current?.click()}
                    aria-label={t('profile.change_avatar')}
                    className="w-14 h-14 shrink-0 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-200/70 shadow-sm cursor-pointer transition-all hover:opacity-80 active:scale-[0.98]"
                  >
                    {localUserAvatar ? (
                      <img src={localUserAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-zinc-700" size={28} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={openEditName}
                      aria-label={t('profile.edit_name')}
                      className="flex w-full min-w-0 items-center gap-1 text-left font-black text-zinc-800 truncate transition-colors hover:text-zinc-600 active:opacity-70"
                    >
                      <span className="min-w-0 truncate">{localUserName}</span>
                      <Pencil size={12} className="shrink-0 text-zinc-400" aria-hidden />
                    </button>
                    <p className="text-[10px] font-bold text-zinc-500">{t('user_id')}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2 relative z-10">
                  <div className="flex-1 py-2 bg-emerald-50 rounded-xl text-[8px] font-black uppercase text-center text-emerald-700 border border-emerald-100/90">
                    {t('settings_syncing')}
                  </div>
                  <div className="flex-1 py-2 bg-zinc-100 rounded-xl text-[8px] font-black uppercase text-center text-zinc-700 border border-zinc-200/80">
                    {t('settings_backup')}
                  </div>
                </div>
              </div>

              {/* Settings List Groups */}
              <div className="space-y-6">
                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">{t('settings_account_security')}</label>
                  <div className={cn("rounded-[2rem] overflow-hidden", isDarkMode ? "bg-slate-700" : "bg-gray-50")}>
                    <div className="p-5 flex items-center justify-between border-b border-black/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded-lg flex items-center justify-center">
                          <Cloud size={18} />
                        </div>
                        <span className="text-sm font-bold">{t('settings_auto_cloud_backup')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-black text-green-500">{t('settings_enabled')}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <button onClick={exportBackup} className="w-full p-5 flex items-center justify-between hover:bg-[#E8E8ED] active:scale-[0.98] transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-500 rounded-lg flex items-center justify-center">
                          <Share2 size={18} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{t('backup_export')}</div>
                          <div className={cn("text-[10px] font-bold", isDarkMode ? "text-[#86868B]" : "text-gray-400")}>{t('backup_export_desc')}</div>
                        </div>
                      </div>
                      <ChevronRight size={18} className={cn(isDarkMode ? "text-white/30" : "text-black/20")} />
                    </button>
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">{t('general')}</label>
                  <div className={cn("rounded-[2rem] overflow-hidden", isDarkMode ? "bg-slate-700" : "bg-gray-50")}>
                    {/* Language Switch */}
                    <button onClick={() => setIsLangPickerOpen(true)} className="w-full p-5 flex items-center justify-between hover:bg-[#E8E8ED] active:scale-[0.98] transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-500 rounded-lg flex items-center justify-center">
                          <Languages size={18} />
                        </div>
                        <span className="text-sm font-bold">{t('language')}</span>
                      </div>
                      <span className="text-xs font-black opacity-40">{i18n.language}</span>
                    </button>
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
                    <span className="text-sm font-black text-rose-500">{t('logout')}</span>
                  </div>
                  <ChevronRight size={18} className="text-rose-400 opacity-70" />
                </button>
                {/* 底部垫高：避开悬浮 TabBar + 凸起加号（仅布局） */}
                <div
                  className="shrink-0 h-[calc(6.5rem+env(safe-area-inset-bottom,0px))]"
                  aria-hidden
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {discoveryTool && (
          <div className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/20 backdrop-blur-md" onClick={() => setDiscoveryTool(null)}>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] pt-8 px-8 pb-[calc(2rem+env(safe-area-inset-bottom)+6rem)] shadow-2xl bg-white backdrop-blur-[24px] lux-gold-hairline text-[#111111] max-h-[calc(100dvh-4rem)] overflow-y-auto"
            >
              <div className="pt-1 pb-6 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">
                  {discoveryTool === 'savingChallenge'
                    ? t(I18N_KEYS.savingChallenge.title)
                    : discoveryTool === 'exchange'
                      ? t('exchange')
                      : t('calculator')}
                </h3>
                <button onClick={() => setDiscoveryTool(null)} className="p-2 rounded-full border lux-carbon-soft text-[#1D1D1F] lux-shimmer-tap">
                  <X size={18} />
                </button>
              </div>

              {discoveryTool === 'savingChallenge' && (
                <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
                  <div className="p-6 rounded-[2.25rem] border overflow-hidden relative bg-gray-50 border-gray-100">
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[120px] opacity-25 bg-emerald-300/30" />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-[120px] opacity-18 bg-teal-300/25" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[1.5rem] flex items-center justify-center border border-emerald-200 bg-emerald-50">
                          <Trophy size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-black">{t(I18N_KEYS.savingChallenge.title)}</div>
                          <div className="text-[10px] font-bold text-[#111111]/60 mt-1">{t(I18N_KEYS.savingChallenge.subtitle)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#111111]/50">{t(I18N_KEYS.savingChallenge.streakLabel)}</div>
                        <div className="text-lg font-black text-emerald-700">{savingChallengeStreak} {t(I18N_KEYS.savingChallenge.dayUnit)}</div>
                      </div>
                    </div>

                    <div className="relative mt-6 flex flex-col items-center text-center">
                      <div className="flex flex-col items-center">
                        <motion.div
                          key={savingChallengeTip}
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          className="mb-4 max-w-[17rem] px-3 py-2 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/80 text-[10px] font-black text-emerald-900 leading-snug"
                        >
                          {savingChallengeTip}
                        </motion.div>

                        <motion.div
                          animate={{ boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 24px rgba(16,185,129,0.22)", "0 0 0 rgba(16,185,129,0)"] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center border", savingChallengeStage.tone)}
                        >
                          <savingChallengeStage.Icon size={34} className="text-emerald-600" />
                        </motion.div>
                      </div>

                      <div className="mt-4 text-sm font-black text-emerald-900">{savingChallengeStage.title}</div>
                      <div className="mt-1 text-[10px] font-bold text-[#111111]/60">{savingChallengeStage.subtitle}</div>
                    </div>

                    <div className="mt-6">
                      <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{ width: `${savingChallengeProgressPct}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-[#111111]/45">{savingChallengeCheckedToday ? t(I18N_KEYS.savingChallenge.checkedToday) : t(I18N_KEYS.savingChallenge.uncheckedToday)}</div>
                        <div className="text-[10px] font-black text-[#111111]/60">{savingChallengeDayCount}/30</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#111111]/50">30D BADGES</div>
                        <div className="text-[10px] font-black text-[#111111]/60">{t(I18N_KEYS.savingChallenge.progressLit, { count: savingChallengeDayCount })}</div>
                      </div>
                      <div className="mt-3 grid grid-cols-6 gap-2">
                        {Array.from({ length: 30 }, (_, i) => {
                          const done = i < savingChallengeDayCount;
                          const next = !savingChallengeCheckedToday && i === savingChallengeDayCount && savingChallengeDayCount < 30;
                          return (
                            <div
                              key={i}
                              className={cn(
                                "h-7 rounded-xl border flex items-center justify-center overflow-hidden",
                                done
                                  ? "bg-emerald-500 border-emerald-400"
                                  : next
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-white border-gray-200"
                              )}
                            >
                              {done ? (
                                <Check size={14} className="text-white" />
                              ) : (
                                <span className={cn("text-[9px] font-black", next ? "text-emerald-700" : "text-[#111111]/25")}>
                                  {i + 1}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSavingChallengeCheckIn}
                    className={cn(
                      "w-full py-4 rounded-[2rem] text-sm font-black shadow-lg transition-all",
                      savingChallengeCheckedToday ? "bg-gray-200 text-gray-500" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    )}
                  >
                    {savingChallengeCheckedToday ? t(I18N_KEYS.savingChallenge.actionChecked) : t(I18N_KEYS.savingChallenge.actionCheckIn)}
                  </motion.button>
                </div>
              )}

              {discoveryTool === 'exchange' && (
                <div className="space-y-3">
                  {[
                    { code: 'USD', flag: '🇺🇸' },
                    { code: 'EUR', flag: '🇪🇺' },
                    { code: 'JPY', flag: '🇯🇵' },
                    { code: 'HKD', flag: '🇭🇰' },
                  ].map(c => (
                    <div key={c.code} className={cn("p-4 rounded-2xl border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border relative", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <span className="absolute inset-0 flex items-center justify-center text-lg">{c.flag}</span>
                          <Globe size={18} className={cn("opacity-0", isDarkMode ? "text-white" : "text-gray-800")} />
                        </div>
                        <div>
                          <p className="text-sm font-black">{t(`currencies.${c.code}`)}</p>
                          <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>1 {c.code} ≈</p>
                        </div>
                      </div>
                      <p className={cn("text-sm font-black", theme.text)}>¥{rates[c.code]?.toFixed(4) || '--'}</p>
                    </div>
                  ))}
                </div>
              )}

              {discoveryTool === 'calculator' && (
                <div className="space-y-5">
                  <div>
                    <label className={cn("text-[10px] font-black uppercase tracking-widest block mb-2", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('calculator_532.input_salary')}</label>
                    <input
                      type="number"
                      value={monthlySalary}
                      onChange={e => setSalary(Number(e.target.value))}
                      className={cn("w-full bg-transparent text-3xl font-black focus:outline-none border-b-2 transition-colors pb-2", isDarkMode ? "border-slate-700 focus:border-white" : "border-gray-100 focus:border-black")}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: t('calculator_532.living'), amount: monthlySalary * 0.5, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { label: t('calculator_532.saving'), amount: monthlySalary * 0.3, color: 'text-green-500', bg: 'bg-green-50' },
                      { label: t('calculator_532.fun'), amount: monthlySalary * 0.2, color: 'text-pink-500', bg: 'bg-pink-50' },
                    ].map(item => (
                      <div key={item.label} className={cn("p-4 rounded-2xl flex justify-between items-center", isDarkMode ? "bg-slate-700" : item.bg)}>
                        <span className={cn("text-xs font-bold", isDarkMode ? "text-[#6E6E73]" : "opacity-60")}>{item.label}</span>
                        <span className={cn("text-lg font-black", isDarkMode ? "text-white" : item.color)}>{formatMoney(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingInvite && (
          <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={() => { setPendingInvite(null); clearInviteParams(); }}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[2.5rem] bg-white lux-gold-hairline pt-8 px-8 pb-[calc(2rem+env(safe-area-inset-bottom)+6rem)]"
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              <div className="text-lg font-black text-[#111111]">{t('group.invite_join_prompt', { name: pendingInvite.name })}</div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  className="py-4 rounded-2xl font-black text-xs border bg-[#F2F2F7] text-[#6E6E73] active:scale-95 transition-transform"
                  onClick={() => { setPendingInvite(null); clearInviteParams(); }}
                >
                  {t('cancel')}
                </button>
                <button
                  className="py-4 rounded-2xl font-black text-xs bg-[#1D1D1F] text-white shadow-lg active:scale-95 transition-transform"
                  onClick={() => {
                    ensureGroupForInvite(pendingInvite.code, pendingInvite.name);
                    joinGroupSaving(pendingInvite.code);
                    setActiveTab('groupSaving');
                    setPendingInvite(null);
                    clearInviteParams();
                  }}
                >
                  {t('group.invite_join_confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWealthMilestoneSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: proUpsellSheetEase }}
            className="fixed inset-0 z-[187] flex items-end justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setIsWealthMilestoneSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.38, ease: proUpsellSheetEase }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-t-[32px] bg-white backdrop-blur-[24px] lux-gold-hairline"
              style={{ transform: "translate3d(0,0,0)" }}
            >
              <div className="pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              </div>
              <div className="flex items-center justify-center px-6 pt-8 pb-4 border-b lux-glass-divider-b">
                <div className="text-sm font-black text-[#111111]/90">{t('wealth_milestone.title')}</div>
              </div>
              <div className="px-6 pt-6 pb-24">
                <div className="text-[4.2vw] font-black text-[#111111]">{t('wealth_milestone.sheet_title')}</div>
                <div className="mt-2 text-[3.4vw] font-bold text-[#86868B] leading-relaxed">{t('wealth_milestone.sheet_desc')}</div>

                <div className="mt-5 space-y-3">
                  {[
                    { key: 'initial_accumulation', descKey: 'initial_accumulation' },
                    { key: 'steady_growth', descKey: 'steady_growth' },
                    { key: 'well_off_life', descKey: 'well_off_life' },
                    { key: 'financial_freedom', descKey: 'financial_freedom' },
                  ].map((x) => (
                    <div key={x.key} className="p-4 rounded-2xl lux-gold-hairline bg-[#F2F2F7]">
                      <div className="flex items-center justify-between">
                        <div className="text-[3.6vw] font-black text-[#1D1D1F]">{t(`wealth_milestone.level.${x.key}`)}</div>
                        <div className="text-[3.2vw] font-bold text-[#86868B]">{t('wealth_milestone.badge')}</div>
                      </div>
                      <div className="mt-1 text-[3.2vw] font-bold text-[#6E6E73] leading-relaxed">{t(`wealth_milestone.level_desc.${x.descKey}`)}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsWealthMilestoneSheetOpen(false)}
                  className="mt-6 w-full py-4 rounded-2xl font-black text-xs bg-[#1D1D1F] text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform lux-shimmer-tap"
                >
                  {t('ok')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isToastOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 -translate-x-1/2 z-[99999] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] px-4 py-2 rounded-full bg-[#1D1D1F]/85 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Action Sheet */}
      <AnimatePresence>
        {isAvatarActionSheetOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/20 backdrop-blur-md"
            onClick={() => setIsAvatarActionSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full max-w-md rounded-t-[3rem] pt-8 px-8 pb-[calc(2rem+env(safe-area-inset-bottom)+6rem)] bg-white backdrop-blur-[24px] lux-gold-hairline text-[#111111]"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-8 bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => avatarLibraryInputRef.current?.click()}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs border transition-all",
                    "lux-carbon-soft text-[#1D1D1F] lux-shimmer-tap"
                  )}
                >
                  {t('profile.choose_from_library')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => avatarCameraInputRef.current?.click()}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs border transition-all",
                    "lux-carbon-soft text-[#1D1D1F] lux-shimmer-tap"
                  )}
                >
                  {t('profile.take_photo')}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Username Modal */}
      <AnimatePresence>
        {isEditNameModalOpen && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/30 backdrop-blur-md" onClick={() => setIsEditNameModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn("w-full max-w-sm rounded-[2.5rem] p-8 border shadow-2xl bg-white text-[#111111] border-[rgba(0,0,0,0.06)]")}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-sm font-black text-zinc-800 mb-4">{t('profile.edit_name')}</h3>
              <input
                autoFocus
                value={draftUserName}
                onChange={(e) => setDraftUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const next = draftUserName.trim();
                    if (next) setLocalUserName(next);
                    setIsEditNameModalOpen(false);
                  }
                }}
                placeholder={t('profile.name_placeholder')}
                className={cn(
                  "w-full rounded-2xl px-4 py-4 text-sm font-bold outline-none border",
                  "bg-[#F2F2F7] border-black/5 text-[#111111] placeholder:text-[#86868B]"
                )}
              />
              <button
                type="button"
                onClick={() => {
                  const next = draftUserName.trim();
                  if (next) setLocalUserName(next);
                  setIsEditNameModalOpen(false);
                }}
                className="mt-4 w-full py-4 rounded-2xl font-black text-xs bg-[#1D1D1F] text-white shadow-lg active:scale-95 transition-all"
              >
                {t('profile.save')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogoutDialogOpen && (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-black/30 backdrop-blur-md"
            onClick={() => setIsLogoutDialogOpen(false)}
            role="presentation"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border",
                isDarkMode ? "bg-slate-800/95 text-white border-slate-700" : "bg-white/95 text-gray-900 border-gray-100"
              )}
            >
              <div className="text-center">
                <h3 className="text-lg font-black">{t('logout_confirm_title')}</h3>
                <p className={cn("mt-2 text-xs font-bold", isDarkMode ? "text-white/50" : "text-gray-500")}>{t('logout_confirm_body')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className={cn(
                    "py-4 rounded-2xl font-black text-xs active:scale-95 transition-all border",
                    isDarkMode ? "bg-slate-700 border-slate-600 text-[#6E6E73]" : "bg-gray-50 border-gray-100 text-gray-600"
                  )}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="py-4 rounded-2xl font-black text-xs bg-rose-500 text-white shadow-lg active:scale-95 transition-all"
                >
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Edit Modal */}
      <AnimatePresence>
        {isBudgetEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md" onClick={() => setIsBudgetEditModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border bg-white/80 backdrop-blur-[24px] text-[#111111] border-white/40"
              style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.08)" }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center mx-auto mb-4">
                  <Pencil size={22} className="text-[#1D1D1F]" />
                </div>
                <h3 className="text-xl font-black">{t('edit_monthly_budget')}</h3>
                <p className={cn("mt-2 text-xs font-bold", "text-[#6E6E73]")}>{t('edit_budget_desc')}</p>
              </div>

              <div className="relative mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-black text-[#6E6E73] mr-2">{displayCurrency.symbol}</span>
                  <input
                    autoFocus
                    type="number"
                    inputMode="decimal"
                    step="100"
                    value={budgetDraft}
                    onChange={(e) => setBudgetDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = Number(budgetDraft);
                        if (val > 0) {
                          setBudget(val);
                          setIsBudgetEditModalOpen(false);
                        }
                      }
                    }}
                    className="w-full text-center text-5xl font-black focus:outline-none bg-transparent text-[#1D1D1F] placeholder:text-[#C7C7CC]"
                    placeholder="5000"
                  />
                </div>
                <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#1D1D1F]/20 to-transparent" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-6 px-4">
                {[3000, 5000, 8000, 10000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBudgetDraft(String(v))}
                    className={cn(
                      "flex-1 px-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-90",
                      Number(budgetDraft) === v
                        ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
                        : "bg-[#F2F2F7] text-[#6E6E73] border-transparent hover:bg-[#E8E8ED]"
                    )}
                  >
                    {displayCurrency.symbol}{v.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsBudgetEditModalOpen(false)}
                  className="py-4 rounded-2xl font-black text-xs bg-[#F2F2F7] text-[#6E6E73] active:scale-95 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = Number(budgetDraft);
                    if (val > 0) {
                      setBudget(val);
                      setIsBudgetEditModalOpen(false);
                    }
                  }}
                  className="py-4 rounded-2xl font-black text-xs bg-[#1D1D1F] text-white shadow-lg active:scale-95 transition-all"
                >
                  {t('confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Picker */}
      <AnimatePresence>
        {isLangPickerOpen && (
          <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/20 backdrop-blur-sm" onClick={() => setIsLangPickerOpen(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full max-w-md rounded-t-[3rem] pt-8 px-8 pb-[calc(2rem+env(safe-area-inset-bottom)+6rem)] bg-white backdrop-blur-[24px] lux-gold-hairline text-[#111111]"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-8 bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              <h3 className="text-lg font-black mb-6">{t('select_lang')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'zh-CN', label: t('langs.zh-CN'), flag: '🇨🇳' },
                  { id: 'en-US', label: t('langs.en-US'), flag: '🇺🇸' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setAppLanguage(l.id); setIsLangPickerOpen(false); }}
                    className={cn(
                      "w-full p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all border",
                      i18n.language === l.id ? cn(theme.primary, "text-white", "border-transparent") : "lux-carbon-soft text-[#111111]/85 hover:bg-[#F2F2F7]"
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
          <div className="fixed inset-0 z-[190] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/20 backdrop-blur-md" onClick={() => setIsFilterModalOpen(false)}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] pt-10 px-10 pb-[calc(2rem+env(safe-area-inset-bottom)+6rem)] shadow-2xl bg-white backdrop-blur-[24px] lux-gold-hairline text-[#111111]"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-8 bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black">{t('filter_dimension')}</h2>
                <button onClick={() => setIsFilterModalOpen(false)} className="p-3 rounded-full lux-carbon-soft text-[#1D1D1F] active:scale-95 transition-transform">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ id: 'today', label: t('today'), icon: '🕒' }, { id: 'week', label: t('week'), icon: '📅' }, { id: 'month', label: t('month'), icon: '📊' }, { id: 'year', label: t('year'), icon: '🗓️' }].map(dim => (
                  <button
                    key={dim.id}
                    onClick={() => { setFilterType(dim.id as any); setCurrentDate(new Date()); setIsFilterModalOpen(false); }}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all lux-shimmer-tap",
                      filterType === dim.id
                        ? "lux-carbon-soft lux-gold-hairline text-[#1D1D1F]"
                        : "lux-carbon-soft text-[#8E8E93] hover:bg-[#F2F2F7]"
                    )}
                  >
                    <span className="text-2xl mb-2">{dim.icon}</span><span className="font-black text-[10px] uppercase tracking-widest">{dim.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav ref={tabbarGlassRef} className="tabbar-glass pointer-events-none">
        <div className="tabbar-glass-inner">
          <div
            className={cn(
              "tabbar-surface",
              "mx-auto max-w-lg pointer-events-auto",
              "flex items-center justify-between"
            )}
          >
            {[
              { id: 'list', icon: <History size={20} />, label: t('bill_detail') },
              { id: 'chart', icon: <PieIcon size={20} />, label: t('stats') },
              { id: 'plus', icon: null, label: '' }, // Placeholder for the big plus
              { id: 'groupSaving', icon: <Users size={20} />, label: t('group_saving_title') },
              { id: 'discovery', icon: <Compass size={20} />, label: t('discovery') },
            ].map((tab) => {
              if (tab.id === 'plus') {
                return (
                  <div key="plus-container" className="relative flex-1 flex justify-center -mt-10 overflow-visible">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all pointer-events-auto",
                        theme.primary
                      )}
                    >
                      <Plus size={32} strokeWidth={3} />
                    </motion.button>
                  </div>
                );
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative group py-1",
                    activeTab === tab.id ? theme.text : "text-[#8E8E93]"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-2xl transition-all duration-500",
                    activeTab === tab.id
                      ? "bg-[#F2F2F7] lux-ios-glass-subtle scale-105"
                      : "group-hover:bg-[#F2F2F7]"
                  )}>
                    {tab.icon}
                  </div>
                  <span className="text-[0.5rem] leading-none font-black uppercase tracking-tighter">{tab.label}</span>
                  {activeTab === tab.id && <motion.div layoutId="nav-dot" className={cn("absolute -top-1 w-1 h-1 rounded-full", theme.primary)} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="tabbar-safe-spacer pointer-events-none" />
      </nav>
    </motion.div>
    </>
  );
}

function TransactionForm({
  accounts,
  transactions,
  rates,
  onSubmit,
  initialData,
  onDelete,
  isDarkMode,
  groupSaving,
  displayCurrencyCode,
  onDisplayCurrencyCodeChange
}: {
  accounts: Account[],
  transactions: Transaction[],
  rates: Record<string, number>,
  onSubmit: (t: Omit<Transaction, 'id'>) => void,
  initialData?: Transaction,
  onDelete?: () => void,
  isDarkMode: boolean,
  groupSaving?: GroupSavingGroup | null,
  displayCurrencyCode: CurrencyCode,
  onDisplayCurrencyCodeChange: React.Dispatch<React.SetStateAction<CurrencyCode>>
}) {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.originalAmount?.toString() || initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || '餐饮');
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialData?.date) {
      return initialData.date.split('T')[0];
    }
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [note, setNote] = useState(initialData?.note || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [hasImage, setHasImage] = useState(initialData?.hasImage || false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageData || null);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>(initialData?.mood || 'happy');
  const [visibility, setVisibility] = useState<'private' | 'group'>(initialData?.visibility || 'private');
  const [toGroupPool, setToGroupPool] = useState<boolean>(!!initialData?.toGroupPool);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
    if (displayCurrencyCode) return displayCurrencyCode;
    return (localStorage.getItem('last_used_currency') as CurrencyCode) || 'CNY';
  });
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [isAmountAnimating, setIsAmountAnimating] = useState(false);

  const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode)!;
  const prefersMYR = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const lang = (navigator.language || '').toUpperCase();
    if (lang.endsWith('-MY') || lang.includes('-MY-') || lang.startsWith('MS')) return true;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Kuala_Lumpur')) return true;
    } catch { }
    return false;
  }, []);
  const currencyOptions = useMemo(() => {
    const list = [...CURRENCIES];
    if (!prefersMYR) return list;
    list.sort((a, b) => {
      if (a.code === 'MYR' && b.code !== 'MYR') return -1;
      if (b.code === 'MYR' && a.code !== 'MYR') return 1;
      return 0;
    });
    return list;
  }, [prefersMYR]);
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
    const finalVisibility = groupSaving ? visibility : 'private';
    const finalGroupId = finalVisibility === 'group' ? groupSaving?.id : undefined;
    const finalToGroupPool = finalVisibility === 'group' ? toGroupPool : false;
    onSubmit({
      amount: convertedCNY,
      type,
      category,
      date: new Date(selectedDate + 'T12:00:00').toISOString(),
      note,
      accountId,
      tags,
      hasImage,
      imageData,
      mood,
      originalAmount: Number(amount),
      currency: currencyCode,
      exchangeRate: rates[currencyCode],
      visibility: finalVisibility,
      groupId: finalGroupId,
      toGroupPool: finalToGroupPool
    });
  };

  const handleCurrencySelect = (code: CurrencyCode) => {
    setIsAmountAnimating(true);
    setCurrencyCode(code);
    localStorage.setItem('last_used_currency', code);
    onDisplayCurrencyCodeChange(code);
    setIsCurrencyDrawerOpen(false);
    setTimeout(() => setIsAmountAnimating(false), 500);
  };

  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const selectedAccount = useMemo(() => accounts.find(a => a.id === accountId) || accounts[0], [accounts, accountId]);

  const AccountBrandIcon = ({ account, size = '1.5em' }: { account: Account; size?: number | string }) => {
    if (account.name === 'wechat') {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="WeChat"
          className="max-w-full h-auto text-[#07C160]"
          fill="currentColor"
        >
          <path d="M23.541 12.748c-.609-1.38-1.758-2.476-3.092-3.151-2.354-1.192-5.281-1.185-7.629.03-1.631.837-2.993 2.337-3.379 4.162-.318 1.344-.033 2.791.68 3.961 1.061 1.762 2.979 2.887 4.971 3.248 1.443.293 2.936.119 4.338-.285.842.326 1.592.854 2.408 1.246-.211-.707-.436-1.406-.676-2.102.916-.65 1.746-1.461 2.244-2.479.744-1.415.789-3.171.135-4.63zm-9.924-9.466c-2.495-1.404-5.602-1.615-8.286-.645-1.764.635-3.36 1.815-4.346 3.42-.895 1.45-1.23 3.258-.799 4.917.433 1.84 1.711 3.383 3.262 4.413-.3.85-.585 1.699-.855 2.555.975-.51 1.95-1.043 2.926-1.561 1.17.375 2.415.559 3.66.518-.33-.943-.405-1.965-.255-2.951.225-1.371.975-2.625 1.994-3.554 1.726-1.615 4.171-2.296 6.496-2.131-.436-2.135-1.936-3.939-3.824-4.98h.027zm1.733 9.989c-.209.652-1.156.848-1.615.352-.506-.459-.309-1.418.355-1.623.734-.31 1.582.537 1.26 1.271zm4.795.092c-.256.586-1.141.723-1.576.27-.209-.191-.27-.479-.344-.73.104-.458.42-.933.93-.955.705-.098 1.336.773.975 1.416h.015zM12.99 6.909c.008.961-1.275 1.561-1.995.909-.747-.535-.535-1.837.342-2.106.785-.315 1.713.344 1.651 1.185l.002.012zm-6.059.244c-.172.835-1.291 1.238-1.946.678-.759-.535-.546-1.861.345-2.131.873-.336 1.865.55 1.601 1.453z" />
        </svg>
      );
    }
    if (account.name === 'alipay') {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Alipay"
          className="max-w-full h-auto text-[#1677FF]"
          fill="currentColor"
        >
          <path d="M18.408 16.79c-2.173-.95-3.72-1.646-4.64-2.086-1.4 1.696-2.872 2.72-5.08 2.72S5 16.064 5.176 14.392c.12-1.096.872-2.888 4.128-2.576 1.72.16 2.504.48 3.912.944.36-.664.664-1.4.888-2.176H7.88v-.616h3.072V8.864H7.2v-.68h3.752V6.592s.032-.248.312-.248H12.8v1.848h4v.68h-4v1.104h3.264a12.41 12.41 0 0 1-1.32 3.32c.51.182 2.097.676 4.76 1.483a8 8 0 1 0-1.096 2.012zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-3.568-5.632c1.44 0 2.824-.872 3.96-2.352-1.608-.776-2.944-1.16-4.44-1.16-1.304 0-1.984.8-2.104 1.416-.12.616.248 2.096 2.584 2.096z" />
        </svg>
      );
    }
    return (
      <span className="text-xl leading-none">
        {account.icon}
      </span>
    );
  };

  const WheelColumn = ({
    items,
    selected,
    onSelect,
    formatItem,
  }: {
    items: number[];
    selected: number;
    onSelect: (next: number) => void;
    formatItem?: (n: number) => string;
  }) => {
    const rowH = 36;
    const visibleRows = 5;
    const centerRow = Math.floor(visibleRows / 2);
    const startYRef = useRef<number | null>(null);
    const startOffsetRef = useRef(0);
    const lastMoveRef = useRef<{ t: number; y: number } | null>(null);
    const tapIndexRef = useRef<number | null>(null);
    const offsetFromSelected = -Math.max(0, items.indexOf(selected)) * rowH;
    const [offset, setOffset] = useState(offsetFromSelected);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
      if (!dragging) setOffset(-Math.max(0, items.indexOf(selected)) * rowH);
    }, [selected, items, dragging]);

    const clampOffset = (raw: number) => {
      const min = -(items.length - 1) * rowH;
      return Math.max(min, Math.min(0, raw));
    };

    const snapTo = (raw: number, velocity: number) => {
      const projected = clampOffset(raw + velocity * 140);
      const idx = Math.round(-projected / rowH);
      const clampedIdx = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clampedIdx];
      setOffset(-clampedIdx * rowH);
      onSelect(next);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        (navigator as any).vibrate?.(10);
      }
    };

    return (
      <div
        className="relative overflow-hidden flex-1"
        style={{ height: rowH * visibleRows }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          setDragging(true);
          startYRef.current = e.clientY;
          startOffsetRef.current = offset;
          lastMoveRef.current = { t: Date.now(), y: e.clientY };
          const el = (e.target as HTMLElement | null)?.closest?.('[data-wheel-index]') as HTMLElement | null;
          if (el) {
            const rawIdx = Number(el.getAttribute('data-wheel-index'));
            tapIndexRef.current = Number.isFinite(rawIdx) ? rawIdx : null;
          } else {
            tapIndexRef.current = null;
          }
        }}
        onPointerMove={(e) => {
          if (startYRef.current == null) return;
          const dy = e.clientY - startYRef.current;
          if (Math.abs(dy) > 6) tapIndexRef.current = null;
          const next = clampOffset(startOffsetRef.current + dy);
          setOffset(next);
          lastMoveRef.current = { t: Date.now(), y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (startYRef.current == null) return;
          const dyTotal = e.clientY - startYRef.current;
          const tappedIdx = tapIndexRef.current;
          if (tappedIdx != null && Math.abs(dyTotal) < 6) {
            const clampedIdx = Math.max(0, Math.min(items.length - 1, tappedIdx));
            setDragging(false);
            startYRef.current = null;
            lastMoveRef.current = null;
            tapIndexRef.current = null;
            setOffset(-clampedIdx * rowH);
            onSelect(items[clampedIdx]);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              (navigator as any).vibrate?.(10);
            }
            return;
          }
          const last = lastMoveRef.current;
          const now = Date.now();
          const dy = last ? e.clientY - last.y : 0;
          const dt = last ? Math.max(8, now - last.t) : 16;
          const v = dy / dt;
          setDragging(false);
          startYRef.current = null;
          tapIndexRef.current = null;
          // Use the actual current offset (startOffsetRef.current + dyTotal) instead of the stale `offset` from closure
          snapTo(startOffsetRef.current + dyTotal, v);
        }}
        onPointerCancel={() => {
          setDragging(false);
          startYRef.current = null;
          tapIndexRef.current = null;
          setOffset(-Math.max(0, items.indexOf(selected)) * rowH);
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))" }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))" }}
        />
        <div
          aria-hidden
          className="absolute left-0 right-0"
          style={{
            top: centerRow * rowH,
            height: rowH,
            borderTop: "1px solid rgba(255,255,255,0.18)",
            borderBottom: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: centerRow * rowH,
            height: rowH,
            transform: "translate3d(0,0,0)",
            perspective: 800,
          }}
        >
          <div
            className="absolute left-0 right-0"
            style={{
              top: 0,
              transform: `translate3d(0, ${offset + centerRow * rowH}px, 0)`,
              transition: dragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
          >
            {items.map((n, idx) => {
              const pos = idx * rowH + offset;
              const dist = (pos - (-centerRow * rowH)) / rowH;
              const rotateX = Math.max(-75, Math.min(75, -dist * 18));
              const opacity = Math.max(0.22, 1 - Math.abs(dist) * 0.24);
              const scale = 1 - Math.min(0.18, Math.abs(dist) * 0.06);
              const isSelected = n === selected;
              return (
                <div
                  key={n}
                  data-wheel-index={idx}
                  className={cn("absolute left-0 right-0 flex items-center justify-center font-black select-none", isSelected ? "text-white" : "text-[#6E6E73]")}
                  style={{
                    top: idx * rowH,
                    height: rowH,
                    transform: `rotateX(${rotateX}deg) translateZ(84px) scale(${scale})`,
                    opacity,
                    transition: dragging ? "none" : "opacity 180ms ease",
                  }}
                >
                  {formatItem ? formatItem(n) : String(n)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const BottomSheet = ({
    open,
    onClose,
    header,
    children,
    bodyClassName,
  }: {
    open: boolean;
    onClose: () => void;
    header: React.ReactNode;
    children: React.ReactNode;
    bodyClassName?: string;
  }) => {
    const ease: [number, number, number, number] = [0.32, 0.72, 0, 1];
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease }}
            className="fixed inset-0 z-[170] flex items-end justify-center bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.38, ease }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-md lux-gold-hairline",
                "rounded-t-[32px] bg-white backdrop-blur-[24px]",
                "max-h-[min(88dvh,100%)] flex flex-col overflow-hidden"
              )}
              style={{ transform: "translate3d(0,0,0)" }}
            >
              <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-[linear-gradient(90deg,rgba(29,29,31,0.35),rgba(110,110,115,0.85),rgba(72,72,74,0.45))]" />
              </div>
              {header && <div className="flex-shrink-0">{header}</div>}
              <div
                className={cn(
                  "sheet-scroll-area flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
                  bodyClassName
                )}
              >
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cn("flex p-1.5 rounded-2xl", isDarkMode ? "bg-slate-700" : "bg-gray-100")}>
        <button type="button" onClick={() => setType('expense')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'expense' ? (isDarkMode ? "bg-slate-600 shadow-md text-red-400" : "bg-white shadow-md text-red-500") : "text-gray-400")}>{t('expense')}</button>
        <button type="button" onClick={() => setType('income')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'income' ? (isDarkMode ? "bg-slate-600 shadow-md text-green-400" : "bg-white shadow-md text-green-500") : "text-gray-400")}>{t('income')}</button>
      </div>

      <div className={cn("relative border-b-4 transition-colors pb-6", isDarkMode ? "border-slate-700 focus-within:border-white" : "border-gray-50 focus-within:border-black")}>
        <div className="flex justify-between items-center mb-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t('amount_label')}</label>
          {currencyCode !== 'CNY' && (
            <div className="flex items-center space-x-2 bg-blue-50/50 px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">{t('rate_syncing')}</span>
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
              <span className="text-xs">{t('approx_cny')} ¥{convertedCNY.toLocaleString(i18n.language === 'en-US' ? 'en-US' : 'zh-CN', { minimumFractionDigits: 2 })} CNY</span>
              <div className="w-[1px] h-3 bg-blue-200 mx-1" />
              <span className="text-[8px] opacity-60">1 {currencyCode} = {rates[currencyCode]?.toFixed(4)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomSheet
        open={isCurrencyDrawerOpen}
        onClose={() => setIsCurrencyDrawerOpen(false)}
        header={
          <div className="flex items-center justify-between px-6 py-4 border-b lux-glass-divider-b">
            <button
              type="button"
              onClick={() => setIsCurrencyDrawerOpen(false)}
              className={cn("text-sm font-black", isDarkMode ? "text-[#1D1D1F]" : "text-[#007AFF]")}
            >
              {t('cancel')}
            </button>
            <div className="text-sm font-black text-[#111111]/90">{t('select_currency')}</div>
            <button
              type="button"
              onClick={() => setIsCurrencyDrawerOpen(false)}
              className={cn("text-sm font-black opacity-0 pointer-events-none", isDarkMode ? "text-[#1D1D1F]" : "text-[#007AFF]")}
            >
              {t('confirm')}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
          {currencyOptions.map((c) => {
            const on = currencyCode === c.code;
            return (
              <motion.button
                key={c.code}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCurrencySelect(c.code)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                  on ? "lux-gold-hairline bg-[#F2F2F7]" : "lux-ios-glass-subtle bg-[#F2F2F7] hover:bg-[#F2F2F7]"
                )}
              >
                <div className="flex items-center space-x-4 min-w-0 overflow-hidden">
                  <span className="text-2xl flex-shrink-0">{c.flag}</span>
                  <div className="text-left min-w-0 overflow-hidden">
                    <p className={cn("text-sm font-black max-w-full overflow-hidden text-ellipsis whitespace-nowrap", on ? "text-[#1D1D1F]" : "text-white")}>{c.code}</p>
                    <p className="text-[10px] font-bold text-[#86868B] max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{t(`currencies.${c.code}`)}</p>
                  </div>
                </div>
                {on ? (
                  <Check size={18} className="text-[#1D1D1F] flex-shrink-0" />
                ) : (
                  <span className="text-xs font-bold opacity-40 flex-shrink-0">1 {c.code} ≈ {rates[c.code]?.toFixed(4) || '--'} CNY</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </BottomSheet>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('form.account')}</label>
          <button
            type="button"
            onClick={() => setIsAccountSheetOpen(true)}
            className={cn(
              "w-full p-4 rounded-2xl text-xs font-bold focus:outline-none text-left active:scale-[0.99] transition-transform",
              isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black"
            )}
          >
            <span className="inline-flex items-center space-x-2 min-w-0 max-w-full overflow-hidden">
              <span className="flex-shrink-0">
                <AccountBrandIcon account={selectedAccount} />
              </span>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {t(`accounts.${selectedAccount?.name}`)}
              </span>
            </span>
          </button>
        </div>
        <div className="relative">
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('form.date')}</label>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(v => !v)}
            className={cn(
              "w-full p-4 rounded-2xl text-xs font-bold text-left active:scale-[0.99] transition-transform",
              isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black"
            )}
          >
            {format(parseISO(selectedDate), 'yyyy-MM-dd')}
          </button>

          {isDatePickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
              <div className={cn(
                "absolute right-0 top-full mt-2 z-50 w-[320px] p-5 rounded-[20px] shadow-lg",
                "bg-[#F6F8FA]"
              )}
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setMonth(d.getMonth() - 1);
                      setSelectedDate(format(d, 'yyyy-MM-dd'));
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-90 transition-all"
                  >
                    <ChevronLeft size={16} className="text-[#6E6E73]" />
                  </button>
                  <div className="text-sm font-black text-[#1D1D1F]">
                    {format(parseISO(selectedDate), 'yyyy年 M月')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setMonth(d.getMonth() + 1);
                      setSelectedDate(format(d, 'yyyy-MM-dd'));
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-90 transition-all"
                  >
                    <ChevronRight size={16} className="text-[#6E6E73]" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-black text-[#8E8E93] uppercase tracking-wider py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const date = parseISO(selectedDate);
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                    const selectedStr = selectedDate;
                    const cells: React.ReactNode[] = [];

                    // Empty cells before first day
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} />);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = dayStr === selectedStr;
                      const isToday = dayStr === todayStr;

                      cells.push(
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dayStr);
                            setIsDatePickerOpen(false);
                          }}
                          className={cn(
                            "w-full aspect-square rounded-full text-xs font-bold transition-all active:scale-90",
                            isSelected
                              ? "bg-[#1D1D1F] text-white"
                              : isToday
                                ? "text-[#1D1D1F] ring-1 ring-[#1D1D1F]/20"
                                : "text-[#3A3A3C] hover:bg-black/5"
                          )}
                        >
                          {day}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>

                {/* Bottom buttons */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                      setIsDatePickerOpen(false);
                    }}
                    className="px-4 py-2 rounded-full text-[10px] font-black text-[#6E6E73] bg-black/5 hover:bg-black/10 active:scale-95 transition-all"
                  >
                    今天
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-4 py-2 rounded-full text-[10px] font-black text-white bg-[#1D1D1F] hover:bg-[#2C2C2E] active:scale-95 transition-all"
                  >
                    确定
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('category_label')}</label>
          <button
            type="button"
            onClick={() => setIsCategorySheetOpen(true)}
            className={cn(
              "w-full p-4 rounded-2xl text-xs font-bold focus:outline-none active:scale-[0.99] transition-transform",
              "flex flex-col items-center justify-center gap-1.5 min-h-[72px]",
              isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-[#111111]"
            )}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {CATEGORIES.find(c => c.label === category)?.icon}
            </span>
            <span className="text-[13px] font-medium text-[#6E6E73] text-center leading-tight">
              {t(`categories.${category}`)}
            </span>
          </button>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('mood')}</label>
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
        <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('form.notes_tags')}</label>
        <textarea placeholder={t('note_placeholder')} value={note} onChange={e => setNote(e.target.value)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none mb-2 min-h-[80px] resize-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")} />
        {suggestions.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{suggestions.map((s, i) => <button key={i} type="button" onClick={() => setNote(s)} className={cn("px-3 py-1 rounded-full text-[8px] font-bold", isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-500")}>{s}</button>)}</div>}
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input type="text" placeholder={t('tag_placeholder')} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput) { e.preventDefault(); setTags([...tags, tagInput]); setTagInput(''); } }} className={cn("w-full pl-9 pr-4 py-3 rounded-xl text-[10px] font-bold focus:outline-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">{tags.map((tag, i) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-black flex items-center">#{tag} <X size={10} className="ml-1 cursor-pointer" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} /></span>)}</div>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('form.privacy_group')}</label>
        <div className={cn("p-4 rounded-2xl border", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
          {!groupSaving ? (
            <div className={cn("text-[10px] font-bold", isDarkMode ? "text-[#6E6E73]" : "text-gray-500")}>
              {t('form.not_joined_group')}
            </div>
          ) : (
            <div className="space-y-4">
              <div className={cn("flex p-1.5 rounded-2xl", isDarkMode ? "bg-slate-800/70" : "bg-white")}>
                <button
                  type="button"
                  onClick={() => { setVisibility('private'); setToGroupPool(false); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    visibility === 'private'
                      ? (isDarkMode ? "bg-slate-700 shadow-md text-white" : "bg-black shadow-md text-white")
                      : (isDarkMode ? "text-white/50" : "text-gray-400")
                  )}
                >
                  {t('form.private_only')}
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('group')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    visibility === 'group'
                      ? (isDarkMode ? "bg-slate-700 shadow-md text-emerald-300" : "bg-white shadow-md text-emerald-600")
                      : (isDarkMode ? "text-white/50" : "text-gray-400")
                  )}
                >
                  {t('form.join_group')}
                </button>
              </div>

              {visibility === 'group' && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-[#6E6E73]" : "text-gray-600")}>{t('form.join_pool')}</div>
                    <div className={cn("text-[10px] font-bold mt-1", isDarkMode ? "text-[#86868B]" : "text-gray-400")}>{t('form.join_pool_desc')}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToGroupPool(v => !v)}
                    className={cn(
                      "w-12 h-7 rounded-full relative transition-colors",
                      toGroupPool ? "bg-emerald-500" : (isDarkMode ? "bg-slate-600" : "bg-gray-200")
                    )}
                  >
                    <motion.div
                      layout
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                      style={{ left: toGroupPool ? 26 : 4 }}
                      transition={{ type: "spring", damping: 22, stiffness: 260 }}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('attachment_label')}</label>
        <div className="relative group">
          {previewUrl ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-sm group">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-white text-white rounded-full backdrop-blur-md hover:bg-black/20 transition-all active:scale-90"
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
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('form.attachment_hint')}</p>
                <p className="text-[8px] text-gray-300 mt-1">{t('form.attachment_formats')}</p>
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
      <div className="flex space-x-3 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {onDelete && <button type="button" onClick={onDelete} className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black text-sm active:scale-95 transition-all">{t('delete')}</button>}
        <button type="submit" className={cn("flex-[3] py-5 rounded-[2.5rem] font-black text-sm shadow-xl active:scale-95 transition-all", isDarkMode ? "bg-white text-black" : "bg-black text-white")}>{t('save_bill')}</button>
      </div>

      <BottomSheet
        open={isAccountSheetOpen}
        onClose={() => setIsAccountSheetOpen(false)}
        header={
          <div className="flex items-center justify-between px-6 py-4 border-b lux-glass-divider-b">
            <button
              type="button"
              onClick={() => setIsAccountSheetOpen(false)}
              className={cn("text-sm font-black", isDarkMode ? "text-[#1D1D1F]" : "text-[#007AFF]")}
            >
              {t('cancel')}
            </button>
            <div className="text-sm font-black text-[#111111]/90">{t('form.account')}</div>
            <button
              type="button"
              onClick={() => setIsAccountSheetOpen(false)}
              className={cn("text-sm font-black opacity-0 pointer-events-none", isDarkMode ? "text-[#1D1D1F]" : "text-[#007AFF]")}
            >
              {t('confirm')}
            </button>
          </div>
        }
      >
        <div className="payment-methods-list grid grid-cols-2 gap-3">
          {accounts.map((acc) => {
            const on = acc.id === accountId;
            return (
              <motion.button
                key={acc.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAccountId(acc.id);
                  setIsAccountSheetOpen(false);
                }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-colors",
                  on ? "lux-gold-hairline bg-[#F2F2F7]" : "lux-ios-glass-subtle bg-[#F2F2F7] hover:bg-[#F2F2F7]"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", (acc.name === 'wechat' || acc.name === 'alipay') ? "bg-transparent" : (on ? "bg-[#1D1D1F]/15 text-[#1D1D1F]" : "bg-[#F2F2F7] text-white"))}>
                    <AccountBrandIcon account={acc} size={24} />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <div className="channel-name text-sm font-black max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {t(`accounts.${acc.name}`)}
                    </div>
                    <div className="text-[10px] font-bold text-[#86868B] max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {acc.type.toUpperCase()}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet
        open={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        bodyClassName="category-sheet-body"
        header={
          <div className="flex items-center justify-between px-6 py-4 border-b lux-glass-divider-b">
            <button
              type="button"
              onClick={() => setIsCategorySheetOpen(false)}
              className={cn("text-sm font-black", isDarkMode ? "text-[#1D1D1F]" : "text-[#007AFF]")}
            >
              {t('cancel')}
            </button>
            <div className="text-sm font-black text-[#111111]/90">{t('category_label')}</div>
            <button
              type="button"
              onClick={() => setIsCategorySheetOpen(false)}
              className={cn("text-sm font-black opacity-0 pointer-events-none", isDarkMode ? "text-[#1D1D1F]" : "text-[#007AFF]")}
            >
              {t('confirm')}
            </button>
          </div>
        }
      >
        <div className="category-picker-list" role="listbox" aria-label={t('category_label')}>
          {CATEGORIES.map((c) => {
            const on = c.label === category;
            return (
              <motion.button
                key={c.label}
                type="button"
                role="option"
                aria-selected={on}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setCategory(c.label);
                  setIsCategorySheetOpen(false);
                }}
                className={cn(
                  "category-picker-item rounded-2xl border transition-colors",
                  on ? "is-selected lux-gold-hairline bg-[#F2F2F7]" : "lux-ios-glass-subtle bg-[#F2F2F7] hover:bg-[#F2F2F7]/80"
                )}
              >
                <span className="category-picker-icon" aria-hidden>
                  {c.icon}
                </span>
                <span className="category-picker-label">
                  {t(`categories.${c.label}`)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </BottomSheet>
    </form>
  );
}
