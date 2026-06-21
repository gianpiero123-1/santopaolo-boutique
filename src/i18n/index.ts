import it from './it';
import en from './en';

export type Lang = 'it' | 'en';

const translations = { it, en } as const;

export function useTranslations(lang: Lang) {
  return translations[lang];
}

export function getLangFromPath(pathname: string): Lang {
  return pathname.startsWith('/en') ? 'en' : 'it';
}

export function getLocalePath(lang: Lang, path: string): string {
  const base = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') return `/en${base}`;
  return base;
}

export function getAlternatePath(currentLang: Lang, currentPath: string): string {
  if (currentLang === 'en') {
    return currentPath.replace(/^\/en/, '') || '/';
  }
  return `/en${currentPath}`;
}
