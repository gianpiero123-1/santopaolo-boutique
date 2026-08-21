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
 * in the i18n dictionaries to keep the guide self-contained; the footer's
 * guide column strings are the ones that go through the usual translations.
 */
export const GUIDE_COPY: Record<
  Lang,
  {
    hubTitle: string;
    /** Fixed brand eyebrow under the hub H1. */
    hubEyebrow: string;
    hubIntro: string;
    hubDescription: string;
    related: string;
    updated: string;
    fromGuide: string;
    breadcrumbLabel: string;
    questionOne: string;
    questionMany: string;
    /**
     * Closing brand line of every guide page. The wording is fixed and must
     * stay identical across pages; edit it here or nowhere.
     */
    brandLine: string;
  }
> = {
  it: {
    hubTitle: 'Guida',
    hubEyebrow: 'Santopaolo Boutique Apartments, Chiaia, Napoli',
    hubIntro:
      'Risposte pratiche per chi soggiorna a Chiaia: parcheggio, quartiere, arrivo, wellness e prenotazione diretta.',
    hubDescription:
      'Guida pratica per chi soggiorna a Chiaia, Napoli: parcheggio e ZTL, come arrivare, il quartiere, wellness e prenotazione diretta.',
    related: 'Continua',
    updated: 'Aggiornato il',
    fromGuide: 'Dalla guida',
    breadcrumbLabel: 'Percorso',
    questionOne: 'domanda',
    questionMany: 'domande',
    brandLine:
      'Santopaolo Boutique Apartments, cinque appartamenti sullo stesso piano a Chiaia con garage coperto, Vico Santa Maria a Cappella Vecchia 8b, Napoli.',
  },
  en: {
    hubTitle: 'Guide',
    hubEyebrow: 'Santopaolo Boutique Apartments, Chiaia, Naples',
    hubIntro:
      'Practical answers for guests staying in Chiaia: parking, the neighbourhood, getting here, wellness and direct booking.',
    hubDescription:
      'Practical guide for guests staying in Chiaia, Naples: parking and ZTL, getting here, the neighbourhood, wellness and direct booking.',
    related: 'Continue',
    updated: 'Updated',
    fromGuide: 'From the guide',
    breadcrumbLabel: 'Breadcrumb',
    questionOne: 'question',
    questionMany: 'questions',
    brandLine:
      'Santopaolo Boutique Apartments, five apartments on a single floor in Chiaia with a covered garage, Vico Santa Maria a Cappella Vecchia 8b, Naples.',
  },
};

/**
 * The four most commercial articles, hardcoded for the footer's guide column.
 * Labels are short forms of the article questions, sized for a footer column.
 */
export const FOOTER_GUIDE_LINKS: Record<Lang, { slug: string; label: string }[]> = {
  it: [
    { slug: 'quanti-letti-servono-davvero', label: 'Quanti letti servono davvero' },
    { slug: 'dove-parcheggiare-a-chiaia', label: 'Dove parcheggiare a Chiaia' },
    { slug: 'quanto-costa-davvero-un-appartamento-napoli', label: 'Quanto costa davvero un appartamento' },
    { slug: 'appartamenti-napoli-con-palestra', label: 'Appartamenti con palestra e bagno turco' },
  ],
  en: [
    { slug: 'how-many-beds-you-actually-need', label: 'How many beds you actually need' },
    { slug: 'where-to-park-in-chiaia', label: 'Where to park in Chiaia' },
    { slug: 'real-cost-of-a-naples-apartment', label: 'What an apartment really costs' },
    { slug: 'naples-apartments-with-gym', label: 'Apartments with a gym and steam room' },
  ],
};

/** Cuts an answer for the article cards, at a word boundary, ellipsis added. */
export function truncateAnswer(answer: string, max = 110): string {
  if (answer.length <= max) return answer;
  const cut = answer.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, '')}…`;
}

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
