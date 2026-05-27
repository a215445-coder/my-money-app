import catalogJson from '../data/phoneCountryCatalog.json';

export type PhoneCountryCatalogEntry = {
  id: string;
  dialCode: string;
  flag: string;
  nameEn: string;
  nameZh: string;
  letter: string;
};

/** 已排序：中国置顶，其余按英文名 A-Z */
export const PHONE_COUNTRY_CATALOG = catalogJson as PhoneCountryCatalogEntry[];

export type PhoneCountryOption = {
  id: string;
  dialCode: string;
  flag: string;
  nameEn: string;
  letter: string;
};

export const PHONE_COUNTRIES: PhoneCountryOption[] = PHONE_COUNTRY_CATALOG.map(
  ({ id, dialCode, flag, nameEn, letter }) => ({ id, dialCode, flag, nameEn, letter })
);

export type PhoneCountryId = string;

export const DEFAULT_PHONE_COUNTRY: PhoneCountryId = 'CN';

const PHONE_COUNTRY_IDS = new Set(PHONE_COUNTRIES.map((c) => c.id));

export function isPhoneCountryId(id: string): id is PhoneCountryId {
  return PHONE_COUNTRY_IDS.has(id);
}

export function defaultPhoneCountryForLanguage(lang: string): PhoneCountryId {
  const base = lang.split('-')[0]?.toLowerCase();
  if (base === 'zh') return 'CN';
  if (base === 'en') return 'US';
  return DEFAULT_PHONE_COUNTRY;
}

export function buildLoginPhoneE164(countryId: PhoneCountryId, nationalDigits: string): string {
  const country = getPhoneCountry(countryId);
  const digits = nationalDigits.replace(/\D/g, '');
  return `+${country.dialCode}${digits}`;
}

export function getPhoneCountry(id: PhoneCountryId): PhoneCountryOption {
  return PHONE_COUNTRIES.find((c) => c.id === id) ?? PHONE_COUNTRIES[0];
}
