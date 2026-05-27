import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneIntlField, { usePhoneIntlLogin } from './PhoneIntlInput';
import type { PhoneCountryId } from './phoneCountries';
import { nationalPhoneDigits } from './phoneNationalLengthRules';
import AppleSignInButton from './login/AppleSignInButton';
import { GoogleIconButton, WeChatIconButton } from './login/SocialIconButton';
import {
  handleAppleSignIn,
  handleSendCaptcha,
  handleVerifyOtp,
} from '../utils/loginAuth';

type LoginScreenProps = {
  onAuthed: () => void;
  onNotify?: (message: string) => void;
  exiting?: boolean;
};

const CAPTCHA_COOLDOWN_SEC = 60;
const LOGIN_BTN_RADIUS = 'rounded-2xl';

export default function LoginScreen({
  onAuthed,
  onNotify,
  exiting = false,
}: LoginScreenProps) {
  const { t } = useTranslation();
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaCooldown, setCaptchaCooldown] = useState(0);
  const [appleLoading, setAppleLoading] = useState(false);
  const [phoneLoginLoading, setPhoneLoginLoading] = useState(false);
  const [captchaSending, setCaptchaSending] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phoneIntl = usePhoneIntlLogin();

  const showPhoneError =
    (phoneTouched || submitAttempted) && !phoneIntl.isNationalValid();

  const clearCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current !== null) {
      window.clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const startCaptchaCooldown = useCallback(() => {
    clearCooldownTimer();
    setCaptchaCooldown(CAPTCHA_COOLDOWN_SEC);
    cooldownTimerRef.current = window.setInterval(() => {
      setCaptchaCooldown((prev) => {
        if (prev <= 1) {
          clearCooldownTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCooldownTimer]);

  useEffect(() => () => clearCooldownTimer(), [clearCooldownTimer]);

  const onSendCaptchaClick = useCallback(async () => {
    if (captchaCooldown > 0 || captchaSending) return;

    setPhoneTouched(true);
    if (!phoneIntl.isNationalValid()) {
      onNotify?.(t('login.error_phone'));
      return;
    }

    const phoneE164 = phoneIntl.getE164();
    setCaptchaSending(true);
    try {
      const result = await handleSendCaptcha(phoneE164);
      if (result.success) {
        startCaptchaCooldown();
        onNotify?.(t('login.captcha_sent'));
      } else {
        onNotify?.(result.message);
      }
    } finally {
      setCaptchaSending(false);
    }
  }, [captchaCooldown, captchaSending, onNotify, phoneIntl, startCaptchaCooldown, t]);

  const onAppleSignInClick = useCallback(async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    try {
      const result = await handleAppleSignIn();
      if (!result.success) {
        onNotify?.(result.message);
        setAppleLoading(false);
      }
    } catch {
      onNotify?.(t('login.error_apple'));
      setAppleLoading(false);
    }
  }, [appleLoading, onNotify, t]);

  const handleNationalChange = (value: string) => {
    phoneIntl.setNationalNumber(value);
    if (nationalPhoneDigits(value).length > 0) {
      setPhoneTouched(true);
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
  };

  const handleCountryChange = (id: PhoneCountryId) => {
    phoneIntl.setCountryId(id);
    if (phoneTouched || nationalPhoneDigits(phoneIntl.nationalNumber).length > 0) {
      setPhoneTouched(true);
    }
  };

  const tryPhoneLogin = useCallback(async () => {
    setSubmitAttempted(true);
    setPhoneTouched(true);

    if (!phoneIntl.isNationalValid()) {
      return;
    }

    if (captchaCode.trim().length < 4) {
      onNotify?.(t('login.error_captcha'));
      return;
    }

    const phoneE164 = phoneIntl.getE164();
    setPhoneLoginLoading(true);
    try {
      const result = await handleVerifyOtp(phoneE164, captchaCode.trim());
      if (result.success) {
        sessionStorage.setItem('login_phone_e164', phoneE164);
        onAuthed();
        return;
      }
      onNotify?.(t('login.error_captcha'));
    } finally {
      setPhoneLoginLoading(false);
    }
  }, [captchaCode, onAuthed, onNotify, phoneIntl, t]);

  const captchaBtnDisabled = captchaCooldown > 0 || captchaSending;

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
                <PhoneIntlField
                  countryId={phoneIntl.countryId}
                  nationalNumber={phoneIntl.nationalNumber}
                  hasError={showPhoneError}
                  onCountryChange={handleCountryChange}
                  onNationalChange={handleNationalChange}
                  onBlurField={handlePhoneBlur}
                  onEnter={() => void tryPhoneLogin()}
                />
                <AnimatePresence>
                  {showPhoneError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 px-1 text-xs font-bold text-red-500"
                      role="alert"
                    >
                      {t('login.error_phone')}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder={t('login.captcha_placeholder')}
                  value={captchaCode}
                  onChange={(e) => setCaptchaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`min-w-0 flex-1 border border-zinc-100 bg-zinc-50/90 px-4 py-4 text-[15px] font-bold text-[#1D1D1F] placeholder:text-[#AEAEB2] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] focus:border-zinc-200 focus:outline-none focus:ring-4 focus:ring-[#1D1D1F]/8 ${LOGIN_BTN_RADIUS}`}
                />
                <button
                  type="button"
                  disabled={captchaBtnDisabled}
                  onClick={() => void onSendCaptchaClick()}
                  className={`shrink-0 px-3.5 py-4 text-[12px] font-black whitespace-nowrap transition-all active:scale-[0.98] disabled:cursor-not-allowed ${LOGIN_BTN_RADIUS} ${
                    captchaBtnDisabled
                      ? 'bg-zinc-200 text-[#AEAEB2]'
                      : 'bg-[#1D1D1F] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]'
                  }`}
                >
                  {captchaSending ? (
                    <Loader2 size={16} className="mx-auto animate-spin" aria-hidden />
                  ) : captchaCooldown > 0 ? (
                    t('login.captcha_retry', { seconds: captchaCooldown })
                  ) : (
                    t('login.send_captcha')
                  )}
                </button>
              </div>

              <button
                type="button"
                disabled={phoneLoginLoading}
                onClick={() => void tryPhoneLogin()}
                className={`flex w-full items-center justify-center gap-2 ${LOGIN_BTN_RADIUS} bg-[#1D1D1F] py-4 text-sm font-black text-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] transition-transform active:scale-[0.98] disabled:opacity-80`}
              >
                {phoneLoginLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                    <span>{t('login.verifying')}</span>
                  </>
                ) : (
                  t('login.phone_login')
                )}
              </button>

              <div className="flex items-center gap-3 pt-1">
                <span className="h-px flex-1 bg-zinc-100" aria-hidden />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AEAEB2]">
                  {t('login.or_continue_with')}
                </span>
                <span className="h-px flex-1 bg-zinc-100" aria-hidden />
              </div>

              <AppleSignInButton
                label={t('login.sign_in_with_apple')}
                loadingLabel={t('login.apple_signing_in')}
                loading={appleLoading}
                onClick={() => void onAppleSignInClick()}
              />

              <div className="flex items-center justify-center gap-4 pt-0.5">
                <WeChatIconButton
                  label={t('login.wechat_login')}
                  onClick={onAuthed}
                />
                <GoogleIconButton
                  label={t('login.google_login')}
                  onClick={onAuthed}
                />
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
