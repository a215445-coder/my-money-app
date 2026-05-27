import i18n from './config';

export type AppLanguage = 'zh-CN' | 'en-US';

export function normalizeLanguage(input?: string | null): AppLanguage {
  const lng = (input || '').toString();
  if (lng.toLowerCase().startsWith('en')) return 'en-US';
  return 'zh-CN';
}

export function setAppLanguage(input: string) {
  const next = normalizeLanguage(input);
  if (i18n.language !== next) i18n.changeLanguage(next);
  try {
    localStorage.setItem('app_lang', next);
  } catch {
    // ignore storage failures (private mode / quota / sandbox)
  }
}

