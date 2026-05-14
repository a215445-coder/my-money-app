import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  PlusCircle,
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
  Sparkles,
  Moon,
  LogOut,
  Compass,
  Zap as ZapIcon,
  Calculator,
  GripVertical,
  Users,
  Vault,
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import { motion, AnimatePresence, Reorder, useMotionValue, useScroll, useTransform } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import type { Transaction, Category, TransactionType, Account, CurrencyCode, Currency } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type OnboardingSlide = {
  titleKey: string;
  descriptionKey: string;
  Icon: React.ElementType;
  bg: string;
  accent: string;
  ctaKey?: string;
};

const ONBOARDING_BG_STOPS: string[] = ['#DCEBFF', '#F6F0E6', '#141821', '#0B2A1A', '#FFFFFF'];
const ONBOARDING_BG_LUMINANCE_STOPS: number[] = [0.9, 0.88, 0.12, 0.14, 1];

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    titleKey: 'onboarding.slides.lab.title',
    descriptionKey: 'onboarding.slides.lab.desc',
    Icon: LineIcon,
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950',
    accent: 'from-indigo-400 to-purple-400',
  },
  {
    titleKey: 'onboarding.slides.fast.title',
    descriptionKey: 'onboarding.slides.fast.desc',
    Icon: ZapIcon,
    bg: 'bg-gradient-to-br from-fuchsia-950 via-slate-950 to-slate-950',
    accent: 'from-pink-400 to-fuchsia-400',
  },
  {
    titleKey: 'onboarding.slides.rule.title',
    descriptionKey: 'onboarding.slides.rule.desc',
    Icon: Calculator,
    bg: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950',
    accent: 'from-emerald-400 to-cyan-400',
  },
  {
    titleKey: 'onboarding.slides.insight.title',
    descriptionKey: 'onboarding.slides.insight.desc',
    Icon: Cloud,
    bg: 'bg-gradient-to-br from-sky-950 via-slate-950 to-slate-950',
    accent: 'from-sky-400 to-indigo-400',
  },
  {
    titleKey: 'onboarding.slides.start.title',
    descriptionKey: 'onboarding.slides.start.desc',
    Icon: User,
    bg: 'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950',
    accent: 'from-amber-400 to-orange-400',
    ctaKey: 'onboarding.slides.start.cta',
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
  const { t } = useTranslation();
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
                            <div className="text-[10px] font-bold mt-1" style={{ color: mutedColor }}>{t('onboarding.mock.category_line')}</div>
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
                              <span className="text-xs font-black">{t('onboarding.module', { n: i + 1 })}</span>
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
                          <div className="text-lg font-black leading-snug mt-2">{t('onboarding.mock.insight_title')}</div>
                          <div className="mt-2 text-[10px] font-bold" style={{ color: mutedColor }}>{t('onboarding.mock.insight_desc')}</div>
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
                          {t('login.phone_login')}
                        </button>
                        <button className="py-4 rounded-2xl bg-white/10 border border-white/10 font-black text-xs active:scale-95 transition-all">
                          {t('login.wechat_login')}
                        </button>
                      </div>
                      <button className="mt-3 w-full py-4 rounded-2xl bg-white/10 border border-white/10 font-black text-xs active:scale-95 transition-all">
                        {t('login.google_login')}
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
            <h1 className="text-4xl font-black tracking-tight leading-[1.05]">{t(slide.titleKey)}</h1>
          </motion.div>
          <motion.p variants={descVariants} className="mt-4 text-base font-bold leading-relaxed" style={{ color: mutedColor }}>
            {t(slide.descriptionKey)}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

function OnboardingScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const { t } = useTranslation();
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
              {t('onboarding.badge')}
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
              {t('onboarding.prev')}
            </motion.button>

            {index < total - 1 ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollToIndex(index + 1)}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                style={{ backgroundColor: contentColor, color: contentInverseColor }}
              >
                {t('onboarding.next')}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onGoLogin}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                style={{ backgroundColor: contentColor, color: contentInverseColor }}
              >
                {t('onboarding.slides.start.cta')}
              </motion.button>
            )}
          </div>

          <motion.div className="mt-4 text-center text-[10px] font-bold" style={{ color: mutedColor }}>
            {t('onboarding.swipe_hint')}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onAuthed }: { onAuthed: () => void }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  return (
    <div className="fixed inset-0 z-[300] overflow-hidden text-white bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[140px] bg-indigo-500/20" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[140px] bg-fuchsia-500/20" />
      <div className="absolute inset-0 p-8 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-black tracking-tight">{t('login.title')}</h1>
            <p className="mt-3 text-white/60 text-sm font-bold">{t('login.subtitle')}</p>

            <div className="mt-10 rounded-[3rem] p-8 border border-white/15 bg-white/8 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder={t('login.phone_placeholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold placeholder:text-white/30 focus:outline-none focus:ring-4 ring-white/10"
                  />
                </div>

                <button
                  onClick={onAuthed}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm shadow-lg active:scale-95 transition-all"
                >
                  {t('login.phone_login')}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onAuthed}
                    className="py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-black text-xs active:scale-95 transition-all"
                  >
                    {t('login.wechat_login')}
                  </button>
                  <button
                    onClick={onAuthed}
                    className="py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-black text-xs active:scale-95 transition-all"
                  >
                    {t('login.google_login')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] font-bold text-white/40">
              {t('login.continue_legal')}
            </div>
          </div>
        </div>
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
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
];

const BLACK_GOLD_THEME = {
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
  const [discoveryTool, setDiscoveryTool] = useState<null | 'categories' | 'exchange' | 'calculator' | 'groupSaving'>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'chart' | 'vault' | 'discovery' | 'assets'>('list');
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
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
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const vaultJarRef = useRef<HTMLDivElement>(null);

  const [localUserId] = useState(() => {
    const existing = localStorage.getItem('local_user_id');
    if (existing) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem('local_user_id', next);
    return next;
  });
  const [localUserName] = useState(() => {
    const existing = localStorage.getItem('local_user_name');
    if (existing) return existing;
    const next = t('user_title');
    localStorage.setItem('local_user_name', next);
    return next;
  });

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
  const wealthTips = useMemo(() => (t('wealth_tips', { returnObjects: true }) as string[]), [t, i18n.language]);

  const [wealthTip, setWealthTip] = useState(() => wealthTips[0] || '');

  useEffect(() => {
    if (activeTab === 'discovery') {
      setWealthTip(wealthTips[Math.floor(Math.random() * wealthTips.length)] || '');
    }
  }, [activeTab, wealthTips]);

  useEffect(() => {
    if (activeTab === 'list') setIsHomeEditMode(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(HOME_WIDGETS_STORAGE_KEY, JSON.stringify(homeWidgetConfig));
  }, [homeWidgetConfig]);

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
    if (activeTab !== 'list') {
      setIsHomeEditMode(false);
      setIsWidgetCenterOpen(false);
    }
  }, [activeTab]);

  const wealthMarquee = useMemo(() => wealthTips.join('  ·  '), [wealthTips]);

  // --- Settings & i18n ---
  const isDarkMode = true;
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [showOriginalCurrency, setShowOriginalCurrency] = useState<Record<string, boolean>>({});

  // --- Privacy & Theme ---
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [pin] = useState(() => localStorage.getItem('privacy_pin') || '');
  const [isLockEnabled] = useState(() => localStorage.getItem('privacy_lock_enabled') === 'true');
  const [inputPin, setInputPin] = useState('');
  const theme = BLACK_GOLD_THEME;
  const isBlackGold = true;
  const isDarkUI = true;
  const accentHex = '#D4AF37';

  const mutedText = theme.mutedText;
  const chipNeutral = "bg-white/10 text-white/70";
  const surfaceCard = (...extra: ClassValue[]) => cn(
    "border rounded-2xl overflow-hidden",
    "shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.55),0_0_1.5rem_rgba(212,175,55,0.10)]",
    cn(theme.surfaceSoft, theme.surfaceBorder, theme.appText, 'lux-gold-glow-soft lux-gold-glow-breathe'),
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

    return { amount, category, note: note || t('voice.default_note') };
  };

  const buildBackupKV = () => {
    const exactKeys = new Set<string>([
      'transactions',
      'accounts',
      'monthly_budget',
      'app_lang',
      'pro_member',
      'export_count',
      'onboarding_done',
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
    kv.pro_member = String(isProMember);
    kv.export_count = String(exportCount);
    kv.onboarding_done = String(hasOnboarded);
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

  const restoreBackupKV = (kv: Record<string, string | null>) => {
    const keysToClear: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const isKnownExact = [
        'transactions',
        'accounts',
        'monthly_budget',
        'app_lang',
        'pro_member',
        'export_count',
        'onboarding_done',
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
      ].includes(key);
      if (isKnownExact || key.startsWith('group_saving_activities_')) keysToClear.push(key);
    }
    keysToClear.forEach(k => localStorage.removeItem(k));

    Object.entries(kv).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      localStorage.setItem(key, typeof value === 'string' ? value : String(value));
    });
    alert(t('backup_import_success'));
    window.location.reload();
  };

  const triggerBackupImport = () => {
    const ok = confirm(t('backup_confirm_replace'));
    if (!ok) return;
    if (backupFileInputRef.current) backupFileInputRef.current.value = '';
    backupFileInputRef.current?.click();
  };

  const handleBackupFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const kv = parsed?.schema === 1 && parsed?.kv && typeof parsed.kv === 'object' ? (parsed.kv as Record<string, string | null>) : null;
      if (!kv) {
        alert(t('backup_invalid_file'));
        return;
      }
      restoreBackupKV(kv);
    } catch {
      alert(t('backup_invalid_file'));
    }
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
      link.download = t('export_files.image', { month: format(currentDate, 'yyyy-MM') });
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
    link.download = t('export_files.csv', { month: format(currentDate, 'yyyy-MM') });
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
      win.document.write(`<html><head><title>${t('export_files.report_title')}</title></head><body style="margin:0;background:#fff"><img src="${image}" style="width:100%;height:auto" /></body></html>`);
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
  useEffect(() => localStorage.setItem('app_lang', i18n.language), [i18n.language]);
  useEffect(() => localStorage.setItem('pro_member', isProMember.toString()), [isProMember]);
  useEffect(() => localStorage.setItem('export_count', String(exportCount)), [exportCount]);

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
  const [vaultCap, setVaultCap] = useState<number>(() => {
    const raw = localStorage.getItem('vault_cap_v1');
    const v = raw ? Number(raw) : NaN;
    return Number.isFinite(v) && v > 0 ? v : 10000;
  });
  const [vaultCoins, setVaultCoins] = useState<Array<{ id: string; seed: number }>>([]);
  const [vaultGlowTick, setVaultGlowTick] = useState(0);
  const pendingVaultDropsRef = useRef(0);
  const prevTotalAssetsRef = useRef<number>(totalAssets);

  const vaultFillPct = useMemo(() => {
    const cap = Math.max(1000, vaultCap);
    return clamp(totalAssets / cap, 0, 1);
  }, [totalAssets, vaultCap]);

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

    const nextCap = Math.max(vaultCap, totalAssets, 10000);
    if (nextCap !== vaultCap) {
      setVaultCap(nextCap);
      localStorage.setItem('vault_cap_v1', String(nextCap));
    }

    const dropCount = 3;
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
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const id = crypto.randomUUID();
    const palette = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb7185'];
    const emojis = ['🍀', '🧋', '🏡', '✨', '🧸', '🌿'];
    const memberMe: GroupSavingMember = { id: localUserId, name: localUserName, color: palette[0], emoji: '🧑' };
    const memberA: GroupSavingMember = { id: crypto.randomUUID(), name: t('group.demo_member_a'), color: palette[1], emoji: emojis[1] };
    const memberB: GroupSavingMember = { id: crypto.randomUUID(), name: t('group.demo_member_b'), color: palette[2], emoji: emojis[0] };
    const group: GroupSavingGroup = {
      id,
      name: name.trim() || t('group.default_name'),
      code,
      members: [memberMe, memberA, memberB],
      publicBudget: 3000,
      createdAt: Date.now(),
    };
    const pool = loadGroupPool();
    pool[code] = group;
    saveGroupPool(pool);
    setGroupSaving(group);
    setDiscoveryTool('groupSaving');
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
    setDiscoveryTool('groupSaving');
  };

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
    const normalizedVisibility = t.visibility || 'private';
    const normalizedGroupId = normalizedVisibility === 'group' ? (t.groupId || groupSaving?.id) : undefined;
    const normalizedToPool = normalizedVisibility === 'group' ? !!t.toGroupPool : false;
    const newTransaction: Transaction = { ...t, id, visibility: normalizedVisibility, groupId: normalizedGroupId, toGroupPool: normalizedToPool };

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
      const wasGroup = editingTransaction.visibility === 'group' && !!editingTransaction.groupId;
      const nowGroup = newTransaction.visibility === 'group' && !!newTransaction.groupId;
      if (!wasGroup && nowGroup && newTransaction.groupId === groupSaving?.id) appendGroupActivity('add', newTransaction);
      else if (wasGroup && !nowGroup && editingTransaction.groupId === groupSaving?.id) appendGroupActivity('delete', editingTransaction);
      else if (wasGroup && nowGroup && newTransaction.groupId === groupSaving?.id) appendGroupActivity('edit', newTransaction);
      setTransactions(transactions.map(item => item.id === id ? newTransaction : item));
    } else {
      if (newTransaction.visibility === 'group' && newTransaction.groupId === groupSaving?.id) appendGroupActivity('add', newTransaction);
      setTransactions([newTransaction, ...transactions]);
    }
    setAccounts(updatedAccounts);
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirm_delete'))) {
      const toDelete = transactions.find(t => t.id === id);
      if (toDelete) {
        if (toDelete.visibility === 'group' && toDelete.groupId === groupSaving?.id) appendGroupActivity('delete', toDelete);
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
    if (confirm(t('confirm_reset'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatCurrency = (v: number) => v.toLocaleString(i18n.language === 'en-US' ? 'en-US' : 'zh-CN', { minimumFractionDigits: 2 });
  const dateLocale = i18n.language === 'zh-CN' ? zhCN : enUS;

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
      const targetX = rect.left + rect.width / 2 + (seed - 0.5) * jarW * 0.55;
      const groundY = rect.top + rect.height * 0.76;

      let posX = targetX + (seed - 0.5) * jarW * 0.25;
      let posY = -window.innerHeight * 0.12;
      let velX = (seed - 0.5) * 140;
      let velY = 0;

      x.set(posX);
      y.set(posY);

      const g = 2400;
      const bounce = 0.56;
      const friction = 0.86;
      const spin = (seed - 0.5) * 220;

      let raf = 0;
      let last = performance.now();
      let settledFrames = 0;

      const tick = (now: number) => {
        const dt = Math.min(0.028, Math.max(0.008, (now - last) / 1000));
        last = now;

        velY += g * dt;
        posY += velY * dt;
        posX += velX * dt;

        rotateY.set((rotateY.get() + spin * dt) % 360);
        rotateZ.set((rotateZ.get() + spin * 0.6 * dt) % 360);

        if (posY >= groundY) {
          posY = groundY;
          velY = -velY * bounce;
          velX *= friction;
          scale.set(1.02);
        } else {
          scale.set(1);
        }

        x.set(posX);
        y.set(posY);

        if (Math.abs(velY) < 70 && posY >= groundY - 0.5) settledFrames += 1;
        else settledFrames = 0;

        if (settledFrames > 18) {
          onRest(coinId);
          return;
        }
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
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
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 22%, rgba(212,175,55,0.95) 48%, rgba(212,175,55,0.65) 70%, rgba(0,0,0,0.25) 100%)",
              boxShadow: "0 10px 22px rgba(0,0,0,0.35), 0 0 22px rgba(212,175,55,0.25)",
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
              border: "1px solid rgba(255,255,255,0.22)",
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
      case 'today': return format(currentDate, i18n.language === 'zh-CN' ? 'MM月dd日' : 'MMM dd', { locale: dateLocale });
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, i18n.language === 'zh-CN' ? 'MM.dd' : 'MMM dd', { locale: dateLocale })} - ${format(end, i18n.language === 'zh-CN' ? 'MM.dd' : 'MMM dd', { locale: dateLocale })}`;
      }
      case 'year': return format(currentDate, i18n.language === 'zh-CN' ? 'yyyy年' : 'yyyy', { locale: dateLocale });
      case 'month': default: return format(currentDate, i18n.language === 'zh-CN' ? 'yyyy年MM月' : 'MMM yyyy', { locale: dateLocale });
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
        "min-h-screen transition-all duration-1000 pb-[calc(clamp(6rem,12vw,8rem)+env(safe-area-inset-bottom))] font-sans relative overflow-hidden",
        cn(theme.appBg, theme.appText)
      )}
    >
      <input
        ref={backupFileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleBackupFileChange}
      />
      {/* Decorative background blobs */}
      <>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#D4AF37]/8 rounded-full blur-[160px] pointer-events-none" />
      </>

      {/* Privacy Lock Screen */}
      {isLocked && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center p-8", "lux-carbon text-[#F5F5F5]")}>
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
      <div className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity", isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsMenuOpen(false)} />
      <aside className={cn(
        "fixed top-0 left-0 h-full w-[280px] z-[70] shadow-2xl transition-transform duration-500 rounded-r-[2.5rem] p-8",
        cn(theme.surface, theme.surfaceBorder, theme.appText, "border-r"),
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", isDarkMode ? "bg-white text-black" : "bg-black text-white")}>
              <Wallet size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter">{t('app_name')}</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className={cn("p-2 rounded-full", isDarkMode ? "bg-slate-700" : "bg-gray-50")}><X size={20} /></button>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'list', label: t('bill_detail'), icon: <History size={20} /> },
            { id: 'chart', label: t('stats'), icon: <PieIcon size={20} /> },
            { id: 'vault', label: t('vault'), icon: <Vault size={20} /> },
            { id: 'discovery', label: t('discovery'), icon: <Compass size={20} /> },
            { id: 'settings', label: t('settings'), icon: <Settings size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => {
              if (item.id === 'settings') setIsBudgetModalOpen(true);
              else setActiveTab(item.id as any);
              setIsMenuOpen(false);
            }} className={cn(
              "w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all",
              activeTab === item.id ? cn("bg-white/5 border border-white/10", theme.text, theme.shadow) : "hover:bg-white/5 text-white/80"
            )}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-[clamp(1rem,3vw,2rem)] pt-[calc(clamp(1.75rem,4vw,3rem)+env(safe-area-inset-top))] pb-[clamp(1.25rem,3vw,2rem)] space-y-[clamp(1.25rem,3vw,2rem)] relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsMenuOpen(true)} className={cn("p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
              <Menu size={20} />
            </button>
            <button onClick={() => setIsVoiceModalOpen(true)} className={cn("p-3 rounded-2xl shadow-sm border active:scale-90 transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100")}>
              <svg className="w-5 h-5 text-[#D4AF37] ai-voice-standby" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.section_title')}</div>
                        <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>
                          {isHomeEditMode ? t('home_widgets.hint_edit') : t('home_widgets.hint_view')}
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
                          <span>{t('home_widgets.add')}</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setIsHomeEditMode(v => !v)}
                          className={cn(
                            "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                            isHomeEditMode ? "bg-rose-500 border-rose-500 text-white" : (isDarkUI ? "bg-slate-800/60 border-slate-700 text-white/70" : "bg-white/60 border-white/70 text-gray-700")
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
                                  <GripVertical size={16} className={cn(isDarkUI ? "text-white/70" : "text-gray-700")} />
                                </div>
                              </>
                            )}

                            {wid === 'todayBoard' && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                  <div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.today_board')}</div>
                                    <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>
                                      {moduleQuery ? t('home_widgets.filtered', { query: searchQuery }) : t('home_widgets.swipe_hint')}
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
                                      {t('home_widgets.clear_filter')}
                                    </motion.button>
                                  )}
                                </div>

                                <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
                                  <motion.div
                                    layout
                                    className={cn("min-w-[240px] snap-start p-5", surfaceCard())}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.today_expense')}</div>
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{format(new Date(), 'MM.dd', { locale: dateLocale })}</div>
                                    </div>
                                    <div className="mt-3 text-2xl font-black tracking-tight">¥{formatCurrency(homeToday.expense)}</div>
                                    <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>{t('home_widgets.search_link_hint')}</div>
                                  </motion.div>

                                  <motion.div
                                    layout
                                    className={cn("min-w-[240px] snap-start p-5", surfaceCard())}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.month_remaining_budget')}</div>
                                      <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{Math.max(0, 100 - homeMonth.usedPct).toFixed(0)}%</div>
                                    </div>
                                    <div className="mt-3 flex items-end justify-between">
                                      <div className="text-lg font-black">¥{formatCurrency(homeMonth.remaining)}</div>
                                      <div className={cn("text-[10px] font-bold", mutedText)}>{t('home_widgets.used_prefix')} ¥{formatCurrency(homeMonth.expense)}</div>
                                    </div>
                                    <div className={cn("mt-4 h-3 rounded-full overflow-hidden", isDarkUI ? "bg-white/10" : "bg-black/5")}>
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(homeMonth.usedPct, 100)}%` }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        className={cn("h-full", homeMonth.usedPct > 90 ? "bg-rose-500" : theme.primary)}
                                      />
                                    </div>
                                    <div className={cn("mt-3 text-[10px] font-bold", mutedText)}>{t('home_widgets.progress_hint')}</div>
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
                                    <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>{t('home_widgets.week_trend_desc')}</div>
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
                                        <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.week_total')}</div>
                                        <div className="text-sm font-black">¥{formatCurrency(homeWeekSeries.reduce((s, x) => s + x.amount, 0))}</div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {wid === 'topCategories' && (
                              <div className={cn("p-6", surfaceCard())}>
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('home_widgets.top_categories')}</div>
                                    <div className={cn("text-xs font-black mt-1", isDarkUI ? "text-white/80" : "text-gray-800")}>{t('home_widgets.top_categories_desc')}</div>
                                  </div>
                                  <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>TOP3</div>
                                </div>

                                {homeMonth.topCategories.length === 0 ? (
                                  <div className={cn("p-6 rounded-2xl border-2 border-dashed text-center", isDarkUI ? "border-slate-700 text-white/50" : "border-gray-100 text-gray-400")}>
                                    <div className="text-xs font-bold">{t('home_widgets.month_no_expense')}</div>
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
                                <div className={cn("mt-4 text-[10px] font-bold", mutedText)}>{t('home_widgets.top_categories_click_hint')}</div>
                              </div>
                            )}

                            {wid === 'summary' && (
                              <div
                                className={cn(
                                  "p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/20",
                                  theme.primary,
                                  "text-white"
                                )}
                              >
                                <motion.div
                                  aria-hidden
                                  className="absolute inset-0 z-0 lux-abyss-gold-wave pointer-events-none"
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 1, ease: "easeInOut" }}
                                  style={{ transform: "translate3d(0,0,0)" }}
                                />
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-125" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />


                                <div className="flex justify-between items-start mb-12 relative z-10">
                                  <div>
                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-3", "text-white/60")}>{t('total_assets')}</p>
                                    <div className="text-5xl font-black tracking-tighter drop-shadow-lg flex items-end">
                                      <span className="mr-1">¥</span>
                                      <RollingNumber value={totalAssets} />
                                    </div>
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
                                      <span className={cn("text-[10px] font-black uppercase tracking-widest", "text-white/60")}>{t('expense')}</span>
                                    </div>
                                    <p className="text-2xl font-black">¥{formatCurrency(stats.expense)}</p>
                                  </div>
                                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 transition-transform hover:scale-105">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center">
                                        <TrendingUp size={12} className="text-green-200" />
                                      </div>
                                      <span className={cn("text-[10px] font-black uppercase tracking-widest", "text-white/60")}>{t('income')}</span>
                                    </div>
                                    <p className="text-2xl font-black">¥{formatCurrency(stats.income)}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {wid === 'budgetProgress' && (
                              <div
                                className={cn(
                                  "p-8 backdrop-blur-xl transition-all",
                                  surfaceCard()
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
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{t('budget_remaining')}</p>
                                    <p className={cn("text-lg font-black", stats.budgetUsage > 90 ? "text-red-500" : "text-[#D4AF37]")}>
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
                                      stats.budgetUsage > 90 ? "bg-gradient-to-r from-red-500 to-rose-400" : "lux-gold"
                                    )}
                                  >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                  </motion.div>
                                </div>

                                <div className="flex justify-between items-center px-1">
                                  <div className="flex items-center space-x-2">
                                    <div className={cn("px-2 py-1 rounded-md text-[8px] font-black uppercase", stats.budgetUsage > 90 ? "bg-red-100 text-red-500" : "bg-indigo-100 text-indigo-500")}>
                                      {t('home_widgets.used_prefix')} {stats.budgetUsage.toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-gray-500">
                                    <Calculator size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-tight">{t('daily_available', { amount: stats.dailyBudget.toFixed(0) })}</span>
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
                              <h3 className="text-lg font-black">{t('widget_center')}</h3>
                              <p className={cn("text-[10px] font-bold mt-1", mutedText)}>{t('widget_center_desc')}</p>
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
                                    <div className="text-sm font-black">{t(HOME_WIDGET_META[id].titleKey)}</div>
                                    <div className={cn("text-[10px] font-bold mt-1", mutedText)}>{t(HOME_WIDGET_META[id].descKey)}</div>
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
                              {t('enabled_count', {
                                enabled: DEFAULT_HOME_WIDGET_CONFIG.order.filter(id => homeWidgetConfig.enabled[id]).length,
                                total: DEFAULT_HOME_WIDGET_CONFIG.order.length
                              })}
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => setIsWidgetCenterOpen(false)}
                              className={cn("px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest", theme.primary, "text-white")}
                            >
                              {t('home_widgets.done')}
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
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-4 ml-1", mutedText)}>{format(parseISO(date), i18n.language === 'zh-CN' ? 'MM月dd日 EEEE' : 'MMM dd EEEE', { locale: dateLocale })}</p>
                          <div className={cn("overflow-hidden", surfaceCard())}>
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
                      <p className={cn("text-sm font-black", isDarkUI ? "text-white" : "text-gray-900")}>{t('assets_dashboard.title')}</p>
                      <p className={cn("text-[10px] font-bold", mutedText)}>{t('assets_dashboard.subtitle')}</p>
                    </div>
                    <div className="w-10" />
                  </div>

                  <div className={cn("p-8", surfaceCard())}>
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.current_total_assets')}</p>
                        <p className="text-3xl font-black">¥{formatCurrency(totalAssets)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.net_assets')}</p>
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
                          <p className="text-lg font-black text-rose-500">¥{formatCurrency(assetDashboard.liabilities)}</p>
                        </div>
                        <div className={cn("p-4 rounded-2xl", surfaceCard("rounded-2xl"))}>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('assets_dashboard.net_assets')}</p>
                          <p className={cn("text-lg font-black", theme.text)}>¥{formatCurrency(assetDashboard.netAssets)}</p>
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
                          <Wallet size={24} className="text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-black tracking-tighter">{t('app_name_pro')}</h1>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('pro.monthly_report', { filter: getFilterLabel() })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase">{t('pro.only')}</p>
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
                      className={cn("p-8 relative overflow-hidden", surfaceCard())}
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <div className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">{t('pro.analysis_badge')}</div>
                      </div>
                      <h3 className="font-black text-lg mb-6 flex items-center"><TrendingUp size={20} className="mr-2 text-amber-500" />{t('spending_forecast')}</h3>
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", mutedText)}>{t('pro.forecast_estimated_month_total')}</p>
                          <p className="text-3xl font-black">¥{formatCurrency(stats.predictedTotal)}</p>
                        </div>
                        <div className={cn("text-right", stats.isOverBudgetRisk ? "text-red-500" : "text-green-500")}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t('pro.over_budget_risk')}</p>
                          <p className="text-lg font-black">{stats.isOverBudgetRisk ? t('pro.risk_high') : t('pro.risk_low')}</p>
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
                        {t('pro.forecast_desc', {
                          days: differenceInDays(new Date(), startOfMonth(currentDate)) + 1,
                          amount: formatCurrency(stats.predictedTotal),
                        })}{' '}
                        {stats.isOverBudgetRisk ? t('pro.forecast_advice_over') : t('pro.forecast_advice_ok')}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("p-8 relative overflow-hidden", surfaceCard())}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none" />
                      <h3 className="font-black text-lg mb-3 flex items-center"><TrendingUp size={20} className="mr-2 text-amber-500" />{t('spending_forecast')}</h3>
                      <p className={cn("text-sm font-bold leading-relaxed", mutedText)}>{t('pro.unlock_forecast')}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('pro.lab')}</div>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsProPaywallOpen(true)} className="px-4 py-2 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                          {t('pro.unlock_price')}
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
                      className={cn("p-8", surfaceCard())}
                    >
                      <h3 className="font-black text-lg mb-6 flex items-center"><PieIcon size={20} className="mr-2 text-indigo-500" />{t('spending_radar')}</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                            <PolarGrid stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v) => t(`categories.${v}`)} />
                            <Radar
                              name={t('month')}
                              dataKey="A"
                              stroke={accentHex}
                              fill={accentHex}
                              fillOpacity={0.6}
                            />
                            <Radar
                              name={t('last_month')}
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
                          <span className={cn("text-[10px] font-black", mutedText)}>{t('month')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-gray-300" />
                          <span className={cn("text-[10px] font-black", mutedText)}>{t('last_month')}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={cn("p-8 relative overflow-hidden", surfaceCard())}
                    >
                      <h3 className="font-black text-lg mb-3 flex items-center"><PieIcon size={20} className="mr-2 text-indigo-500" />{t('spending_radar')}</h3>
                      <p className={cn("text-sm font-bold leading-relaxed", mutedText)}>{t('pro.unlock_radar')}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('pro.visualization')}</div>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setIsProPaywallOpen(true)} className="px-4 py-2 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                          {t('pro.unlock_price')}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  <div className={cn("p-8", surfaceCard())}>
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
                      className={cn("px-8 py-4 rounded-full flex items-center space-x-3 shadow-xl active:scale-95 transition-all font-black", theme.primary, "text-white")}
                    >
                      <Share2 size={20} />
                      <span>{t('export_long_image')}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'discovery' && (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className={cn("p-6 overflow-hidden relative", surfaceCard())}>
                    <div className="absolute inset-0 backdrop-blur-2xl" />
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[90px] opacity-40 bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={cn("w-14 h-14 rounded-[1.5rem] border backdrop-blur-xl flex items-center justify-center", isBlackGold ? "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]" : "bg-white/30 border-white/30")}>
                          <User size={24} className={cn(isBlackGold ? "text-[#D4AF37]" : (isDarkMode ? "text-white" : "text-gray-800"))} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-gray-900")}>{t('user_title')}</p>
                            {isProMember && (
                              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                                <Star size={10} fill="currentColor" />
                                <span className="text-[8px] font-black uppercase tracking-widest">PRO</span>
                              </div>
                            )}
                          </div>
                          <p className={cn("text-[10px] font-bold mt-1", mutedText)}>
                            {t(`greeting.${timeContext}`)}{i18n.language === 'zh-CN' ? '，' : ', '}{t('greeting.welcome_back')}
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
                              "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]"
                            )}
                          >
                            {t('upgrade_pro')}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDiscoveryTool('groupSaving')}
                    className={cn(
                      "w-full rounded-[2.5rem] p-6 border shadow-sm overflow-hidden relative text-left",
                      "lux-carbon border-[#2A2A2A] text-[#F5F5F5]"
                    )}
                  >
                    <div className="absolute inset-0 backdrop-blur-2xl" />
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[110px] opacity-35 bg-[#D4AF37]/25" />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-[120px] opacity-25 bg-[#D4AF37]/20" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={cn("w-12 h-12 rounded-[1.5rem] border flex items-center justify-center shadow-sm", isBlackGold ? "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]" : "bg-white/30 border-white/30 text-white")}>
                          <Users size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black">{t('group_card_title')}</div>
                          <div className="text-[10px] font-bold mt-1 text-[#F5F5F5]/60">
                            {groupSaving ? t('group_card_joined', { name: groupSaving.name, code: groupSaving.code }) : t('group_saving_subtitle')}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center space-x-2",
                        groupSaving
                          ? "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]"
                          : "lux-gold border-[#D4AF37] text-black shadow-lg"
                      )}>
                        <Users size={14} />
                        <span>{groupSaving ? t('enter') : t('start_now')}</span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Quick Tools Grid */}
                  <div className={cn("p-6", surfaceCard())}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-black">{t('common_tools')}</h3>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", mutedText)}>{t('toolkit_tag')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'assets', label: t('assets'), Icon: LineIcon, onClick: () => setActiveTab('assets') },
                        { key: 'groupSaving', label: t('group_saving_title'), Icon: Users, onClick: () => setDiscoveryTool('groupSaving') },
                        { key: 'budget', label: t('settings'), Icon: Settings, onClick: () => setIsBudgetModalOpen(true) },
                        { key: 'export', label: t('export'), Icon: Share2, onClick: () => requestExport('image') },
                        { key: 'categories', label: t('categories_manage'), Icon: Hash, onClick: () => setDiscoveryTool('categories') },
                        { key: 'fx', label: t('exchange'), Icon: ArrowRightLeft, onClick: () => setDiscoveryTool('exchange') },
                        { key: 'calc', label: t('calculator'), Icon: Calculator, onClick: () => setDiscoveryTool('calculator') },
                      ].map(item => (
                        <motion.button
                          key={item.key}
                          whileTap={{ scale: 0.96 }}
                          onClick={item.onClick}
                          className={cn(
                            "p-4 rounded-[1.75rem] border flex flex-col items-center justify-center space-y-2 transition-all",
                            "lux-carbon border-[#2A2A2A]"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center border",
                            "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]"
                          )}>
                            <item.Icon size={18} />
                          </div>
                          <span className={cn("text-[10px] font-black", isBlackGold ? "text-[#F5F5F5]" : isDarkMode ? "text-white/80" : "text-gray-700")}>{item.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Pro Perks */}
                  <div className={cn("p-6 overflow-hidden relative", surfaceCard())}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-black">{t('pro.perks_title')}</h3>
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
                        {isProMember ? t('pro.unlocked') : t('pro.lifetime')}
                      </motion.button>
                    </div>

                    <div className={cn("space-y-3", !isProMember && "opacity-60")}>
                      <div className={cn("p-4 rounded-[1.75rem] border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border", "lux-carbon border-[#2A2A2A]")}>
                            <Sparkles size={18} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <p className="text-xs font-black">{t('pro.perk_skin.label')}</p>
                            <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('pro.perk_skin.desc')}</p>
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
                            <p className="text-xs font-black">{t('pro.perk_export.label')}</p>
                            <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('pro.perk_export.desc')}</p>
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
                            <p className="text-xs font-black">{t('pro.perk_lab.label')}</p>
                            <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('pro.perk_lab.desc')}</p>
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
                            <p className="text-xs font-black">{t('pro.perk_badge.label')}</p>
                            <p className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('pro.perk_badge.desc')}</p>
                          </div>
                        </div>
                        {!isProMember && <Lock size={16} className={cn(isDarkMode ? "text-white/40" : "text-gray-400")} />}
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('theme')}</span>
                        <span className={cn("text-[10px] font-black", isDarkMode ? "text-white/40" : "text-gray-400")}>{t('locked')}</span>
                      </div>
                      <div className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border text-center shadow-lg", theme.primary)}>
                        {t('black_gold')}
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('export_section')}</span>
                        {!isProMember && (
                          <span className={cn("text-[10px] font-black", isDarkMode ? "text-white/40" : "text-gray-400")}>{t('remaining_times', { count: remainingFreeExports })}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => requestExport('image')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-700")}>
                          {t('export_image')}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => requestExport('csv')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-700")}>
                          {t('export_excel')}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => requestExport('pdf')} className={cn("py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-700")}>
                          {t('export_pdf')}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Finance Management Card */}
                  <div className={cn("p-6 overflow-hidden relative", surfaceCard())}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-sm">{t('finance_management')}</h3>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/40" : "text-gray-400")}>
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
                        <div className="mt-4 w-full h-2 rounded-full overflow-hidden bg-gray-100/60 dark:bg-slate-700/60">
                          <div
                            className={cn("h-full rounded-full", stats.budgetUsage > 90 ? "bg-rose-500" : theme.primary)}
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
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-gray-400")}>{t('saving_tips')}</span>
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

              {activeTab === 'vault' && (
                <div className="space-y-[clamp(1rem,2.5vw,1.5rem)] pb-[clamp(2.5rem,6vw,3.25rem)]">
                  <div className={cn("p-[clamp(1.25rem,3vw,2rem)] overflow-hidden relative", surfaceCard())}>
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[120px] opacity-35 bg-[#D4AF37]/25" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-[140px] opacity-20 bg-white/10" />

                    <div className="relative flex flex-col gap-[clamp(0.5rem,1.5vw,0.75rem)] sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-black text-[clamp(1.125rem,2.8vw,1.25rem)] flex items-center">
                        <Vault size={20} className={cn("mr-2", isDarkMode ? "text-[#D4AF37]" : "text-amber-500")} />
                        {t('vault')}
                      </h3>
                      <div className={cn("text-[0.625rem] font-black uppercase tracking-widest", mutedText)}>{t('total_assets')}</div>
                    </div>

                    <div className="relative mt-[clamp(1rem,3vw,1.5rem)] flex flex-col gap-[clamp(0.75rem,2vw,1rem)] sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-black tracking-tight text-[clamp(1.75rem,5vw,2.25rem)] break-words">¥{formatCurrency(totalAssets)}</div>
                        <div className={cn("mt-[clamp(0.25rem,1vw,0.5rem)] text-[0.625rem] font-bold", mutedText)}>{t('assets_dashboard.subtitle')}</div>
                      </div>
                      <div className={cn("px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.4rem,1.2vw,0.5rem)] rounded-2xl border text-[0.625rem] font-black uppercase tracking-widest shrink-0", "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]")}>
                        {t('black_gold')}
                      </div>
                    </div>

                    <div className="relative mt-[clamp(1.25rem,4vw,2rem)] flex justify-center">
                      <div className="fixed inset-0 pointer-events-none z-[120]">
                        <AnimatePresence>
                          {vaultCoins.map(c => (
                            <GoldCoin
                              key={c.id}
                              coinId={c.id}
                              seed={c.seed}
                              onRest={(id) => setVaultCoins(prev => prev.filter(x => x.id !== id))}
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      {(() => {
                        const pilePct = clamp(10 + vaultFillPct * 72, 10, 84);
                        return (
                          <motion.div
                            initial={{ y: "-100%", opacity: 0, rotate: -3, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="relative w-[clamp(12rem,62vw,16rem)] aspect-square max-w-full will-change-transform"
                            style={{ transform: "translate3d(0,0,0)" }}
                          >
                            <motion.div
                              key={vaultGlowTick}
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                boxShadow: [
                                  "0 0 0 rgba(212,175,55,0)",
                                  "0 0 34px rgba(212,175,55,0.22)",
                                  "0 0 0 rgba(212,175,55,0)",
                                ],
                              }}
                              transition={{ duration: 0.9, ease: "easeInOut" }}
                              className="absolute -inset-[clamp(0.3rem,1vw,0.75rem)] rounded-[3.6rem] pointer-events-none"
                              style={{ transform: "translate3d(0,0,0)" }}
                            />

                            <div
                              ref={vaultJarRef}
                              className="absolute inset-0 rounded-[3.2rem] bg-gradient-to-br from-[#D4AF37]/55 via-[#D4AF37]/12 to-white/5 p-[0.08rem]"
                              style={{ transform: "translate3d(0,0,0)", perspective: "900px" }}
                            >
                              <div className="relative w-full h-full rounded-[3.15rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl">
                                <motion.div
                                  aria-hidden
                                  className="absolute inset-0 opacity-65"
                                  style={{
                                    backgroundImage:
                                      "linear-gradient(120deg, transparent 0%, rgba(212,175,55,0.18) 18%, rgba(255,255,255,0.14) 26%, transparent 40%)",
                                    transform: "translateX(-40%)",
                                  }}
                                  animate={{ transform: ["translateX(-40%)", "translateX(40%)"] }}
                                  transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/35 pointer-events-none" />

                                <div className="absolute inset-x-[10%] top-[12%] h-[16%] rounded-[1.9rem] bg-black/35 border border-white/10" />
                                <div className="absolute inset-x-[6%] top-[28%] bottom-[12%] rounded-[2.8rem] bg-black/25 border border-white/10 overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 via-transparent to-black/35" />
                                </div>

                                <motion.div
                                  className="absolute left-[8%] right-[8%] bottom-[10%] rounded-[2.6rem] overflow-hidden"
                                  initial={{ height: "10%" }}
                                  animate={{ height: `${pilePct}%` }}
                                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                  style={{
                                    backgroundImage:
                                      "radial-gradient(circle at 24% 30%, rgba(255,255,255,0.20), transparent 42%), radial-gradient(circle at 64% 38%, rgba(255,255,255,0.12), transparent 46%), radial-gradient(circle at 42% 68%, rgba(255,255,255,0.10), transparent 50%), linear-gradient(180deg, rgba(212,175,55,0.85) 0%, rgba(212,175,55,0.55) 55%, rgba(0,0,0,0.15) 100%)",
                                    transform: "translate3d(0,0,0)",
                                  }}
                                >
                                  <motion.div
                                    className="absolute inset-0"
                                    animate={{ opacity: [0.35, 0.6, 0.35] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                    style={{
                                      backgroundImage:
                                        "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 78% 36%, rgba(255,255,255,0.14), transparent 52%)",
                                      mixBlendMode: "screen",
                                    }}
                                  />
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
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

              <h2 className="text-white text-2xl font-black mb-2 tracking-tight">{t('voice.title')}</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">{t('voice.listening')}</p>

              <div className="w-full space-y-6">
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
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-6 text-white text-center text-lg font-bold focus:outline-none focus:ring-4 ring-indigo-500/20 transition-all placeholder:text-white/20"
                  />
                  {voiceText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md"
                    >
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{t('voice.parse_result')}</p>
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
                        {t('voice.confirm_post')}
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
              "w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border",
              "lux-carbon border-[#2A2A2A] text-[#F5F5F5]"
            )}
          >
            <div className="absolute inset-0 backdrop-blur-2xl -z-10" />

            {/* Close button for mobile accessibility */}
            <button
              onClick={() => { setIsModalOpen(false); setEditingTransaction(null); }}
              className={cn(
                "absolute top-6 right-6 p-2 rounded-full transition-all active:scale-90 z-10",
                "lux-carbon-soft border border-[#2A2A2A] text-[#D4AF37]"
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
                groupSaving={groupSaving}
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
                "w-full max-w-md rounded-b-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border",
                "lux-carbon border-[#2A2A2A] text-[#F5F5F5]"
              )}
            >
              <div className="absolute inset-0 backdrop-blur-2xl -z-10" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">{t('search_title')}</h2>
                <button onClick={() => { setIsSearchModalOpen(false); setSearchQuery(''); }} className={cn("p-2 rounded-full border", "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]")}>
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F5F5]/45" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl font-bold focus:outline-none transition-all",
                    "lux-carbon-soft border border-[#2A2A2A] text-[#F5F5F5] placeholder:text-[#F5F5F5]/35"
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
                    <User className="text-white" size={28} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="text-white" size={10} fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-black text-white">{t('user_nickname')}</p>
                      <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-full font-black text-white">PRO</span>
                    </div>
                    <p className={cn("text-[10px] font-bold", "text-white/60")}>{t('settings_pro_active')}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className={cn("flex-1 py-2 bg-white/10 rounded-xl text-[8px] font-black uppercase text-center backdrop-blur-sm", "text-white")}>
                    {t('settings_syncing')}
                  </div>
                  <div className={cn("flex-1 py-2 bg-white/20 rounded-xl text-[8px] font-black uppercase text-center backdrop-blur-sm", "text-white")}>
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
                    <button onClick={exportBackup} className="w-full p-5 flex items-center justify-between hover:bg-black/5 active:scale-[0.98] transition-all border-b border-black/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-500 rounded-lg flex items-center justify-center">
                          <Share2 size={18} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{t('backup_export')}</div>
                          <div className={cn("text-[10px] font-bold", isDarkMode ? "text-white/40" : "text-gray-400")}>{t('backup_export_desc')}</div>
                        </div>
                      </div>
                      <ChevronRight size={18} className={cn(isDarkMode ? "text-white/30" : "text-black/20")} />
                    </button>
                    <button onClick={triggerBackupImport} className="w-full p-5 flex items-center justify-between hover:bg-black/5 active:scale-[0.98] transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-sky-100 text-sky-500 rounded-lg flex items-center justify-center">
                          <Cloud size={18} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{t('backup_import')}</div>
                          <div className={cn("text-[10px] font-bold", isDarkMode ? "text-white/40" : "text-gray-400")}>{t('backup_import_desc')}</div>
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
                    <button onClick={() => setIsLangPickerOpen(true)} className="w-full p-5 flex items-center justify-between hover:bg-black/5 active:scale-[0.98] transition-all border-b border-black/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-500 rounded-lg flex items-center justify-center">
                          <Languages size={18} />
                        </div>
                        <span className="text-sm font-bold">{t('language')}</span>
                      </div>
                      <span className="text-xs font-black opacity-40">{i18n.language}</span>
                    </button>
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded-lg flex items-center justify-center">
                          <Moon size={18} />
                        </div>
                        <span className="text-sm font-bold">{t('black_gold_mode')}</span>
                      </div>
                      <span className="text-[10px] font-black opacity-40">{t('settings_active')}</span>
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
                    <span className="text-sm font-black text-rose-500">{t('logout')}</span>
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
                "lux-carbon border-[#2A2A2A] text-[#F5F5F5]"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">
                  {discoveryTool === 'groupSaving' ? t('group_saving_title') : discoveryTool === 'categories' ? t('categories_manage') : discoveryTool === 'exchange' ? t('exchange') : t('calculator')}
                </h3>
                <button onClick={() => setDiscoveryTool(null)} className={cn("p-2 rounded-full border", "lux-carbon-soft border-[#2A2A2A] text-[#D4AF37]")}>
                  <X size={18} />
                </button>
              </div>

              {discoveryTool === 'groupSaving' && (
                <div className="space-y-5">
                  {!groupSaving ? (
                    <>
                      <div className={cn("p-5 rounded-[2rem] border", "lux-carbon-soft border-[#2A2A2A]")}>
                        <div className="text-sm font-black mb-2">{t('group.create_title')}</div>
                        <div className="text-[10px] font-bold mb-4 text-[#F5F5F5]/60">
                          {t('group.create_desc')}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            value={groupDraftName}
                            onChange={(e) => setGroupDraftName(e.target.value)}
                            placeholder={t('group.create_placeholder')}
                            className={cn("flex-1 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none border", "lux-carbon border-[#2A2A2A] text-[#F5F5F5] placeholder:text-[#F5F5F5]/35")}
                          />
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => createGroupSaving(groupDraftName)}
                            className={cn("px-5 py-3 rounded-2xl text-xs font-black shadow-lg", "lux-gold border border-[#D4AF37] text-black")}
                          >
                            {t('group.create')}
                          </motion.button>
                        </div>
                      </div>

                      <div className={cn("p-5 rounded-[2rem] border", "lux-carbon-soft border-[#2A2A2A]")}>
                        <div className="text-sm font-black mb-2">{t('group.join_title')}</div>
                        <div className="text-[10px] font-bold mb-4 text-[#F5F5F5]/60">
                          {t('group.join_desc')}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            value={groupJoinCode}
                            onChange={(e) => setGroupJoinCode(e.target.value.toUpperCase())}
                            placeholder={t('group.join_placeholder')}
                            className={cn("flex-1 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none tracking-widest uppercase border", "lux-carbon border-[#2A2A2A] text-[#F5F5F5] placeholder:text-[#F5F5F5]/35")}
                          />
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => joinGroupSaving(groupJoinCode)}
                            className={cn("px-5 py-3 rounded-2xl text-xs font-black shadow-lg", "lux-carbon-soft border border-[#2A2A2A] text-[#D4AF37]")}
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
                        "lux-carbon-soft border-[#2A2A2A]"
                      )}>
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[110px] opacity-35 bg-[#D4AF37]/25" />
                        <div className="relative">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <div className="text-lg font-black">{groupSaving.name}</div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-xl border", "lux-carbon border-[#2A2A2A] text-[#D4AF37]")}>
                                  {groupSaving.code}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold mt-2 text-[#F5F5F5]/60">
                                {t('group.record_tip')}
                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={leaveGroupSaving}
                              className={cn("px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border", "lux-carbon border-[#2A2A2A] text-[#F5F5F5]/70")}
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
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#F5F5F5]/50">
                              {t('group.members', { count: groupSaving.members.length })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={cn("p-6 rounded-[2.25rem] border", "lux-carbon-soft border-[#2A2A2A]")}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm font-black">{t('group.public_pool')}</div>
                            <div className="text-[10px] font-bold mt-1 text-[#F5F5F5]/60">{t('group.pool_desc')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('group.used')}</div>
                            <div className="text-sm font-black">¥{formatCurrency(groupMonthPoolSpent)}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <input
                            type="number"
                            value={groupSaving.publicBudget}
                            onChange={(e) => updateGroupSaving({ publicBudget: Number(e.target.value) || 0 })}
                            className={cn("flex-1 px-4 py-3 rounded-2xl text-xs font-black focus:outline-none border", "lux-carbon border-[#2A2A2A] text-[#F5F5F5]")}
                          />
                          <div className={cn("px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border", "lux-carbon-soft border-[#2A2A2A] text-[#F5F5F5]/60")}>
                            {t('group.month_budget')}
                          </div>
                        </div>

                        <div className={cn("w-full h-3 rounded-full overflow-hidden", "bg-white/10")}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${groupMonthProgressPct}%` }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className={cn("h-full", groupMonthProgressPct > 90 ? "bg-rose-500" : theme.primary)}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#F5F5F5]/50">{t('group.progress')}</div>
                          <div className="text-[10px] font-black">{groupMonthProgressPct.toFixed(0)}%</div>
                        </div>
                      </div>

                      <div className={cn("p-6 rounded-[2.25rem] border", "lux-carbon-soft border-[#2A2A2A]")}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-black">{t('group.saving_wall')}</div>
                            <div className="text-[10px] font-bold mt-1 text-[#F5F5F5]/60">{t('group.saved_this_week')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#D4AF37]">¥{formatCurrency(groupWeekSaved)}</div>
                            <div className="text-[10px] font-bold text-[#F5F5F5]/45">{t('group.week_pool_spent', { amount: formatCurrency(groupWeekPoolSpent) })}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="text-sm font-black">{t('group.feed')}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#F5F5F5]/50">{t('live')}</div>
                        </div>

                        {groupActivities.length === 0 ? (
                          <div className={cn("p-6 rounded-[2rem] border text-center", "lux-carbon-soft border-[#2A2A2A] text-[#F5F5F5]/65")}>
                            <div className="text-sm font-black mb-2">{t('group.empty_title')}</div>
                            <div className="text-[10px] font-bold opacity-70">{t('group.empty_desc')}</div>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[42vh] overflow-y-auto no-scrollbar pr-1">
                            {groupActivities.map((a) => (
                              <div key={a.id} className={cn("p-4 rounded-2xl border", "lux-carbon-soft border-[#2A2A2A]")}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-xs font-black">
                                      {a.actorId === localUserId ? t('user_title') : a.actorName}
                                      <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-[#F5F5F5]/50">
                                        {t(`group.action.${a.action}`)}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold mt-2 text-[#F5F5F5]/75">
                                      {t(`categories.${a.category}`)} · {a.type === 'expense' ? '-' : '+'}¥{formatCurrency(a.amount)}
                                      {a.toGroupPool && <span className="ml-2 text-[#D4AF37] font-black">{t('group.pool_tag')}</span>}
                                    </div>
                                    {a.note && (
                                      <div className="text-[10px] font-bold mt-1 text-[#F5F5F5]/45">
                                        {a.note}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-[#F5F5F5]/45">
                                    {format(new Date(a.ts), i18n.language === 'zh-CN' ? 'MM-dd HH:mm' : 'MMM dd HH:mm', { locale: dateLocale })}
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center space-x-2">
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => toggleGroupReaction(a.id, 'like')}
                                    className={cn(
                                      "px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                      a.likes.includes(localUserId)
                                        ? "lux-gold border-[#D4AF37] text-black"
                                        : "lux-carbon border-[#2A2A2A] text-[#F5F5F5]/70"
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
                                        : "lux-carbon border-[#2A2A2A] text-[#F5F5F5]/70"
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

              {discoveryTool === 'categories' && (
                <div className={cn("p-6 rounded-[2rem] border", isDarkMode ? "bg-slate-700/60 border-slate-600 text-white/70" : "bg-gray-50 border-gray-100 text-gray-600")}>
                  <p className="text-sm font-bold leading-relaxed">{t('categories_manage_placeholder')}</p>
                </div>
              )}

              {discoveryTool === 'exchange' && (
                <div className="space-y-3">
                  {[
                    { code: 'USD' },
                    { code: 'EUR' },
                    { code: 'JPY' },
                    { code: 'HKD' },
                  ].map(c => (
                    <div key={c.code} className={cn("p-4 rounded-2xl border flex items-center justify-between", isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-gray-50 border-gray-100")}>
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", isDarkMode ? "bg-slate-800/70 border-slate-600" : "bg-white border-white")}>
                          <Globe size={18} className={cn(isDarkMode ? "text-white" : "text-gray-800")} />
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
                        <p className="text-lg font-black">{t('pro.paywall_title')}</p>
                        <p className={cn("text-[10px] font-bold mt-1", isDarkMode ? "text-white/60" : "text-gray-500")}>{t('pro.paywall_subtitle')}</p>
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
                      { label: t('pro.perk_skin.label'), desc: t('pro.perk_skin.desc') },
                      { label: t('pro.perk_export.label'), desc: t('pro.perk_export.desc') },
                      { label: t('pro.perk_lab.label'), desc: t('pro.perk_lab.desc') },
                      { label: t('pro.perk_badge.label'), desc: t('pro.perk_badge.desc') },
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
                      {t('pro.free_export_limit', { used: exportCount, left: remainingFreeExports })}
                    </p>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={purchasePro}
                    className="py-4 rounded-2xl font-black text-xs bg-amber-500 text-black shadow-lg transition-all"
                  >
                    {t('pro.buy_now')}
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
                <h3 className="text-lg font-black">{t('logout_confirm_title')}</h3>
                <p className={cn("mt-2 text-xs font-bold", isDarkMode ? "text-white/50" : "text-gray-500")}>{t('logout_confirm_body')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className={cn(
                    "py-4 rounded-2xl font-black text-xs active:scale-95 transition-all border",
                    isDarkMode ? "bg-slate-700 border-slate-600 text-white/80" : "bg-gray-50 border-gray-100 text-gray-600"
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
                  { id: 'zh-CN', label: t('langs.zh-CN'), flag: '🇨🇳' },
                  { id: 'en-US', label: t('langs.en-US'), flag: '🇺🇸' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { localStorage.setItem('app_lang', l.id); i18n.changeLanguage(l.id); setIsLangPickerOpen(false); }}
                    className={cn(
                      "w-full p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all border",
                      i18n.language === l.id ? cn(theme.primary, "text-white", "border-transparent") : "lux-carbon-soft border-[#2A2A2A] text-[#F5F5F5]/80 hover:bg-white/5"
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
              <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black">{t('filter_dimension')}</h2><button onClick={() => setIsFilterModalOpen(false)} className="p-3 bg-gray-100 rounded-full"><X size={20} /></button></div>
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
        "fixed bottom-0 left-0 right-0 z-[100] px-[clamp(1rem,3vw,1.5rem)] pb-[calc(clamp(1rem,2.5vw,1.5rem)+env(safe-area-inset-bottom))] pt-[clamp(0.75rem,2vw,1rem)] backdrop-blur-xl border-t border-white/5 shadow-2xl transition-all duration-500",
        isDarkMode ? "bg-slate-900/80" : "bg-white/80"
      )}>
        <div className="flex justify-between items-center max-w-lg mx-auto relative">
          {[
            { id: 'list', icon: <History size={22} />, label: t('bill_detail') },
            { id: 'chart', icon: <PieIcon size={22} />, label: t('stats') },
            { id: 'plus', icon: null, label: '' }, // Placeholder for the big plus
            { id: 'vault', icon: <Vault size={22} />, label: t('vault') },
            { id: 'discovery', icon: <Compass size={22} />, label: t('discovery') },
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
                      "text-white"
                    )}
                  >
                    <Plus size={32} strokeWidth={3} />
                  </motion.button>
                  <span className="absolute -bottom-6 text-[0.5rem] font-black uppercase tracking-tighter text-gray-400">{t('add_bill')}</span>
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
                <span className="text-[0.5rem] font-black uppercase tracking-tighter">{tab.label}</span>
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
  isDarkMode,
  groupSaving
}: {
  accounts: Account[],
  transactions: Transaction[],
  rates: Record<string, number>,
  onSubmit: (t: Omit<Transaction, 'id'>) => void,
  initialData?: Transaction,
  onDelete?: () => void,
  isDarkMode: boolean,
  groupSaving?: GroupSavingGroup | null
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
  const [visibility, setVisibility] = useState<'private' | 'group'>(initialData?.visibility || 'private');
  const [toGroupPool, setToGroupPool] = useState<boolean>(!!initialData?.toGroupPool);

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
    const finalVisibility = groupSaving ? visibility : 'private';
    const finalGroupId = finalVisibility === 'group' ? groupSaving?.id : undefined;
    const finalToGroupPool = finalVisibility === 'group' ? toGroupPool : false;
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
      exchangeRate: rates[currencyCode],
      visibility: finalVisibility,
      groupId: finalGroupId,
      toGroupPool: finalToGroupPool
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
                        <p className="text-[10px] opacity-60 font-bold">{t(`currencies.${c.code}`)}</p>
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
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('form.date')}</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")} required />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('form.account')}</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none appearance-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")}>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {t(`accounts.${acc.name}`)}</option>)}</select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 mb-2 block">{t('category_label')}</label>
          <select value={category} onChange={e => setCategory(e.target.value as Category)} className={cn("w-full p-4 rounded-2xl text-xs font-bold focus:outline-none appearance-none", isDarkMode ? "bg-slate-700 text-white" : "bg-gray-50 text-black")}>{CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {t(`categories.${c.label}`)}</option>)}</select>
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
            <div className={cn("text-[10px] font-bold", isDarkMode ? "text-white/60" : "text-gray-500")}>
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
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/60" : "text-gray-600")}>{t('form.join_pool')}</div>
                    <div className={cn("text-[10px] font-bold mt-1", isDarkMode ? "text-white/40" : "text-gray-400")}>{t('form.join_pool_desc')}</div>
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
      <div className="flex space-x-3 pt-4 pb-[env(safe-area-inset-bottom)]">
        {onDelete && <button type="button" onClick={onDelete} className="flex-1 py-5 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black text-sm active:scale-95 transition-all">{t('delete')}</button>}
        <button type="submit" className={cn("flex-[3] py-5 rounded-[2.5rem] font-black text-sm shadow-xl active:scale-95 transition-all", isDarkMode ? "bg-white text-black" : "bg-black text-white")}>{t('save_bill')}</button>
      </div>
    </form>
  );
}
