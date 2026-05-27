import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LoginScreenProps = {
  onAuthed: () => void;
  exiting?: boolean;
};

export default function LoginScreen({ onAuthed, exiting = false }: LoginScreenProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  const tryPhoneLogin = () => {
    const trimmed = phone.replace(/\s/g, '');
    if (trimmed.length < 6) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    onAuthed();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1, y: exiting ? -16 : 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-[300] overflow-hidden bg-zinc-50 text-[#1D1D1F] ${exiting ? 'pointer-events-none' : 'pointer-events-auto'}`}
      aria-hidden={exiting}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(167,139,250,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(96,165,250,0.08),transparent)]"
        aria-hidden
      />

      <div className="relative flex min-h-screen flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.35rem] bg-[#1D1D1F] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)]">
              <Wallet className="text-white" size={36} strokeWidth={2.2} />
            </div>
            <span className="mb-3 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              {t('login.brand_badge')}
            </span>
            <h1 className="text-[2rem] font-black leading-tight tracking-tight">{t('login.title')}</h1>
            <p className="mt-2 max-w-[18rem] text-sm font-semibold leading-relaxed text-[#6E6E73]">
              {t('login.subtitle')}
            </p>
          </div>

          <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-7 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.06)]">
            <div className="space-y-3">
              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t('login.phone_placeholder')}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && tryPhoneLogin()}
                  className={`w-full rounded-2xl border bg-zinc-50/90 px-5 py-4 text-[15px] font-bold text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-4 ${
                    phoneError
                      ? 'border-red-300/80 ring-red-500/15'
                      : 'border-zinc-100 ring-[#1D1D1F]/8 focus:border-zinc-200'
                  }`}
                />
                {phoneError && (
                  <p className="mt-2 px-1 text-xs font-bold text-red-500">{t('login.error_phone')}</p>
                )}
              </div>

              <button
                type="button"
                onClick={tryPhoneLogin}
                className="w-full rounded-2xl bg-[#1D1D1F] py-4 text-sm font-black text-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] transition-transform active:scale-[0.98]"
              >
                {t('login.phone_login')}
              </button>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={onAuthed}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 py-3.5 text-xs font-black text-[#1D1D1F] shadow-[0_6px_20px_-10px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.98]"
                >
                  {t('login.wechat_login')}
                </button>
                <button
                  type="button"
                  onClick={onAuthed}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 py-3.5 text-xs font-black text-[#1D1D1F] shadow-[0_6px_20px_-10px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.98]"
                >
                  {t('login.google_login')}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-xs text-center text-[10px] font-semibold leading-relaxed text-[#AEAEB2]">
            {t('login.continue_legal')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
