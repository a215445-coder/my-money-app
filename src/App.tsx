import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  PlusCircle,
  Calendar as CalendarIcon,
  X,
  Minus,
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
  Palette,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  Compass,
  Zap as ZapIcon,
  Calculator,
  GripVertical,
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
  PieChart,
  Pie,
  Cell,
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
import { motion, AnimatePresence, Reorder, useScroll, useTransform } from 'framer-motion';
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

const ONBOARDING_BG_STOPS: string[] = ['#DCEBFF', '#F6F0E6', '#141821', '#0B2A1A', '#FFFFFF'];
const ONBOARDING_BG_LUMINANCE_STOPS: number[] = [0.9, 0.88, 0.12, 0.14, 1];

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
    title: '5:3:2 黄金比例',
    description: '科学的 5:3:2 分配，让每一分钱都有归宿。',
    Icon: Calculator,
    bg: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950',
    accent: 'from-emerald-400 to-cyan-400',
  },
  {
    title: '智慧洞察',
    description: '精简总结关键支出，用更聪明的方式省钱。',
    Icon: Cloud,
    bg: 'bg-gradient-to-br from-sky-950 via-slate-950 to-slate-950',
    accent: 'from-sky-400 to-indigo-400',
  },
  {
    title: '开启财务自由',
    description: '细腻毛玻璃之上，开启你的专业理财旅程。',
    Icon: User,
    bg: 'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950',
    accent: 'from-amber-400 to-orange-400',
    cta: '进入登录',
  },
];

function OnboardingSlideCard({
  slideIndex,
  isActive,
  globalProgress,
  contentColor,
  mutedColor,
}: {
  slideIndex: number;
  isActive: boolean;
  globalProgress: any;
  contentColor: any;
  mutedColor: any;
}) {
  const slide = ONBOARDING_SLIDES[slideIndex];
  const slideProgress = useTransform(globalProgress, (v: number) => v - slideIndex);
  const bgParallaxX = useTransform(slideProgress, [-1, 0, 1], [12, 0, -12]);
  const fgParallaxX = useTransform(slideProgress, [-1, 0, 1], [36, 0, -36]);
  const iconParallaxX = useTransform(slideProgress, [-1, 0, 1], [64, 0, -64]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.06 },
    },
  } as const;

  const titleVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] } },
  } as const;

  const descVariants = {
    hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.44, ease: [0.23, 1, 0.32, 1] } },
  } as const;

  const chromeVariants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] } },
  } as const;

  return (
    <div className="min-w-full w-full snap-center px-8 py-10 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "show" : "hidden"}
        className="w-full max-w-md"
        style={{ color: contentColor }}
      >
        <div className="relative rounded-[3.25rem] p-10 border border-white/15 bg-white/10 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.25)] overflow-hidden">
          <motion.div style={{ x: bgParallaxX }} className="absolute inset-0 pointer-events-none">
            <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[110px] opacity-70 bg-gradient-to-br", slide.accent)} />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-[120px] opacity-30 bg-white/20" />
          </motion.div>

          <motion.div variants={chromeVariants} className="relative">
            <div className="relative h-56 w-full">
              {slideIndex === 0 && (
                <>
                  <motion.div style={{ x: fgParallaxX }} className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-sm">
                      <div className="rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-3xl p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: mutedColor }}>WEALTH PULSE</div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                          </div>
                        </div>
                        <div className="relative h-24">
                          <div className="absolute inset-0 grid grid-cols-10 gap-2 items-end">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [18, 44, 26, 56, 34] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: [0.23, 1, 0.32, 1], delay: i * 0.03 }}
                                className={cn("rounded-xl border border-white/10", i % 3 === 0 ? "bg-white/20" : "bg-white/12")}
                              />
                            ))}
                          </div>
                          <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2.0, repeat: Infinity, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {slideIndex === 1 && (
                <>
                  <motion.div style={{ x: fgParallaxX }} className="absolute inset-0 flex items-end justify-center pb-4">
                    <div className="w-full max-w-sm">
                      <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={isActive ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
                        transition={{ type: "spring", damping: 22, stiffness: 220 }}
                        className="rounded-[2.25rem] border border-white/15 bg-white/10 backdrop-blur-3xl p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: mutedColor }}>RECORD</div>
                            <div className="text-lg font-black mt-1">¥ 50.00</div>
                            <div className="text-[10px] font-bold mt-1" style={{ color: mutedColor }}>餐饮 · 肯德基</div>
                          </div>
                          <motion.div
                            animate={{ boxShadow: ["0 0 0 rgba(255,255,255,0.0)", "0 0 26px rgba(255,255,255,0.26)", "0 0 0 rgba(255,255,255,0.0)"] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: [0.23, 1, 0.32, 1] }}
                            className={cn("w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br border border-white/15", slide.accent)}
                          >
                            <Plus size={26} className="text-black/80" strokeWidth={3} />
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              )}

              {slideIndex === 2 && (
                <>
                  <motion.div style={{ x: fgParallaxX }} className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-sm">
                      <div className="rounded-[2.25rem] border border-white/15 bg-white/10 backdrop-blur-3xl p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] mb-6" style={{ color: mutedColor }}>5 · 3 · 2</div>
                        <div className="h-28 flex flex-col justify-end space-y-3">
                          {[
                            { w: 'w-[88%]', label: '50%', tone: 'bg-white/20' },
                            { w: 'w-[72%]', label: '30%', tone: 'bg-white/14' },
                            { w: 'w-[58%]', label: '20%', tone: 'bg-white/10' },
                          ].map((b, i) => (
                            <motion.div
                              key={b.label}
                              initial={{ y: 30, opacity: 0, scale: 0.98 }}
                              animate={isActive ? { y: 0, opacity: 1, scale: 1 } : { y: 30, opacity: 0, scale: 0.98 }}
                              transition={{ type: "spring", damping: 22, stiffness: 240, delay: 0.08 + i * 0.08 }}
                              className={cn(
                                "h-10 rounded-2xl border border-white/10 flex items-center justify-between px-4",
                                b.w,
                                b.tone
                              )}
                            >
                              <span className="text-xs font-black">模块 {i + 1}</span>
                              <span className="text-sm font-black">{b.label}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {slideIndex === 3 && (
                <>
                  <motion.div style={{ x: fgParallaxX }} className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(255,255,255,0)",
                          "0 0 40px rgba(255,255,255,0.16)",
                          "0 0 0 rgba(255,255,255,0)"
                        ],
                      }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: [0.23, 1, 0.32, 1] }}
                      className="w-full max-w-sm rounded-[2.25rem] border border-white/15 bg-white/10 backdrop-blur-3xl p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: mutedColor }}>TIP</div>
                          <div className="text-lg font-black leading-snug mt-2">本周餐饮支出偏高</div>
                          <div className="mt-2 text-[10px] font-bold" style={{ color: mutedColor }}>试试把 2 次外卖替换成自制简餐</div>
                        </div>
                        <div className={cn("w-12 h-12 rounded-[1.4rem] flex items-center justify-center bg-gradient-to-br border border-white/15", slide.accent)}>
                          <Smile size={22} className="text-black/80" />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}

              {slideIndex === 4 && (
                <>
                  <motion.div style={{ x: fgParallaxX }} className="absolute inset-0 flex items-end justify-center pb-4">
                    <div className="w-full max-w-sm rounded-[2.25rem] border border-white/15 bg-white/10 backdrop-blur-3xl p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                      <div className="grid grid-cols-2 gap-3">
                        <button className="py-4 rounded-2xl bg-white text-black font-black text-xs shadow-lg active:scale-95 transition-all">
                          手机号登录
                        </button>
                        <button className="py-4 rounded-2xl bg-white/10 border border-white/10 font-black text-xs active:scale-95 transition-all">
                          微信登录
                        </button>
                      </div>
                      <button className="mt-3 w-full py-4 rounded-2xl bg-white/10 border border-white/10 font-black text-xs active:scale-95 transition-all">
                        Google 登录
                      </button>
                    </div>
                  </motion.div>
                </>
              )}

              <motion.div style={{ x: iconParallaxX }} className="absolute top-0 left-0 right-0 flex justify-center">
                <div className={cn("w-14 h-14 rounded-[1.6rem] flex items-center justify-center bg-gradient-to-br shadow-lg border border-white/15", slide.accent)}>
                  <slide.Icon size={26} className="text-black/80" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={titleVariants} className="mt-10 relative">
            <h1 className="text-4xl font-black tracking-tight leading-[1.05]">{slide.title}</h1>
          </motion.div>
          <motion.p variants={descVariants} className="mt-4 text-base font-bold leading-relaxed" style={{ color: mutedColor }}>
            {slide.description}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

function OnboardingScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const total = ONBOARDING_SLIDES.length;
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollXProgress } = useScroll({ container: scrollerRef });
  const bgColor = useTransform(scrollXProgress, [0, 0.25, 0.5, 0.75, 1], ONBOARDING_BG_STOPS);
  const bgLum = useTransform(scrollXProgress, [0, 0.25, 0.5, 0.75, 1], ONBOARDING_BG_LUMINANCE_STOPS);
  const contentColor = useTransform(bgLum, [0, 1], ['#FFFFFF', '#0B0B0C']);
  const mutedColor = useTransform(bgLum, [0, 1], ['rgba(255,255,255,0.64)', 'rgba(11,11,12,0.55)']);
  const contentInverseColor = useTransform(bgLum, [0, 1], ['#0B0B0C', '#FFFFFF']);

  const globalProgress = useTransform(scrollXProgress, (v: number) => v * (total - 1));

  useEffect(() => {
    const unsubscribe = scrollXProgress.on('change', (v: number) => {
      const next = Math.round(v * (total - 1));
      setIndex(prev => (prev === next ? prev : next));
    });
    return () => unsubscribe();
  }, [scrollXProgress, total]);

  const scrollToIndex = (next: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(total - 1, next));
    el.scrollTo({ left: el.clientWidth * clamped, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: bgColor,
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 82% 88%, rgba(0,0,0,0.18), transparent 60%)",
        }}
        animate={{
          filter: [
            "saturate(112%) brightness(1.02)",
            "saturate(105%) brightness(0.98)",
            "saturate(112%) brightness(1.02)",
          ],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 px-8 pt-[calc(1.25rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <motion.div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: mutedColor }}>
              PRO ONBOARDING
            </motion.div>
            <div className="flex items-center space-x-2">
              {ONBOARDING_SLIDES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === index ? 18 : 6, opacity: i === index ? 1 : 0.35 }}
                  transition={{ type: "spring", damping: 20, stiffness: 250 }}
                  className="h-1.5 rounded-full bg-black/30"
                  style={{ backgroundColor: contentColor }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          <div
            ref={scrollerRef}
            className="h-full w-full overflow-x-auto no-scrollbar flex snap-x snap-mandatory scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' as any }}
          >
            {ONBOARDING_SLIDES.map((_, i) => (
              <OnboardingSlideCard
                key={i}
                slideIndex={i}
                isActive={i === index}
                globalProgress={globalProgress}
                contentColor={contentColor}
                mutedColor={mutedColor}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <motion.button
              onClick={() => scrollToIndex(index - 1)}
              disabled={index === 0}
              className={cn(
                "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-30",
                "border-black/10 hover:bg-white/40"
              )}
              style={{ color: contentColor }}
            >
              上一步
            </motion.button>

            {index < total - 1 ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollToIndex(index + 1)}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                style={{ backgroundColor: contentColor, color: contentInverseColor }}
              >
                继续
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onGoLogin}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                style={{ backgroundColor: contentColor, color: contentInverseColor }}
              >
                进入登录
              </motion.button>
            )}
          </div>

          <motion.div className="mt-4 text-center text-[10px] font-bold" style={{ color: mutedColor }}>
            左右滑动切换 · 流光溢彩插值过渡
          </motion.div>
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
  custom: { primary: 'accent-bg accent-on', text: 'accent-text', border: 'accent-border', shadow: 'accent-glow-soft', ring: 'accent-ring' },
  blackGold: {
    primary: 'lux-gold',
    text: 'text-[#D4AF37]',
    border: 'border-[#D4AF37]',
    shadow: 'shadow-[#D4AF37]/20',
    ring: 'ring-[#D4AF37]',
    appBg: 'bg-[#1A1A1A]',
    appText: 'text-[#F5F5F5]',
    surface: 'lux-carbon',
    surfaceSoft: 'lux-carbon-soft',
    surfaceBorder: 'border-[#2A2A2A]',
    mutedText: 'text-[#F5F5F5]/60',
  },
  whiteMinimal: {
    primary: 'bg-[#C9CDD3]',
    text: 'text-[#111827]',
    border: 'border-[#111827]',
    shadow: 'shadow-black/10',
    ring: 'ring-[#111827]',
    appBg: 'bg-[#FAFAFB]',
    appText: 'text-[#111827]',
    surface: 'bg-[#F3F4F6]',
    surfaceSoft: 'bg-[#F3F4F6]/70',
    surfaceBorder: 'border-[#E5E7EB]',
    mutedText: 'text-[#111827]/55',
  },
  gray: { primary: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-600', shadow: 'shadow-slate-600/20', ring: 'ring-slate-600' },
  mint: { primary: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20', ring: 'ring-emerald-500' },
  sakura: { primary: 'bg-pink-400', text: 'text-pink-400', border: 'border-pink-400', shadow: 'shadow-pink-400/20', ring: 'ring-pink-400' },
};

type ThemeKey = keyof typeof THEMES;

const THEME_ACCENT_HEX: Record<ThemeKey, string> = {
  black: '#000000',
  custom: '#6366f1',
  blackGold: '#D4AF37',
  whiteMinimal: '#9CA3AF',
  gray: '#475569',
  mint: '#10b981',
  sakura: '#f472b6',
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return { r: 99, g: 102, b: 241 };
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const hexToRgba = (hex: string, a: number) => {
  const rgb = hexToRgb(hex);
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${clamp01(a)})`;
};

const rgbToHex = (r: number, g: number, b: number) => {
  const to = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to(clamp(Math.round(r), 0, 255))}${to(clamp(Math.round(g), 0, 255))}${to(clamp(Math.round(b), 0, 255))}`;
};

const mix = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) => {
  const tt = clamp01(t);
  return {
    r: a.r + (b.r - a.r) * tt,
    g: a.g + (b.g - a.g) * tt,
    b: a.b + (b.b - a.b) * tt,
  };
};

const relLuminance = (rgb: { r: number; g: number; b: number }) => {
  const srgb = [rgb.r, rgb.g, rgb.b].map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const bestTextOn = (hex: string) => {
  const lum = relLuminance(hexToRgb(hex));
  return lum < 0.5 ? '#F5F5F5' : '#111827';
};

const hsvToHex = (h: number, s: number, v: number) => {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp01(s);
  const vv = clamp01(v);
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (hh < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (hh < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (hh < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (hh < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (hh < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
};

const rgbToHsv = (rgb: { r: number; g: number; b: number }) => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
};

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

type HomeWidgetId = 'todayBoard' | 'weekTrend' | 'topCategories' | 'miniCalendar' | 'summary' | 'budgetProgress';
type HomeWidgetConfig = { order: HomeWidgetId[]; enabled: Record<HomeWidgetId, boolean> };

const HOME_WIDGETS_STORAGE_KEY = 'home_widgets_v1';

const HOME_WIDGET_META: Record<HomeWidgetId, { title: string; desc: string }> = {
  todayBoard: { title: '今日看板', desc: '今日支出 / 本月剩余预算 / 今日记账笔数' },
  weekTrend: { title: '消费足迹', desc: '最近 7 天开支波动迷你趋势' },
  topCategories: { title: '快捷分类汇总', desc: '本月 Top3 分类占比，点击筛选' },
  miniCalendar: { title: '日历微缩图', desc: '当前月概览，点选快速跳转' },
  summary: { title: '资产总览', desc: '收入/支出/总资产摘要卡片' },
  budgetProgress: { title: '预算进度条', desc: '本月预算使用进度与日均可用' },
};

const DEFAULT_HOME_WIDGET_CONFIG: HomeWidgetConfig = {
  order: ['todayBoard', 'weekTrend', 'topCategories', 'summary', 'budgetProgress', 'miniCalendar'],
  enabled: {
    todayBoard: true,
    weekTrend: true,
    topCategories: true,
    miniCalendar: false,
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

  const anyEnabled = order.some(id => enabled[id]);
  if (!anyEnabled) enabled.todayBoard = true;

  return { order, enabled };
};

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
  const [discoveryTool, setDiscoveryTool] = useState<null | 'categories' | 'exchange' | 'calculator'>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart' | 'calendar' | 'discovery' | 'assets'>('list');
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [isHomeEditMode, setIsHomeEditMode] = useState(false);
  const [isWidgetCenterOpen, setIsWidgetCenterOpen] = useState(false);
  const [homeWidgetConfig, setHomeWidgetConfig] = useState<HomeWidgetConfig>(() => {
    const saved = localStorage.getItem(HOME_WIDGETS_STORAGE_KEY);
    if (!saved) return DEFAULT_HOME_WIDGET_CONFIG;
    try {
      return normalizeHomeWidgetConfig(JSON.parse(saved));
    } catch {
      return DEFAULT_HOME_WIDGET_CONFIG;
    }
  });

  const homeLongPressTimeoutRef = useRef<number | null>(null);
  const homeLongPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const homeLongPressFiredRef = useRef(false);

  const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('onboarding_done') === 'true');
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem('auth_done') === 'true');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // --- Pro Features State ---
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProMember, setIsProMember] = useState(() => localStorage.getItem('pro_member') === 'true');
  const [isProPaywallOpen, setIsProPaywallOpen] = useState(false);
  const [exportCount, setExportCount] = useState(() => Number(localStorage.getItem('export_count') || '0'));
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

  useEffect(() => {
    if (activeTab === 'list') setIsHomeEditMode(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(HOME_WIDGETS_STORAGE_KEY, JSON.stringify(homeWidgetConfig));
  }, [homeWidgetConfig]);

  useEffect(() => {
    if (activeTab !== 'list') {
      setIsHomeEditMode(false);
      setIsWidgetCenterOpen(false);
    }
  }, [activeTab]);

  const wealthMarquee = useMemo(() => WEALTH_TIPS.join('  ·  '), [WEALTH_TIPS]);

  // --- Settings & i18n ---
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('app_dark_mode') === 'true');
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [showOriginalCurrency, setShowOriginalCurrency] = useState<Record<string, boolean>>({});

  // --- Privacy & Theme ---
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [pin] = useState(() => localStorage.getItem('privacy_pin') || '');
  const [isLockEnabled] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [inputPin, setInputPin] = useState('');
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => (localStorage.getItem('app_theme') as ThemeKey) || 'black');
  const theme = THEMES[themeKey];
  const isBlackGold = themeKey === 'blackGold';
  const isMinimalWhite = themeKey === 'whiteMinimal';
  const isCustomTheme = themeKey === 'custom';
  const isDarkUI = isDarkMode || isBlackGold;
  const [customAccent, setCustomAccent] = useState(() => localStorage.getItem('custom_accent') || '#6366F1');
  const [customHS, setCustomHS] = useState(() => {
    const hsv = rgbToHsv(hexToRgb(localStorage.getItem('custom_accent') || '#6366F1'));
    return { h: hsv.h, s: hsv.s };
  });
  const accentHex = isCustomTheme ? customAccent : (themeKey === 'black' ? (isDarkUI ? '#FFFFFF' : '#000000') : THEME_ACCENT_HEX[themeKey]);

  const derivedTheme = useMemo(() => {
    const base = hexToRgb(accentHex);
    const bgMix = mix(base, { r: 255, g: 255, b: 255 }, 0.2);
    const bg20 = rgbToHex(bgMix.r, bgMix.g, bgMix.b);
    const shadow30 = mix(base, { r: 0, g: 0, b: 0 }, 0.3);
    const shadowRgba = `rgba(${Math.round(shadow30.r)}, ${Math.round(shadow30.g)}, ${Math.round(shadow30.b)}, 0.35)`;
    const text = bestTextOn(accentHex);
    return { accent: accentHex, accentBg: bg20, accentText: text, accentShadow: shadowRgba };
  }, [accentHex]);

  const [inkTick, setInkTick] = useState(0);
  useEffect(() => {
    setInkTick(v => v + 1);
  }, [derivedTheme.accent]);

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const isPickingRef = useRef(false);

  const pickAccentAt = (clientX: number, clientY: number) => {
    const el = colorPickerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const s = clamp01(r / (rect.width / 2));
    let h = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (h < 0) h += 360;
    setCustomHS({ h, s });
    setCustomAccent(hsvToHex(h, s, 0.92).toUpperCase());
    setThemeKey('custom');
  };

  const mutedText = isBlackGold
    ? ((theme as any).mutedText || "text-[#F5F5F5]/60")
    : isMinimalWhite
      ? ((theme as any).mutedText || "text-[#111827]/55")
      : (isDarkMode ? "text-white/50" : "text-gray-400");

  const chipNeutral = isBlackGold
    ? "bg-white/10 text-white/70"
    : isMinimalWhite
      ? "bg-black/5 text-gray-700"
      : (isDarkMode ? "bg-slate-700 text-white/70" : "bg-gray-100 text-gray-400");

  const surfaceCard = (...extra: ClassValue[]) => cn(
    "border",
    isBlackGold
      ? cn((theme as any).surfaceSoft || 'lux-carbon-soft', (theme as any).surfaceBorder || 'border-[#2A2A2A]', (theme as any).appText || 'text-[#F5F5F5]')
      : isMinimalWhite
        ? cn((theme as any).surface || 'bg-[#F3F4F6]', (theme as any).surfaceBorder || 'border-[#E5E7EB]', (theme as any).appText || 'text-[#111827]')
        : isCustomTheme
          ? cn(isDarkMode ? "bg-slate-800/80 border-slate-700 text-white" : "bg-white/70 border-white/60 text-gray-900", "backdrop-blur-2xl", "accent-glow-soft")
          : isDarkMode
            ? "bg-slate-800 border-slate-700 text-white"
            : "bg-white border-gray-50 text-gray-900",
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
    link.download = `账单明细_${format(currentDate, 'yyyy-MM')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('stats-content');
    if (!element) return;

    const branding = element.querySelector('.show-on-export');
    if (branding) branding.classList.remove('hidden');

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const image = canvas.toDataURL("image/png");
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<html><head><title>账单月报</title></head><body style="margin:0;background:#fff"><img src="${image}" style="width:100%;height:auto" /></body></html>`);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      if (branding) branding.classList.add('hidden');
    }
  };

  const FREE_EXPORT_LIMIT = 10;
  const remainingFreeExports = Math.max(FREE_EXPORT_LIMIT - exportCount, 0);

  const doExport = async (kind: 'image' | 'csv' | 'pdf') => {
    if (kind === 'image') await exportAsImage();
    if (kind === 'csv') await exportAsCSV();
    if (kind === 'pdf') await exportAsPDF();
  };

  const consumeFreeExportAndRun = async (kind: 'image' | 'csv' | 'pdf') => {
    if (remainingFreeExports <= 0) {
      setIsProPaywallOpen(true);
      return;
    }
    const next = exportCount + 1;
    setExportCount(next);
    localStorage.setItem('export_count', String(next));
    await doExport(kind);
  };

  const requestExport = (kind: 'image' | 'csv' | 'pdf' = 'image') => {
    if (isProMember) {
      doExport(kind);
      return;
    }
    if (remainingFreeExports > 0) {
      consumeFreeExportAndRun(kind);
      return;
    }
    setIsProPaywallOpen(true);
  };

  const purchasePro = () => {
    localStorage.setItem('pro_member', 'true');
    setIsProMember(true);
    setIsProPaywallOpen(false);
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
  useEffect(() => localStorage.setItem('pro_member', isProMember.toString()), [isProMember]);
  useEffect(() => localStorage.setItem('export_count', String(exportCount)), [exportCount]);
  useEffect(() => localStorage.setItem('custom_accent', customAccent), [customAccent]);

  useEffect(() => {
    if (themeKey === 'blackGold') setIsDarkMode(true);
    if (themeKey === 'whiteMinimal') setIsDarkMode(false);
  }, [themeKey]);

  useEffect(() => {
    const hsv = rgbToHsv(hexToRgb(customAccent));
    setCustomHS({ h: hsv.h, s: hsv.s });
  }, [customAccent]);

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
        { name: '净资产', value: netAssets, color: '#22c55e' },
        { name: '负债', value: liabilities, color: '#ef4444' },
      ],
      distributionPie: [
        { name: '现金', value: cash, color: '#3b82f6' },
        { name: '储蓄', value: savings, color: '#a855f7' },
        { name: '投资', value: investment, color: '#f59e0b' },
      ],
      liabilities,
      netAssets,
      cash,
      savings,
      investment,
    };
  }, [transactions, accounts, totalAssets]);

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

  const beginHomeLongPress = (e: React.PointerEvent) => {
    if (isHomeEditMode) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    homeLongPressStartRef.current = { x: e.clientX, y: e.clientY };
    homeLongPressFiredRef.current = false;
    if (homeLongPressTimeoutRef.current != null) window.clearTimeout(homeLongPressTimeoutRef.current);
    homeLongPressTimeoutRef.current = window.setTimeout(() => {
      homeLongPressFiredRef.current = true;
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
    <motion.div
      className={cn(
        "min-h-screen transition-all duration-1000 pb-32 font-sans relative overflow-hidden",
        isBlackGold && cn((theme as any).appBg || "bg-[#1A1A1A]", (theme as any).appText || "text-[#F5F5F5]"),
        isMinimalWhite && cn((theme as any).appBg || "bg-[#FAFAFB]", (theme as any).appText || "text-[#111827]"),
        !isBlackGold && !isMinimalWhite && (isDarkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"),
        !isBlackGold && !isMinimalWhite && !isDarkMode && timeContext === 'morning' && "bg-gradient-to-br from-orange-50 via-white to-blue-50",
        !isBlackGold && !isMinimalWhite && !isDarkMode && timeContext === 'afternoon' && "bg-gradient-to-br from-blue-50 via-white to-emerald-50",
        !isBlackGold && !isMinimalWhite && !isDarkMode && timeContext === 'evening' && "bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-50",
        !isBlackGold && !isMinimalWhite && isDarkMode && "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950"
      )}
      style={{
        ['--accent' as any]: derivedTheme.accent,
        ['--accentBg' as any]: derivedTheme.accentBg,
        ['--accentText' as any]: derivedTheme.accentText,
        ['--accentShadow' as any]: derivedTheme.accentShadow,
      }}
      animate={{
        ['--accent' as any]: derivedTheme.accent,
        ['--accentBg' as any]: derivedTheme.accentBg,
        ['--accentText' as any]: derivedTheme.accentText,
        ['--accentShadow' as any]: derivedTheme.accentShadow,
      }}
      transition={{ duration: 0.5, ease: 'linear' }}
    >
      <AnimatePresence initial={false}>
        {isCustomTheme && (
          <motion.div
            key={inkTick}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 0.22, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{
              backgroundImage: `radial-gradient(circle at 42% 34%, ${hexToRgba(derivedTheme.accent, 0.38)} 0%, transparent 58%), radial-gradient(circle at 70% 76%, ${hexToRgba(derivedTheme.accent, 0.22)} 0%, transparent 60%)`,
              filter: 'blur(24px) saturate(118%)',
              mixBlendMode: 'normal',
            }}
          />
        )}
      </AnimatePresence>

      {/* Decorative background blobs */}
      {isBlackGold ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#D4AF37]/8 rounded-full blur-[160px] pointer-events-none" />
        </>
      ) : isMinimalWhite ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-black/5 rounded-full blur-[160px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Privacy Lock Screen */}
      {isLocked && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center p-8", isDarkMode ? "bg-slate-900" : "bg-white")}>
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce", theme.primary)}>
            <Lock className={cn(!isCustomTheme && "text-white")} size={32} />
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
        isBlackGold
          ? cn((theme as any).surface || 'lux-carbon', (theme as any).surfaceBorder || 'border-[#2A2A2A]', (theme as any).appText || 'text-[#F5F5F5]', "border-r")
          : isMinimalWhite
            ? cn("bg-white", (theme as any).appText || "text-[#111827]")
            : isDarkMode
              ? "bg-slate-800 text-white"
              : "bg-white text-gray-900",
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
              activeTab === item.id ? cn(theme.primary, !isCustomTheme && "text-white", "shadow-lg") : (isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50")
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
                {isHomeEditMode && (
                  <motion.div
                    className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-sm"
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
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>首页组件</div>
                      <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>
                        {isHomeEditMode ? '拖拽排序 / 点红色减号移除 / 完成后自动保存' : '长按任意板块进入编辑模式'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setIsWidgetCenterOpen(true)}
                        className={cn(
                          "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center space-x-1.5",
                          isDarkUI ? "bg-slate-800/60 border-slate-700 text-white/70" : "bg-white/60 border-white/70 text-gray-700"
                        )}
                      >
                        <PlusCircle size={14} />
                        <span>添加组件</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setIsHomeEditMode(v => !v)}
                        className={cn(
                          "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                          isHomeEditMode ? "bg-rose-500 border-rose-500 text-white" : (isDarkUI ? "bg-slate-800/60 border-slate-700 text-white/70" : "bg-white/60 border-white/70 text-gray-700")
                        )}
                      >
                        {isHomeEditMode ? '完成' : '编辑'}
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
                                <GripVertical size={16} className={cn(isDarkUI ? "text-white/70" : "text-gray-700")} />
                              </div>
                            </>
                          )}

                          {wid === 'todayBoard' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                <div>
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>今日看板</div>
                                  <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>
                                    {moduleQuery ? `已筛选：${searchQuery}` : '横滑查看关键指标'}
                                  </div>
                                </div>
                                {moduleQuery && (
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                                    className={cn(
                                      "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                      isDarkUI ? "bg-slate-800/60 border-slate-700 text-white/70" : "bg-white/60 border-white/70 text-gray-700"
                                    )}
                                  >
                                    清除筛选
                                  </motion.button>
                                )}
                              </div>

                              <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
                                <motion.div
                                  layout
                                  className={cn("min-w-[240px] snap-start p-5 rounded-[2.5rem] shadow-sm", surfaceCard("rounded-[2.5rem]"))}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>今日支出</div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{format(new Date(), 'MM.dd')}</div>
                                  </div>
                                  <div className="mt-3 text-2xl font-black tracking-tight">¥{formatCurrency(homeToday.expense)}</div>
                                  <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>打开搜索会同步影响此处统计</div>
                                </motion.div>

                                <motion.div
                                  layout
                                  className={cn("min-w-[240px] snap-start p-5 rounded-[2.5rem] shadow-sm", surfaceCard("rounded-[2.5rem]"))}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>本月剩余预算</div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{Math.max(0, 100 - homeMonth.usedPct).toFixed(0)}%</div>
                                  </div>
                                  <div className="mt-3 flex items-end justify-between">
                                    <div className="text-lg font-black">¥{formatCurrency(homeMonth.remaining)}</div>
                                    <div className={cn("text-[10px] font-bold", mutedText)}>已用 ¥{formatCurrency(homeMonth.expense)}</div>
                                  </div>
                                  <div className={cn("mt-4 h-3 rounded-full overflow-hidden", isDarkUI ? "bg-white/10" : "bg-black/5")}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(homeMonth.usedPct, 100)}%` }}
                                      transition={{ duration: 1.2, ease: "easeOut" }}
                                      className={cn("h-full", homeMonth.usedPct > 90 ? "bg-rose-500" : theme.primary)}
                                    />
                                  </div>
                                  <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>进度条从 0 渐进生长</div>
                                </motion.div>

                                <motion.div
                                  layout
                                  className={cn("min-w-[240px] snap-start p-5 rounded-[2.5rem] shadow-sm", surfaceCard("rounded-[2.5rem]"))}
                                >
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>今日已记账</div>
                                  <div className="mt-3 text-2xl font-black tracking-tight">{homeToday.count} 笔</div>
                                  <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>点击分类热区可快速筛选账单</div>
                                </motion.div>
                              </div>
                            </div>
                          )}

                          {wid === 'weekTrend' && (
                            <div className={cn("p-6 rounded-[2.5rem] shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>消费足迹</div>
                                  <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>最近 7 天开支波动</div>
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
                                          <stop offset="0%" stopColor={accentHex} stopOpacity={0.25} />
                                          <stop offset="100%" stopColor={accentHex} stopOpacity={0} />
                                        </linearGradient>
                                      </defs>
                                      <motion.path
                                        d={d}
                                        fill="none"
                                        stroke={accentHex}
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
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>最近 7 天合计</div>
                                      <div className="text-sm font-black">¥{formatCurrency(homeWeekSeries.reduce((s, x) => s + x.amount, 0))}</div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {wid === 'topCategories' && (
                            <div className={cn("p-6 rounded-[2.5rem] shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>快捷分类汇总</div>
                                  <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>本月支出最多的 3 个分类</div>
                                </div>
                                <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>TOP3</div>
                              </div>

                              {homeMonth.topCategories.length === 0 ? (
                                <div className={cn("p-6 rounded-2xl border-2 border-dashed text-center", isDarkUI ? "border-slate-700 text-white/50" : "border-gray-100 text-gray-400")}>
                                  <div className="text-xs font-bold">本月暂无支出数据</div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {homeMonth.topCategories.map((c, idx) => (
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
                                        <div className={cn("text-[10px] font-black", mutedText)}>¥{formatCurrency(c.value)}</div>
                                      </div>
                                      <div className={cn("mt-3 h-2 rounded-full overflow-hidden", isDarkUI ? "bg-white/10" : "bg-black/5")}>
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${clamp(c.pct, 0, 100)}%` }}
                                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.06 + idx * 0.04 }}
                                          className="h-full"
                                          style={{ backgroundColor: c.color }}
                                        />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <div className={cn("mt-4 text-[10px] font-bold", mutedText)}>点击分类：自动联动筛选 + 切换到本月</div>
                            </div>
                          )}

                          {wid === 'miniCalendar' && (
                            <div className={cn("p-6 rounded-[2.5rem] shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>日历微缩图</div>
                                  <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>{format(new Date(), 'yyyy年MM月')}</div>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  onClick={(e) => { e.stopPropagation(); setActiveTab('calendar'); }}
                                  className={cn(
                                    "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                    isDarkUI ? "bg-slate-800/60 border-slate-700 text-white/70" : "bg-white/60 border-white/70 text-gray-700"
                                  )}
                                >
                                  打开
                                </motion.button>
                              </div>

                              {(() => {
                                const base = new Date();
                                const start = startOfMonth(base);
                                const end = endOfMonth(base);
                                const days = eachDayOfInterval({ start, end });
                                const first = (start.getDay() + 6) % 7;
                                const blanks = Array.from({ length: first });
                                const hasTx = (d: Date) => transactions.some(t => isSameDay(parseISO(t.date), d) && matchesModuleQuery(t));
                                return (
                                  <div className="grid grid-cols-7 gap-1">
                                    {['一', '二', '三', '四', '五', '六', '日'].map(x => (
                                      <div key={x} className={cn("text-center text-[8px] font-black pb-1", mutedText)}>{x}</div>
                                    ))}
                                    {blanks.map((_, i) => <div key={`b-${i}`} />)}
                                    {days.map(d => {
                                      const active = isSameDay(d, selectedCalendarDate);
                                      return (
                                        <button
                                          key={d.toISOString()}
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setSelectedCalendarDate(d); setCurrentDate(d); setActiveTab('calendar'); }}
                                          className={cn(
                                            "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                                            active ? cn(theme.primary, !isCustomTheme && "text-white") : (isDarkUI ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10")
                                          )}
                                        >
                                          <span className="text-[10px] font-black">{format(d, 'd')}</span>
                                          {hasTx(d) && (
                                            <span className={cn("absolute bottom-1 w-1.5 h-1.5 rounded-full", active ? (isCustomTheme ? "accent-on" : "bg-white") : "bg-emerald-400")} />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {wid === 'summary' && (
                            <div
                              className={cn(
                                "p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/20",
                                theme.primary,
                                !isCustomTheme && "text-white"
                              )}
                            >
                              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-125" />
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                              <div className="flex justify-between items-start mb-12 relative z-10">
                                <div>
                                  <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-3", isCustomTheme ? "accent-on opacity-70" : "text-white/60")}>{t('total_assets')}</p>
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
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isCustomTheme ? "accent-on opacity-70" : "text-white/60")}>{t('expense')}</span>
                                  </div>
                                  <p className="text-2xl font-black">¥{formatCurrency(stats.expense)}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 transition-transform hover:scale-105">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center">
                                      <TrendingUp size={12} className="text-green-200" />
                                    </div>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isCustomTheme ? "accent-on opacity-70" : "text-white/60")}>{t('income')}</span>
                                  </div>
                                  <p className="text-2xl font-black">¥{formatCurrency(stats.income)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {wid === 'budgetProgress' && (
                            <div
                              className={cn(
                                "rounded-[3rem] p-8 shadow-xl border backdrop-blur-xl transition-all",
                                isDarkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-white/40 border-white/50",
                                isCustomTheme && "accent-glow-soft"
                              )}
                            >
                              <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-3">
                                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg", theme.primary)}>
                                    <PieIcon size={20} className={cn(!isCustomTheme && "text-white")} />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('monthly_budget')}</span>
                                    <p className="text-lg font-black">¥{formatCurrency(budget)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">剩余额度</p>
                                  <p className={cn("text-lg font-black", stats.budgetUsage > 90 ? "text-red-500" : (isCustomTheme ? "accent-text" : "text-indigo-500"))}>
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
                                    stats.budgetUsage > 90 ? "bg-gradient-to-r from-red-500 to-rose-400" : (isCustomTheme ? "accent-bg" : "bg-gradient-to-r from-indigo-500 to-purple-400")
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
                            </div>
                          )}
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>

                <AnimatePresence>
                  {isWidgetCenterOpen && (
                    <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md" onClick={() => setIsWidgetCenterOpen(false)}>
                      <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 240 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "w-full max-w-md rounded-t-[2.75rem] sm:rounded-[2.75rem] p-8 shadow-2xl border",
                          isDarkUI ? "bg-slate-900/95 border-slate-700 text-white" : "bg-white/95 border-gray-100 text-gray-900"
                        )}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-black">组件库</h3>
                            <p className={cn("text-[10px] font-bold mt-1", mutedText)}>勾选显示 / 关闭隐藏，顺序在首页编辑模式拖拽调整</p>
                          </div>
                          <button onClick={() => setIsWidgetCenterOpen(false)} className={cn("p-2 rounded-full", isDarkUI ? "bg-slate-800" : "bg-gray-100")}>
                            <X size={18} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {DEFAULT_HOME_WIDGET_CONFIG.order.map((id) => {
                            const on = homeWidgetConfig.enabled[id];
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setHomeWidgetEnabled(id, !on)}
                                className={cn(
                                  "w-full p-4 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.99]",
                                  isDarkUI ? "bg-slate-800/60 border-slate-700 hover:bg-slate-800/75" : "bg-white/70 border-gray-100 hover:bg-white"
                                )}
                              >
                                <div>
                                  <div className="text-sm font-black">{HOME_WIDGET_META[id].title}</div>
                                  <div className={cn("text-[10px] font-bold mt-1", mutedText)}>{HOME_WIDGET_META[id].desc}</div>
                                </div>
                                <div className={cn(
                                  "w-12 h-7 rounded-full relative transition-colors",
                                  on ? theme.primary : (isDarkUI ? "bg-slate-700" : "bg-gray-200")
                                )}>
                                  <motion.div
                                    layout
                                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                                    style={{ left: on ? 26 : 4 }}
                                    transition={{ type: "spring", damping: 22, stiffness: 260 }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>
                            已启用 {DEFAULT_HOME_WIDGET_CONFIG.order.filter(id => homeWidgetConfig.enabled[id]).length} / {DEFAULT_HOME_WIDGET_CONFIG.order.length}
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setIsWidgetCenterOpen(false)}
                            className={cn("px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest", theme.primary, !isCustomTheme && "text-white")}
                          >
                            完成
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

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
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-4 ml-1", mutedText)}>{format(parseISO(date), 'MM月dd日 EEEE', { locale: i18n.language === 'zh-CN' ? zhCN : undefined })}</p>
                        <div className={cn("rounded-[2.5rem] shadow-sm overflow-hidden", surfaceCard())}>
                          {items.map((item, idx) => (
                            <div key={item.id} onClick={() => { setEditingTransaction(item); setIsModalOpen(true); }} className={cn("p-5 flex items-center transition-colors group", idx !== items.length - 1 && "border-b", isBlackGold ? "border-[#2A2A2A]" : isDarkMode ? "border-slate-700" : "border-gray-50")}>
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm mr-4", CATEGORIES.find(c => c.label === item.category)?.color)}>
                                {CATEGORIES.find(c => c.label === item.category)?.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sm">{t(`categories.${item.category}`)}</span>
                                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase", chipNeutral)}>{t(`accounts.${accounts.find(a => a.id === item.accountId)?.name}`)}</span>
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
                                    <div className={cn("flex items-center space-x-1 ml-1 px-1.5 py-0.5 rounded-md", isBlackGold ? "bg-white/10" : "bg-blue-50")}>
                                      <Globe size={8} className={cn(isBlackGold ? "text-[#D4AF37]" : "text-blue-400")} />
                                      <span className={cn("text-[8px] font-black", isBlackGold ? "text-[#D4AF37]" : "text-blue-400")}>{CURRENCIES.find(c => c.code === item.currency)?.flag} {item.originalAmount?.toFixed(2)}</span>
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
                                    <p className={cn("text-[8px] font-bold mt-0.5", mutedText)}>
                                      {showOriginalCurrency[item.id] ? `≈ ¥${formatCurrency(item.amount)}` : `${CURRENCIES.find(c => c.code === item.currency)?.flag} ${item.originalAmount?.toFixed(2)}`}
                                    </p>
                                  )}
                                </motion.div>
                                <button onClick={(e) => deleteTransaction(item.id, e)} className={cn("p-2 transition-opacity opacity-0 group-hover:opacity-100", isBlackGold ? "text-white/40 hover:text-[#D4AF37]" : "text-gray-200 hover:text-red-400")}><Trash2 size={14} /></button>
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
                    <p className={cn("text-sm font-black", isDarkUI ? "text-white" : "text-gray-900")}>资产大盘</p>
                    <p className={cn("text-[10px] font-bold", mutedText)}>总览 · 近 30 天</p>
                  </div>
                  <div className="w-10" />
                </div>

                <div className={cn("rounded-[2.5rem] p-8 shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>当前总资产</p>
                      <p className="text-3xl font-black">¥{formatCurrency(totalAssets)}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>净资产</p>
                      <p className={cn("text-lg font-black", theme.text)}>¥{formatCurrency(assetDashboard.netAssets)}</p>
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
                  <div className={cn("rounded-[2.5rem] p-8 shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                    <h3 className="font-black text-lg mb-4 flex items-center"><PieIcon size={20} className="mr-2 text-emerald-500" />负债 / 净资产</h3>
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
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>负债</p>
                        <p className="text-lg font-black text-rose-500">¥{formatCurrency(assetDashboard.liabilities)}</p>
                      </div>
                      <div className={cn("p-4 rounded-2xl", surfaceCard("rounded-2xl"))}>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>净资产</p>
                        <p className={cn("text-lg font-black", theme.text)}>¥{formatCurrency(assetDashboard.netAssets)}</p>
                      </div>
                    </div>
                  </div>

                  <div className={cn("rounded-[2.5rem] p-8 shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                    <h3 className="font-black text-lg mb-4 flex items-center"><Wallet size={20} className="mr-2 text-indigo-500" />资产分布比例</h3>
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
                              <span className={cn("text-xs font-bold", isDarkUI ? "text-white/80" : "text-gray-700")}>{d.name}</span>
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
              <div id="stats-content" className="space-y-6 pb-10 p-4">
                {/* Branding for Export */}
                <div className="hidden show-on-export mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", theme.primary)}>
                        <Wallet size={24} className={cn(!isCustomTheme && "text-white")} />
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
                {isProMember ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden", surfaceCard("rounded-[2.5rem]"))}
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <div className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Pro Analysis</div>
                    </div>
                    <h3 className="font-black text-lg mb-6 flex items-center"><TrendingUp size={20} className="mr-2 text-amber-500" />{t('spending_forecast')}</h3>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", mutedText)}>预计本月总支出</p>
                        <p className="text-3xl font-black">¥{formatCurrency(stats.predictedTotal)}</p>
                      </div>
                      <div className={cn("text-right", stats.isOverBudgetRisk ? "text-red-500" : "text-green-500")}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">超支风险</p>
                        <p className="text-lg font-black">{stats.isOverBudgetRisk ? '极高 ⚠️' : '极低 ✅'}</p>
                      </div>
                    </div>
                    <div className={cn("w-full h-2 rounded-full overflow-hidden", isBlackGold ? "bg-white/10" : "bg-gray-100")}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats.predictedTotal / budget) * 100, 100)}%` }}
                        className={cn("h-full", stats.isOverBudgetRisk ? "bg-red-500" : theme.primary)}
                      />
                    </div>
                    <p className={cn("mt-4 text-[10px] font-bold leading-relaxed", mutedText)}>
                      基于您本月前 {differenceInDays(new Date(), startOfMonth(currentDate)) + 1} 天的消费频率，预测月底总额将达到 ¥{formatCurrency(stats.predictedTotal)}。
                      {stats.isOverBudgetRisk ? "建议削减非必要开支。" : "目前预算控制良好，请继续保持。"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden", surfaceCard("rounded-[2.5rem]"))}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none" />
                    <h3 className="font-black text-lg mb-3 flex items-center"><TrendingUp size={20} className="mr-2 text-amber-500" />{t('spending_forecast')}</h3>
                    <p className={cn("text-sm font-bold leading-relaxed", mutedText)}>永久会员解锁：消费预测、超支风险与更深度的财富趋势洞察。</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>高级理财实验室</div>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsProPaywallOpen(true)} className="px-4 py-2 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                        ￥60 永久解锁
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Radar Comparison Card */}
                {isProMember ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn("rounded-[2.5rem] p-8 shadow-sm", surfaceCard("rounded-[2.5rem]"))}
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
                            stroke={accentHex}
                            fill={accentHex}
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="上月"
                            dataKey="B"
                            stroke="#94a3b8"
                            fill="#94a3b8"
                            fillOpacity={0.3}
                          />
                          <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkUI ? '#1e293b' : '#fff', color: isDarkUI ? '#fff' : '#000' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-3 h-3 rounded-full", theme.primary)} />
                        <span className={cn("text-[10px] font-black", mutedText)}>本月</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className={cn("text-[10px] font-black", mutedText)}>上月</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn("rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden", surfaceCard("rounded-[2.5rem]"))}
                  >
                    <h3 className="font-black text-lg mb-3 flex items-center"><PieIcon size={20} className="mr-2 text-indigo-500" />{t('spending_radar')}</h3>
                    <p className={cn("text-sm font-bold leading-relaxed", mutedText)}>永久会员解锁：本月 vs 上月消费构成雷达图，对比习惯变化。</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>Pro 可视化</div>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsProPaywallOpen(true)} className="px-4 py-2 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                        ￥60 永久解锁
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <div className={cn("rounded-[2.5rem] p-8 shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                  <h3 className="font-black text-lg mb-6 flex items-center"><LineIcon size={20} className="mr-2 text-blue-500" />{t('trend_title')}</h3>
                  {stats.trendData.some(d => d.amount > 0) ? (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trendData}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={accentHex} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={accentHex} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkUI ? "#334155" : "#f1f5f9"} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                          <YAxis hide />
                          <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkUI ? '#1e293b' : '#fff', color: isDarkUI ? '#fff' : '#000', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="amount" stroke={accentHex} fillOpacity={1} fill="url(#colorAmount)" strokeWidth={4} />
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
                    onClick={() => requestExport('image')}
                    className={cn("px-8 py-4 rounded-full flex items-center space-x-3 shadow-xl active:scale-95 transition-all font-black", theme.primary, !isCustomTheme && "text-white")}
                  >
                    <Share2 size={20} />
                    <span>生成精美账单长图</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'discovery' && (
              <div className="space-y-6">
                {/* User Header */}
                <div className={cn(
                  "rounded-[2.5rem] p-6 border shadow-xl overflow-hidden relative",
                  isDarkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white/50 border-white/60"
                )}>
                  <div className="absolute inset-0 backdrop-blur-2xl" />
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[90px] opacity-40 bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-white/30 border border-white/30 backdrop-blur-xl flex items-center justify-center">
                        <User size={24} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-gray-900")}>理财达人</p>
                          {isProMember && (
                            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                              <Star size={10} fill="currentColor" />
                              <span className="text-[8px] font-black uppercase tracking-widest">PRO</span>
                            </div>
                          )}
                        </div>
                        <p className={cn("text-[10px] font-bold mt-1", mutedText)}>
                          {timeContext === 'morning' ? '早安' : timeContext === 'afternoon' ? '午安' : '晚安'}，欢迎回来
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isProMember && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setIsProPaywallOpen(true)}
                          className={cn(
                            "px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                            isBlackGold ? "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]" : isMinimalWhite ? "bg-black/5 border-black/10 text-gray-700" : (isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/70" : "bg-white/50 border-white/60 text-gray-600")
                          )}
                        >
                          升级 PRO
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Tools Grid */}
                <div className={cn("rounded-[2.5rem] p-6 shadow-sm", surfaceCard("rounded-[2.5rem]"))}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black">常用功能</h3>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>Toolkit</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'assets', label: '资产分析', Icon: LineIcon, onClick: () => setActiveTab('assets') },
                      { key: 'budget', label: '设置', Icon: Settings, onClick: () => setIsBudgetModalOpen(true) },
                      { key: 'export', label: '账单导出', Icon: Share2, onClick: () => requestExport('image') },
                      { key: 'categories', label: '分类管理', Icon: Hash, onClick: () => setDiscoveryTool('categories') },
                      { key: 'fx', label: '汇率换算', Icon: ArrowRightLeft, onClick: () => setDiscoveryTool('exchange') },
                      { key: 'calc', label: '理财计算器', Icon: Calculator, onClick: () => setDiscoveryTool('calculator') },
                    ].map(item => (
                      <motion.button
                        key={item.key}
                        whileTap={{ scale: 0.96 }}
                        onClick={item.onClick}
                        className={cn(
                          "p-4 rounded-[1.75rem] border flex flex-col items-center justify-center space-y-2 transition-all",
                          isBlackGold ? "lux-carbon border-[#2A2A2A]" : isMinimalWhite ? "bg-[#F3F4F6] border-[#E5E7EB] hover:bg-[#EDEEF1]" : (isDarkMode ? "bg-slate-700/60 border-slate-600 hover:bg-slate-700" : "bg-gray-50 border-gray-100 hover:bg-gray-100")
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center border",
                          isBlackGold ? "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]" : isMinimalWhite ? "bg-white border-white text-gray-800" : (isDarkMode ? "bg-slate-800/70 border-slate-600 text-white" : "bg-white border-white text-gray-800")
                        )}>
                          <item.Icon size={18} />
                        </div>
                        <span className={cn("text-[10px] font-black", isBlackGold ? "text-[#F5F5F5]" : isDarkMode ? "text-white/80" : "text-gray-700")}>{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Pro Perks */}
                <div className={cn("rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative", surfaceCard("rounded-[2.5rem]"))}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black">永久会员专属特权</h3>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIsProPaywallOpen(true)}
                      className={cn(
                        "px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                        isProMember
                          ? (isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/70" : "bg-gray-50 border-gray-100 text-gray-600")
                          : "bg-amber-500 text-black border-amber-400 shadow-lg"
                      )}
                    >
                      {isProMember ? '已解锁' : '￥60 永久'}
                    </motion.button>
                  </div>

                  <div className={cn("space-y-3", !isProMember && "opacity-60")}>
                    <div className={cn("p-4 rounded-[1.75rem] border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <Palette size={18} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
                        </div>
                        <div>
                          <p className="text-xs font-black">专属皮肤</p>
                          <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>黑金 / 极简白</p>
                        </div>
                      </div>
                      {!isProMember && <Lock size={16} className={cn(isDarkMode ? "text-white/40" : "text-gray-400")} />}
                    </div>

                    <div className={cn("p-4 rounded-[1.75rem] border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <Share2 size={18} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
                        </div>
                        <div>
                          <p className="text-xs font-black">导出无限制</p>
                          <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>Excel / PDF / 图片</p>
                        </div>
                      </div>
                      {!isProMember && <Lock size={16} className={cn(isDarkMode ? "text-white/40" : "text-gray-400")} />}
                    </div>

                    <div className={cn("p-4 rounded-[1.75rem] border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <Sparkles size={18} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
                        </div>
                        <div>
                          <p className="text-xs font-black">高级理财实验室</p>
                          <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>更深度趋势预测</p>
                        </div>
                      </div>
                      {!isProMember && <Lock size={16} className={cn(isDarkMode ? "text-white/40" : "text-gray-400")} />}
                    </div>

                    <div className={cn("p-4 rounded-[1.75rem] border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <Star size={18} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
                        </div>
                        <div>
                          <p className="text-xs font-black">会员专属标识</p>
                          <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>头像旁皇冠 PRO</p>
                        </div>
                      </div>
                      {!isProMember && <Lock size={16} className={cn(isDarkMode ? "text-white/40" : "text-gray-400")} />}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>专属皮肤</span>
                      {!isProMember && (
                        <span className={cn("text-[10px] font-black", isDarkMode ? "text-white/40" : "text-gray-400")}>锁定</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'blackGold' as ThemeKey, label: '黑金' },
                        { key: 'whiteMinimal' as ThemeKey, label: '极简白' },
                      ].map(tk => (
                        <motion.button
                          key={tk.key}
                          whileTap={{ scale: 0.96 }}
                          disabled={!isProMember}
                          onClick={() => setThemeKey(tk.key)}
                          className={cn(
                            "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            themeKey === tk.key ? cn("shadow-lg", THEMES[tk.key].primary) : (isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/70" : "bg-gray-50 border-gray-100 text-gray-700"),
                            !isProMember && "opacity-60"
                          )}
                        >
                          {tk.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>导出</span>
                      {!isProMember && (
                        <span className={cn("text-[10px] font-black", isDarkMode ? "text-white/40" : "text-gray-400")}>剩余 {remainingFreeExports} 次</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => requestExport('image')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-700")}>
                        图片
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => requestExport('csv')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-700")}>
                        Excel
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => requestExport('pdf')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-700")}>
                        PDF
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Finance Management Card */}
                <div className={cn(
                  "rounded-[2.5rem] p-6 border shadow-sm overflow-hidden relative",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-sm">理财管理</h3>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/40" : "text-gray-400")}>
                      Health
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2", isDarkMode ? "text-white/50" : "text-gray-400")}>财务健康度</div>
                      <div className="flex items-end space-x-2">
                        <div className={cn("text-4xl font-black", stats.budgetUsage > 90 ? "text-rose-500" : theme.text)}>
                          {Math.max(0, Math.min(100, Math.round(100 - stats.budgetUsage)))}
                        </div>
                        <div className={cn("text-xs font-black mb-1", isDarkMode ? "text-white/50" : "text-gray-400")}>/ 100</div>
                      </div>
                      <div className="mt-4 w-full h-2 rounded-full overflow-hidden bg-gray-100/60 dark:bg-slate-700/60">
                        <div
                          className={cn("h-full rounded-full", stats.budgetUsage > 90 ? "bg-rose-500" : theme.primary)}
                          style={{ width: `${Math.max(0, Math.min(100, 100 - stats.budgetUsage))}%` }}
                        />
                      </div>
                    </div>
                    <div className={cn("rounded-[2rem] p-4 border", isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest mb-3", isDarkMode ? "text-white/50" : "text-gray-400")}>近 7 天支出</div>
                      <div className="flex items-end justify-between h-14">
                        {stats.trendData.map((d, idx) => (
                          <div key={d.date + idx} className="flex-1 flex justify-center">
                            <div
                              className={cn("w-2 rounded-full", idx === stats.trendData.length - 1 ? theme.primary : (isDarkMode ? "bg-white/20" : "bg-gray-300/70"))}
                              style={{ height: `${Math.min(56, Math.max(6, d.amount / 20))}px` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Marquee */}
                <div className={cn(
                  "rounded-[2.5rem] p-6 border shadow-sm overflow-hidden",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Smile size={18} className={cn(isDarkMode ? "text-white/60" : "text-gray-700")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>省钱小贴士</span>
                    </div>
                    <span className={cn("text-[10px] font-black", isDarkMode ? "text-white/40" : "text-gray-400")}>“{wealthTip}”</span>
                  </div>
                  <div className="relative overflow-hidden">
                    <motion.div
                      animate={{ x: ['0%', '-50%'] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                      className={cn("whitespace-nowrap text-sm font-black", isDarkMode ? "text-white/70" : "text-gray-700")}
                    >
                      <span>{wealthMarquee}</span>
                      <span className="mx-6 opacity-60">·</span>
                      <span>{wealthMarquee}</span>
                    </motion.div>
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
                        <div key={day.toString()} onClick={() => setSelectedCalendarDate(day)} className={cn("aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative cursor-pointer", isSameDay(day, selectedCalendarDate) ? cn(theme.primary, !isCustomTheme && "text-white") : (isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"))}>
                          <span className="text-xs font-black">{format(day, 'd')}</span>
                          {dayExpense > 0 && (
                            <span className={cn(
                              "text-[6px] font-black absolute bottom-1",
                              isSameDay(day, selectedCalendarDate) ? (isCustomTheme ? "accent-on opacity-80" : "text-white/80") : "text-red-400"
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
                {isProMember && (
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
                    <User className={cn(!isCustomTheme && "text-white")} size={28} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="text-white" size={10} fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className={cn("font-black", !isCustomTheme && "text-white")}>{t('user_nickname')}</p>
                      <span className={cn("text-[8px] bg-white/20 px-1.5 py-0.5 rounded-full font-black", !isCustomTheme && "text-white")}>PRO</span>
                    </div>
                    <p className={cn("text-[10px] font-bold", isCustomTheme ? "accent-on opacity-70" : "text-white/60")}>已激活永久高级会员</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className={cn("flex-1 py-2 bg-white/10 rounded-xl text-[8px] font-black uppercase text-center backdrop-blur-sm", !isCustomTheme && "text-white")}>
                    云端同步中...
                  </div>
                  <div className={cn("flex-1 py-2 bg-white/20 rounded-xl text-[8px] font-black uppercase text-center backdrop-blur-sm", !isCustomTheme && "text-white")}>
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

                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-2">主题与调色盘</label>
                  <div className={cn("rounded-[2rem] overflow-hidden", isDarkMode ? "bg-slate-700" : "bg-gray-50")}>
                    <div className="p-5 border-b border-black/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: derivedTheme.accentBg }}>
                            <Palette size={18} style={{ color: derivedTheme.accentText }} />
                          </div>
                          <div>
                            <div className="text-sm font-black">全能调色盘</div>
                            <div className={cn("text-[10px] font-bold mt-1", isDarkMode ? "text-white/50" : "text-gray-500")}>
                              主色 {derivedTheme.accent.toUpperCase()} · 浅 20% 背景 · 深 30% 阴影 · 自动反色
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setThemeKey('custom')}
                          className={cn(
                            "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                            isCustomTheme ? "lux-gold border-[#D4AF37] text-black" : (isDarkMode ? "bg-slate-800 border-slate-600 text-white/70" : "bg-white border-gray-100 text-gray-700")
                          )}
                        >
                          {isCustomTheme ? '已启用' : '启用'}
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2", isDarkMode ? "text-white/50" : "text-gray-400")}>选择主色</div>
                          <div className={cn("text-xs font-black", isDarkMode ? "text-white/80" : "text-gray-700")}>拖动或点击色盘实时预览</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-9 h-9 rounded-2xl border" style={{ backgroundColor: derivedTheme.accent, borderColor: derivedTheme.accentBg }} />
                          <div className="w-9 h-9 rounded-2xl border" style={{ backgroundColor: derivedTheme.accentBg, borderColor: derivedTheme.accentBg }} />
                          <div className="w-9 h-9 rounded-2xl border" style={{ backgroundColor: derivedTheme.accentText, borderColor: derivedTheme.accentBg }} />
                        </div>
                      </div>

                      {(() => {
                        const size = 220;
                        const radius = size / 2;
                        const angle = (customHS.h * Math.PI) / 180;
                        const x = Math.cos(angle) * (customHS.s * (radius - 14));
                        const y = Math.sin(angle) * (customHS.s * (radius - 14));
                        return (
                          <div className="mt-6 flex justify-center">
                            <div
                              ref={colorPickerRef}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                isPickingRef.current = true;
                                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                                pickAccentAt(e.clientX, e.clientY);
                              }}
                              onPointerMove={(e) => {
                                if (!isPickingRef.current) return;
                                if (e.pointerType !== 'touch' && e.buttons === 0) return;
                                pickAccentAt(e.clientX, e.clientY);
                              }}
                              onPointerUp={(e) => {
                                isPickingRef.current = false;
                                try {
                                  (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                                } catch { }
                              }}
                              onPointerCancel={(e) => {
                                isPickingRef.current = false;
                                try {
                                  (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                                } catch { }
                              }}
                              className="relative"
                              style={{
                                width: size,
                                height: size,
                                borderRadius: size,
                                touchAction: 'none',
                                backgroundImage:
                                  "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 55%), conic-gradient(from 180deg, #ff004c, #ff7a00, #ffee00, #36d000, #00e5ff, #1c55ff, #b000ff, #ff004c)",
                              }}
                            >
                              <div className="absolute inset-0 rounded-full border border-black/10 backdrop-blur-[1px]" />
                              <motion.div
                                layout
                                transition={{ type: "spring", damping: 22, stiffness: 260 }}
                                className="absolute w-7 h-7 rounded-full border-2 shadow-xl"
                                style={{
                                  left: radius + x - 14,
                                  top: radius + y - 14,
                                  backgroundColor: derivedTheme.accent,
                                  borderColor: derivedTheme.accentText,
                                  boxShadow: `0 16px 40px ${derivedTheme.accentShadow}`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      <div className="mt-6 flex items-center justify-between">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { setCustomAccent('#6366F1'); setThemeKey('custom'); }}
                          className={cn("px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-800 border-slate-600 text-white/70" : "bg-white border-gray-100 text-gray-700")}
                        >
                          重置为默认
                        </motion.button>
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/40" : "text-gray-400")}>
                          0.5s 墨水晕开过渡
                        </div>
                      </div>
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
        {discoveryTool && (
          <div className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md" onClick={() => setDiscoveryTool(null)}>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl border",
                isDarkMode ? "bg-slate-800/95 border-slate-700 text-white" : "bg-white/95 border-gray-100 text-gray-900"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">
                  {discoveryTool === 'categories' ? '分类管理' : discoveryTool === 'exchange' ? '汇率换算' : '理财计算器'}
                </h3>
                <button onClick={() => setDiscoveryTool(null)} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-100")}>
                  <X size={18} />
                </button>
              </div>

              {discoveryTool === 'categories' && (
                <div className={cn("p-6 rounded-[2rem] border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/70" : "bg-gray-50 border-gray-100 text-gray-600")}>
                  <p className="text-sm font-bold leading-relaxed">分类管理功能即将上线。当前版本可在记账时选择分类，并在统计页查看分类构成。</p>
                </div>
              )}

              {discoveryTool === 'exchange' && (
                <div className="space-y-3">
                  {[
                    { code: 'USD', name: '美元' },
                    { code: 'EUR', name: '欧元' },
                    { code: 'JPY', name: '日元' },
                    { code: 'HKD', name: '港币' },
                  ].map(c => (
                    <div key={c.code} className={cn("p-4 rounded-2xl border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <Globe size={18} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
                        </div>
                        <div>
                          <p className="text-sm font-black">{c.name}</p>
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
                    <label className={cn("text-[10px] font-black uppercase tracking-widest block mb-2", isDarkMode ? "text-white/50" : "text-gray-400")}>输入预计月薪</label>
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
                        <span className={cn("text-xs font-bold", isDarkMode ? "text-white/60" : "opacity-60")}>{item.label}</span>
                        <span className={cn("text-lg font-black", isDarkMode ? "text-white" : item.color)}>¥{formatCurrency(item.amount)}</span>
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
        {isProPaywallOpen && (
          <div className="fixed inset-0 z-[190] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md" onClick={() => setIsProPaywallOpen(false)}>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-md rounded-t-[2.75rem] sm:rounded-[2.75rem] p-8 shadow-2xl border overflow-hidden relative",
                isDarkMode ? "bg-slate-900/95 border-slate-700 text-white" : "bg-white/95 border-gray-100 text-gray-900"
              )}
            >
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[110px] opacity-50 bg-gradient-to-br from-amber-400 to-fuchsia-400" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg">
                        <Star size={18} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-lg font-black">￥60 永久会员</p>
                        <p className={cn("text-[10px] font-bold mt-1", isDarkMode ? "text-white/60" : "text-gray-500")}>永久解锁所有特权</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsProPaywallOpen(false)} className={cn("p-2 rounded-2xl border", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100")}>
                    <X size={18} />
                  </button>
                </div>

                <div className={cn("rounded-[2rem] p-5 border", isDarkMode ? "bg-slate-800/70 border-slate-700" : "bg-gray-50 border-gray-100")}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '专属皮肤', desc: '黑金 / 极简白' },
                      { label: '导出无限制', desc: 'Excel / PDF / 图片' },
                      { label: '高级实验室', desc: '更深度趋势预测' },
                      { label: '会员皇冠', desc: '头像旁 PRO 标识' },
                    ].map(i => (
                      <div key={i.label} className={cn("p-4 rounded-2xl border", isDarkMode ? "bg-slate-900/60 border-slate-700" : "bg-white border-white")}>
                        <p className="text-xs font-black">{i.label}</p>
                        <p className={cn("mt-1 text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-500")}>{i.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  {!isProMember && (
                    <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-500")}>
                      普通用户免费导出仅限 10 次，当前已使用 {exportCount} 次，剩余 {remainingFreeExports} 次。
                    </p>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={purchasePro}
                    className="py-4 rounded-2xl font-black text-xs bg-amber-500 text-black shadow-lg transition-all"
                  >
                    立即购买
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                      i18n.language === l.id ? cn(theme.primary, !isCustomTheme && "text-white", "border-transparent") : (isDarkMode ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600" : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100")
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
                      "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] border-4 border-white dark:border-slate-900 transition-all pointer-events-auto",
                      theme.primary,
                      !isCustomTheme && "text-white"
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
    </motion.div>
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
