import it from './it';
import en from './en';

export type Lang = 'it' | 'en';

const translations = { it, en } as const;

export function useTranslations(lang: Lang) {
  return translations[lang];
}

export function getLangFromPath(pathname: string): Lang {
  // Matches the /en segment only, so an unrelated path such as /enoteca
  // (which reaches us on the 404 route) is not mistaken for English.
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'it';
}

export function getLocalePath(lang: Lang, path: string): string {
  const base = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') return `/en${base}`;
  return base;
}

type CountableUnit = 'guests' | 'bedrooms' | 'bathrooms';

/**
 * Renders "1 camera" / "3 camere" (and the EN equivalents) instead of the
 * plural-only "1 camere". Used by every surface that prints apartment specs.
 */
export function pluralize(lang: Lang, count: number, unit: CountableUnit): string {
  const a = translations[lang].apartments;
  const forms: Record<CountableUnit, [one: string, many: string]> = {
    guests: [a.guestsOne, a.guests],
    bedrooms: [a.bedroomsOne, a.bedrooms],
    bathrooms: [a.bathroomsOne, a.bathrooms],
  };
  const [one, many] = forms[unit];
  return `${count} ${count === 1 ? one : many}`;
}

export function getAlternatePath(currentLang: Lang, currentPath: string): string {
  if (currentLang === 'en') {
    return currentPath.replace(/^\/en/, '') || '/';
  }
  return `/en${currentPath}`;
}
