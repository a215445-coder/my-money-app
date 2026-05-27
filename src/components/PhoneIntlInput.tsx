import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  PHONE_COUNTRIES,
  type PhoneCountryId,
  buildLoginPhoneE164,
  defaultPhoneCountryForLanguage,
  getPhoneCountry,
} from './phoneCountries';
import { isValidNationalPhoneLength } from './phoneNationalLengthRules';

export function usePhoneIntlLogin() {
  const { i18n } = useTranslation();
  const [countryId, setCountryId] = useState<PhoneCountryId>(() =>
    defaultPhoneCountryForLanguage(i18n.language)
  );
  const [nationalNumber, setNationalNumber] = useState('');

  useEffect(() => {
    setCountryId(defaultPhoneCountryForLanguage(i18n.language));
  }, [i18n.language]);

  const getE164 = () => buildLoginPhoneE164(countryId, nationalNumber);

  const isNationalValid = () => isValidNationalPhoneLength(countryId, nationalNumber);

  return {
    countryId,
    setCountryId,
    nationalNumber,
    setNationalNumber,
    getE164,
    isNationalValid,
  };
}

type PhoneIntlFieldProps = {
  countryId: PhoneCountryId;
  nationalNumber: string;
  hasError?: boolean;
  onCountryChange: (id: PhoneCountryId) => void;
  onNationalChange: (value: string) => void;
  onBlurField?: () => void;
  onEnter?: () => void;
};

export default function PhoneIntlField({
  countryId,
  nationalNumber,
  hasError,
  onCountryChange,
  onNationalChange,
  onBlurField,
  onEnter,
}: PhoneIntlFieldProps) {
  const { t } = useTranslation();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = getPhoneCountry(countryId);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const ringClass = hasError
    ? 'border-red-300/80 ring-red-500/15'
    : 'border-zinc-100 ring-[#1D1D1F]/8 focus-within:border-zinc-200 focus-within:ring-[#1D1D1F]/12';

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex overflow-hidden rounded-2xl border bg-zinc-50/90 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] transition-shadow focus-within:ring-4 ${ringClass}`}
      >
        <button
          type="button"
          aria-expanded={pickerOpen}
          aria-haspopup="listbox"
          aria-controls={listId}
          onClick={() => setPickerOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 border-r border-zinc-100/90 px-3 py-4 text-left transition-colors hover:bg-white/80 active:bg-white"
        >
          <span className="text-lg leading-none" aria-hidden>
            {selected.flag}
          </span>
          <span className="text-[15px] font-black tabular-nums text-[#1D1D1F]">+{selected.dialCode}</span>
          <ChevronDown
            size={14}
            className={`text-[#AEAEB2] transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={t('login.phone_placeholder')}
          value={nationalNumber}
          onChange={(e) => {
            onNationalChange(e.target.value.replace(/[^\d\s-]/g, ''));
          }}
          onBlur={() => onBlurField?.()}
          onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
          className="min-w-0 flex-1 bg-transparent px-4 py-4 text-[15px] font-bold text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none"
        />
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t('login.country_picker_close')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[310] bg-black/20 backdrop-blur-[2px]"
              onClick={() => setPickerOpen(false)}
            />
            <motion.div
              id={listId}
              role="listbox"
              aria-label={t('login.country_picker_title')}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="phone-country-picker-scroll absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[320] max-h-[300px] overflow-y-auto overscroll-contain rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            >
              <p className="sticky top-0 z-[1] bg-white/95 px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#AEAEB2] backdrop-blur-sm">
                {t('login.country_picker_title')}
              </p>
              {PHONE_COUNTRIES.map((c) => {
                const on = c.id === countryId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onCountryChange(c.id);
                      setPickerOpen(false);
                      onBlurField?.();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      on ? 'bg-zinc-100' : 'hover:bg-zinc-100 active:bg-zinc-200'
                    }`}
                  >
                    <span className="text-xl leading-none">{c.flag}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#1D1D1F]">
                      {t(`login.countries.${c.id}`)}
                    </span>
                    <span className="text-sm font-black tabular-nums text-[#6E6E73]">+{c.dialCode}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
