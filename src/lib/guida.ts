import type { Lang } from '../i18n/index';
import { getGuidePath } from '../i18n/index';

/** Cluster keys in the order the hub renders them. */
export const CLUSTER_ORDER = [
  'parcheggio',
  'chiaia',
  'arrivo',
  'gruppi',
  'wellness',
  'napoli',
  'business',
  'diretta',
] as const;

export type Cluster = (typeof CLUSTER_ORDER)[number];

export const CLUSTER_LABELS: Record<Cluster, Record<Lang, string>> = {
  parcheggio: { it: 'Parcheggio e ZTL', en: 'Parking and ZTL' },
  chiaia: { it: 'Chiaia', en: 'Chiaia' },
  arrivo: { it: 'Arrivare e muoversi', en: 'Getting here' },
  gruppi: { it: 'Gruppi e soggiorni lunghi', en: 'Groups and long stays' },
  wellness: { it: 'Wellness', en: 'Wellness' },
  napoli: { it: 'Napoli pratico', en: 'Practical Naples' },
  business: { it: 'Business e produzione', en: 'Business and production' },
  diretta: { it: 'Prenotazione diretta', en: 'Direct booking' },
};

/**
 * UI copy used only by the guide pages and components. Lives here rather than
 * in the i18n dictionaries to keep the guide self-contained; the footer link
 * label is the one string that goes through the usual translations.
 */
export const GUIDE_COPY: Record<
  Lang,
  {
    hubTitle: string;
    hubIntro: string;
    hubDescription: string;
    related: string;
    updated: string;
    fromGuide: string;
    breadcrumbLabel: string;
  }
> = {
  it: {
    hubTitle: 'Guida',
    hubIntro:
      'Risposte pratiche alle domande di chi soggiorna a Chiaia: parcheggio, quartiere, arrivo, wellness e prenotazione. Ogni articolo parte da una domanda e risponde subito.',
    hubDescription:
      'Guida pratica per chi soggiorna a Chiaia, Napoli: parcheggio e ZTL, come arrivare, il quartiere, wellness e prenotazione diretta.',
    related: 'Correlati',
    updated: 'Aggiornato il',
    fromGuide: 'Dalla guida',
    breadcrumbLabel: 'Percorso',
  },
  en: {
    hubTitle: 'Guide',
    hubIntro:
      'Practical answers for guests staying in Chiaia: parking, the neighbourhood, getting here, wellness and booking. Each article starts from a question and answers it right away.',
    hubDescription:
      'Practical guide for guests staying in Chiaia, Naples: parking and ZTL, getting here, the neighbourhood, wellness and direct booking.',
    related: 'Related',
    updated: 'Updated',
    fromGuide: 'From the guide',
    breadcrumbLabel: 'Breadcrumb',
  },
};

/** /guida/[slug] or /en/guide/[slug], no trailing slash, like every internal href. */
export function guideArticlePath(lang: Lang, slug: string): string {
  return `${getGuidePath(lang)}/${slug}`;
}

const DATE_LOCALE: Record<Lang, string> = { it: 'it-IT', en: 'en-GB' };

export function formatGuideDate(lang: Lang, date: Date): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
