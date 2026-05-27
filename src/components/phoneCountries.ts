export const PHONE_COUNTRY_IDS = ['CN', 'HK', 'MO', 'TW', 'MY', 'SG', 'US'] as const;
export type PhoneCountryId = (typeof PHONE_COUNTRY_IDS)[number];

export type PhoneCountryOption = {
  id: PhoneCountryId;
  dialCode: string;
  flag: string;
};

export const PHONE_COUNTRIES: PhoneCountryOption[] = [
  { id: 'CN', dialCode: '86', flag: '🇨🇳' },
  { id: 'HK', dialCode: '852', flag: '🇭🇰' },
  { id: 'MO', dialCode: '853', flag: '🇲🇴' },
  { id: 'TW', dialCode: '886', flag: '🇹🇼' },
  { id: 'MY', dialCode: '60', flag: '🇲🇾' },
  { id: 'SG', dialCode: '65', flag: '🇸🇬' },
  { id: 'US', dialCode: '1', flag: '🇺🇸' },
];

export const DEFAULT_PHONE_COUNTRY: PhoneCountryId = 'CN';

export function defaultPhoneCountryForLanguage(lang: string): PhoneCountryId {
  const base = lang.split('-')[0]?.toLowerCase();
  if (base === 'zh') return 'CN';
  if (base === 'en') return 'US';
  return DEFAULT_PHONE_COUNTRY;
}

/** E.164 风格拼接，供登录校验与未来 API 复用 */
export function buildLoginPhoneE164(countryId: PhoneCountryId, nationalDigits: string): string {
  const country = PHONE_COUNTRIES.find((c) => c.id === countryId) ?? PHONE_COUNTRIES[0];
  const digits = nationalDigits.replace(/\D/g, '');
  return `+${country.dialCode}${digits}`;
}

export function getPhoneCountry(id: PhoneCountryId): PhoneCountryOption {
  return PHONE_COUNTRIES.find((c) => c.id === id) ?? PHONE_COUNTRIES[0];
}
