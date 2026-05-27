import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types';

export type AiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export type ParsedBillIntent = {
  amount: number;
  category: Category;
  note: string;
};

type AiBookkeepingChatProps = {
  open: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  formatMoney: (value: number) => string;
  trCategory: (category: string) => string;
  parseIntent: (text: string) => ParsedBillIntent;
  onRecordExpense: (parsed: ParsedBillIntent) => void;
};

export default function AiBookkeepingChat({
  open,
  onClose,
  isDarkMode,
  formatMoney,
  trCategory,
  parseIntent,
  onRecordExpense,
}: AiBookkeepingChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [micPulse, setMicPulse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: t('ai_bookkeeping.welcome'),
      },
    ]);
    setInput('');
    setIsThinking(false);
  }, [open, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current != null) window.clearTimeout(replyTimerRef.current);
    };
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    replyTimerRef.current = window.setTimeout(() => {
      const parsed = parseIntent(text);
      if (parsed.amount > 0) {
        onRecordExpense(parsed);
        const categoryLabel = trCategory(parsed.category);
        const amountLabel = formatMoney(parsed.amount);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: t('ai_bookkeeping.reply_success', {
              category: categoryLabel,
              amount: amountLabel,
            }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: t('ai_bookkeeping.reply_invalid'),
          },
        ]);
      }
      setIsThinking(false);
    }, 800);
  };

  const handleMicTap = () => {
    setMicPulse(true);
    window.setTimeout(() => setMicPulse(false), 280);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1300] flex flex-col justify-end sm:justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label={t('ai_bookkeeping.close_aria')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-bookkeeping-title"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex h-[min(88dvh,720px)] w-full flex-col overflow-hidden rounded-t-[2rem] border shadow-2xl sm:max-w-md sm:rounded-[2rem] ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/95 text-white'
                : 'border-white/80 bg-white/95 text-[#1D1D1F]'
            }`}
          >
            <header
              className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${
                isDarkMode ? 'border-slate-700' : 'border-zinc-100'
              }`}
            >
              <h2 id="ai-bookkeeping-title" className="text-base font-black tracking-tight">
                {t('ai_bookkeeping.title')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('ai_bookkeeping.close_aria')}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 ${
                  isDarkMode ? 'bg-slate-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                <X size={18} />
              </button>
            </header>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed break-words ${
                        isUser
                          ? 'rounded-br-md bg-[#1D1D1F] text-white'
                          : isDarkMode
                            ? 'rounded-bl-md bg-slate-800 text-zinc-100'
                            : 'rounded-bl-md bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {isThinking && (
                <div className="flex justify-start">
                  <div
                    className={`rounded-2xl rounded-bl-md px-4 py-3 text-xs font-bold ${
                      isDarkMode ? 'bg-slate-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {t('ai_bookkeeping.thinking')}
                  </div>
                </div>
              )}
            </div>

            <footer
              className={`shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 ${
                isDarkMode ? 'border-slate-700 bg-slate-900/90' : 'border-zinc-100 bg-white'
              }`}
            >
              <div
                className={`flex items-center gap-2 rounded-2xl border p-1.5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] ${
                  isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-zinc-100 bg-zinc-50'
                }`}
              >
                <button
                  type="button"
                  onClick={handleMicTap}
                  aria-label={t('ai_bookkeeping.voice_aria')}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 ${
                    micPulse ? 'scale-110 bg-indigo-500/20' : ''
                  } ${isDarkMode ? 'text-indigo-300' : 'text-indigo-500'}`}
                >
                  <Mic size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('ai_bookkeeping.input_placeholder')}
                  className={`min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-bold outline-none ${
                    isDarkMode
                      ? 'text-white placeholder:text-zinc-500'
                      : 'text-[#1D1D1F] placeholder:text-zinc-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  aria-label={t('ai_bookkeeping.send_aria')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D1D1F] text-white transition-all active:scale-95 disabled:opacity-40"
                >
                  <Send size={18} />
                </button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
