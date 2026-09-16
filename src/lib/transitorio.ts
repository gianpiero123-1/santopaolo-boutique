// Transitional rentals (affitti transitori / mid-term rentals): data accessors,
// bilingual page copy and the JSON-LD offers. Units, rents, services and FAQ
// live in src/data/transitorio.json; only prose that is not data sits here.

import type { Lang } from '../i18n/index';
import { getTransitionalPath } from '../i18n/index';
import { ORGANIZATION_ID, absoluteUrl, accommodationId, type JsonLdValue } from '../data/schema';
import data from '../data/transitorio.json';

export const TRANSITORIO = data;

export type TransitorioUnit = (typeof data.units)[number];
export type DurationOption = (typeof data.form.durations)[number];
export type ReasonOption = (typeof data.form.reasons)[number];

/** Fixed prefix that marks a transitional request in notes and on Telegram. */
export const TRANSITORIO_PREFIX = 'TRANSITORIO';

/** Public unit number (1-5) -> maximum people on a transitional lease. */
export const TRANSITORIO_CAPACITY: Record<number, number> = Object.fromEntries(
  data.units.map(u => [u.id, u.persons]),
);

export function findUnit(id: number): TransitorioUnit | undefined {
  return data.units.find(u => u.id === id);
}

export function findDuration(key: string): DurationOption | undefined {
  return data.form.durations.find(d => d.key === key);
}

export function findReason(key: string): ReasonOption | undefined {
  return data.form.reasons.find(r => r.key === key);
}

/** Monthly rent of a unit for a given lease length (3, 6, 12 or 18 months). */
export function rentFor(unit: TransitorioUnit, months: number): number {
  return (unit.rates as Record<string, number>)[String(months)];
}

/**
 * "€7.000" in Italian, "€7,000" in English. Grouped by hand: the Italian
 * locale data leaves four-digit numbers ungrouped, the rate card does not.
 */
export function formatRent(amount: number, lang: Lang): string {
  const grouped = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'it' ? '.' : ',');
  return `€${grouped}`;
}

export function sqmLabel(unit: TransitorioUnit, lang: Lang): string {
  const unitWord = lang === 'it' ? 'mq' : 'sqm';
  const approx = unit.sqmApprox ? (lang === 'it' ? 'circa ' : 'about ') : '';
  return `${approx}${unit.sqm} ${unitWord}`;
}

export function personsLabel(unit: TransitorioUnit, lang: Lang): string {
  return lang === 'it' ? `fino a ${unit.persons} persone` : `up to ${unit.persons} people`;
}

/**
 * Adds whole months to a date-only Date (UTC midnight), clamping to the last
 * day of the target month so 31 January plus one month is 28 February.
 */
export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + months + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m + months, Math.min(d, lastDay)));
}

/* ---------------------------------------------------------------- JSON-LD */

const RENT_BANDS_LABEL: Record<Lang, string> = {
  it: 'Canone mensile tutto incluso',
  en: 'All inclusive monthly rent',
};

/** "Appartamento 1, 95 mq, fino a 6 persone. Canone mensile tutto incluso: 3 mesi €7.000, ..." */
export function offerDescription(unit: TransitorioUnit, lang: Lang): string {
  const bands = data.rateMonths
    .map(m => `${m} ${lang === 'it' ? 'mesi' : 'months'} ${formatRent(rentFor(unit, m), lang)}`)
    .join(', ');
  return `${unit.name[lang]}, ${sqmLabel(unit, lang)}, ${personsLabel(unit, lang)}. ${RENT_BANDS_LABEL[lang]}: ${bands}.`;
}

/**
 * One Offer per unit, attached to the LodgingBusiness as makesOffer. The
 * `@id`s anchor to the Italian URL so the IT and EN pages describe the same
 * five offers; `price` is the 18 month rent, the lowest band.
 */
export function buildTransitionalOffers(lang: Lang): JsonLdValue[] {
  const pageUrl = absoluteUrl(getTransitionalPath(lang));
  const idBase = absoluteUrl(getTransitionalPath('it'));
  const longest = data.rateMonths[data.rateMonths.length - 1];
  return data.units.map(unit => {
    const price = rentFor(unit, longest);
    return {
      '@type': 'Offer',
      '@id': `${idBase}#offer-${unit.id}`,
      name: `${unit.name[lang]}, ${lang === 'it' ? 'affitto transitorio' : 'mid-term rental'}`,
      description: offerDescription(unit, lang),
      url: pageUrl,
      category: lang === 'it' ? 'Locazione transitoria' : 'Mid-term rental',
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      itemOffered: { '@id': accommodationId(unit.slug) },
      seller: { '@id': ORGANIZATION_ID },
      priceCurrency: 'EUR',
      price,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'EUR',
        unitCode: 'MON',
        unitText: lang === 'it' ? 'mese' : 'month',
        name:
          lang === 'it'
            ? `Canone mensile su ${longest} mesi, tutto incluso`
            : `Monthly rent on an ${longest} month lease, all inclusive`,
      },
      eligibleDuration: {
        '@type': 'QuantitativeValue',
        minValue: data.minMonths,
        maxValue: data.maxMonths,
        unitCode: 'MON',
      },
    };
  });
}

/* ------------------------------------------------------------------- copy */

interface TransitorioCopy {
  seo: { title: string; description: string };
  anchors: { units: string; request: string };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    answer: [string, string];
  };
  who: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  units: {
    eyebrow: string;
    title: string;
    intro: string;
    columns: { unit: string; sqm: string; composition: string; months: string };
    note: string;
  };
  organisation: {
    eyebrow: string;
    title: string;
    intro: string;
    extrasTitle: string;
    direct: { title: string; text: string };
  };
  equipment: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  location: { eyebrow: string; title: string; text: string };
  lease: {
    eyebrow: string;
    title: string;
    items: { label: string; title: string; text: string }[];
  };
  faq: { eyebrow: string; title: string };
  request: {
    eyebrow: string;
    title: string;
    text: string;
    whatsappLabel: string;
    fields: {
      arrival: string;
      duration: string;
      unit: string;
      unitPlaceholder: string;
      persons: string;
      reason: string;
      name: string;
      email: string;
      notes: string;
      notesPlaceholder: string;
    };
    submit: string;
    sending: string;
    errors: {
      name: string;
      email: string;
      arrival: string;
      arrivalPast: string;
      unit: string;
      capacity: string;
      rateLimited: string;
      generic: string;
    };
    success: { title: string; codeLabel: string; body: string; backHome: string };
  };
}

export const TRANSITORIO_COPY: Record<Lang, TransitorioCopy> = {
  it: {
    seo: {
      title: 'Affitti transitori Napoli Chiaia, 1 a 18 mesi | Santopaolo Boutique Apartments',
      description:
        "Appartamenti arredati con servizi alberghieri in affitto transitorio a Chiaia, Napoli, da 1 a 18 mesi. Gestione diretta della proprietà, personale interno, piano wellness, autorimessa nell'edificio.",
    },
    anchors: { units: 'unita', request: 'richiesta' },
    hero: {
      eyebrow: 'Chiaia, Napoli, da 1 a 18 mesi',
      title: 'Affitti transitori a Chiaia con servizi alberghieri',
      lead:
        "Cinque appartamenti arredati, consegnati completamente attrezzati, gestiti direttamente dalla proprietà con un'organizzazione di tipo alberghiero. Per professionisti, aziende e famiglie che restano a Napoli qualche mese e vogliono entrare senza pensieri.",
      ctaPrimary: 'Richiedi una visita',
      ctaSecondary: 'Vedi le unità',
      answer: [
        'Santopaolo Boutique Apartments offre affitti transitori da 1 a 18 mesi in Vico Santa Maria a Cappella Vecchia 8b, Chiaia, Napoli.',
        'Cinque unità da 40 a 95 mq su un unico piano privato, da 2 a 6 persone, formula all inclusive: utenze, Wi-Fi, due pulizie complete a settimana, cambio biancheria settimanale, palestra e bagno turco riservati. Canoni mensili da €3.750 a €7.000. Trattativa diretta con la proprietà.',
      ],
    },
    who: {
      eyebrow: 'Per chi',
      title: 'Una casa a Chiaia per il tempo che serve',
      items: [
        {
          title: 'Soggiorni professionali',
          text: 'Manager, consulenti e tecnici in missione a Napoli per un progetto o un cantiere.',
        },
        {
          title: 'Medici e dirigenti sanitari',
          text: 'Incarichi al Cardarelli, al Pascale, al Monaldi o nelle cliniche private del quartiere.',
        },
        {
          title: 'Relocation aziendale',
          text: 'Dipendenti in arrivo, anche con famiglia, in attesa della sistemazione definitiva.',
        },
        {
          title: 'Ristrutturazione di casa',
          text: 'Chi lascia il proprio appartamento a Chiaia o Posillipo per qualche mese e non vuole rinunciare al quartiere né ai servizi.',
        },
        {
          title: 'Team building e sedi temporanee',
          text: 'Team aziendali che si trasferiscono a Napoli per un trimestre, un lancio o un progetto, con più unità sullo stesso piano privato.',
        },
        {
          title: 'Troupe e produzioni',
          text: 'Soggiorni di più settimane per cast e crew, con la Production Base allo stesso indirizzo.',
        },
      ],
    },
    units: {
      eyebrow: 'Le unità e i canoni',
      title: 'Cinque appartamenti, un piano privato',
      intro:
        'Un unico piano riservato in Vico Santa Maria a Cappella Vecchia 8b. Ogni unità è consegnata completamente arredata e attrezzata: cucina con stoviglie, pentole, utensili ed elettrodomestici, lavatrice, biancheria e tutto il necessario per la vita quotidiana. Contratto transitorio da 1 a 18 mesi. Il canone scende con la durata: sotto i 3 mesi la proposta è su richiesta.',
      columns: { unit: 'Unità', sqm: 'Superficie', composition: 'Composizione', months: 'mesi' },
      note:
        'Canoni mensili per soggiorni da 3 a 18 mesi, tutto incluso: utenze, Wi-Fi e tutti i servizi della formula. La disponibilità degli appartamenti e dei servizi extra è soggetta a conferma. Visite su appuntamento, anche il sabato.',
    },
    organisation: {
      eyebrow: 'Organizzazione',
      title: 'Cinque unità gestite direttamente dalla proprietà',
      intro:
        "Un'organizzazione di tipo alberghiero, con personale interno e un solo interlocutore per tutta la durata del soggiorno.",
      extrasTitle: 'Servizi extra a pagamento',
      direct: {
        title: 'Trattativa diretta',
        text: 'Nessuna intermediazione, nessuna agenzia. Il contratto si definisce con la proprietà.',
      },
    },
    equipment: {
      eyebrow: 'Dotazioni',
      title: 'In piena abitabilità dal primo giorno',
      items: [
        { title: 'Cucina completa', text: 'Stoviglie, pentole, utensili ed elettrodomestici' },
        { title: 'Lavatrice', text: 'In ogni appartamento' },
        { title: 'Wi-Fi in tutte le unità', text: 'Adatto a videocall e lavoro remoto' },
        { title: 'Climatizzazione', text: 'In tutti gli ambienti' },
        { title: 'Biancheria di standard alberghiero', text: 'Letto settimanale, asciugamani su richiesta' },
        { title: 'Arredi e dotazioni complete', text: 'Tutto il necessario per la vita quotidiana' },
        { title: 'Postazione di lavoro', text: "Su richiesta, predisposta prima dell'ingresso" },
      ],
    },
    location: {
      eyebrow: 'Posizione',
      title: 'Piazza dei Martiri, lungomare, metropolitana e polo direzionale di Chiaia a piedi',
      text:
        "Vico Santa Maria a Cappella Vecchia 8b è nel cuore di Chiaia. Uffici, studi professionali, consolati, Villa Comunale e Riviera si raggiungono senza auto. L'autorimessa nell'edificio risolve l'unico problema del quartiere, il posto auto coperto.",
    },
    lease: {
      eyebrow: 'Contratto',
      title: 'Contratto transitorio, tempi chiari',
      items: [
        {
          label: 'Tipologia',
          title: 'Locazione transitoria',
          text: 'Contratto ai sensi della L. 431/98, art. 5. Durata da 1 a 18 mesi, con esigenza transitoria documentata.',
        },
        {
          label: 'Registrazione',
          title: 'A carico della proprietà',
          text: "Registrazione presso l'Agenzia delle Entrate inclusa. Copia del contratto registrato al locatario.",
        },
        {
          label: 'Intestazione',
          title: 'Privato o azienda',
          text: 'Contratto intestabile alla società, con fatturazione mensile a Santopaolo Asset Management S.r.l.',
        },
        {
          label: 'Documenti',
          title: 'Cosa serve',
          text: "Documento d'identità, codice fiscale, prova dell'esigenza transitoria (lettera d'incarico, contratto di lavoro, pratica edilizia). Per aziende, visura camerale.",
        },
      ],
    },
    faq: {
      eyebrow: 'Domande frequenti',
      title: 'Le risposte che cerchi prima di scriverci',
    },
    request: {
      eyebrow: 'Richiesta',
      title: 'Dicci quando arrivi e quanto resti',
      text: 'Rispondiamo entro 24 ore con disponibilità, canone e proposta di contratto. Visite su appuntamento, anche il sabato.',
      whatsappLabel: 'WhatsApp +39 331 322 5577',
      fields: {
        arrival: 'Data di arrivo',
        duration: 'Durata',
        unit: 'Unità',
        unitPlaceholder: "Scegli un'unità",
        persons: 'Persone',
        reason: 'Motivo del soggiorno',
        name: 'Nome e cognome',
        email: 'Email',
        notes: 'Note',
        notesPlaceholder: 'Azienda, postazione di lavoro, posto auto, esigenze particolari',
      },
      submit: 'Invia richiesta',
      sending: 'Invio in corso',
      errors: {
        name: 'Inserisci nome e cognome.',
        email: 'Inserisci un indirizzo email valido.',
        arrival: 'Seleziona la data di arrivo.',
        arrivalPast: 'La data di arrivo non può essere nel passato.',
        unit: "Scegli un'unità.",
        capacity: 'Questa unità ospita al massimo {max} persone.',
        rateLimited: 'Hai inviato troppe richieste. Attendi qualche minuto e riprova.',
        generic: 'Non siamo riusciti a inviare la richiesta. Riprova tra poco oppure scrivici su WhatsApp.',
      },
      success: {
        title: 'Richiesta ricevuta',
        codeLabel: 'Codice richiesta',
        body: 'Ti abbiamo inviato una email di ricevuta. Rispondiamo entro 24 ore con disponibilità, canone e proposta di contratto.',
        backHome: 'Torna alla home',
      },
    },
  },
  en: {
    seo: {
      title: 'Mid-term rentals Naples Chiaia, 1 to 18 months | Santopaolo Boutique Apartments',
      description:
        'Monthly furnished apartments in Chiaia with hotel services, mid-term rentals in Naples from 1 to 18 months. Direct dealing with the owner, in-house staff, wellness floor, garage in the building.',
    },
    anchors: { units: 'units', request: 'enquiry' },
    hero: {
      eyebrow: 'Chiaia, Naples, 1 to 18 months',
      title: 'Monthly furnished apartments in Chiaia with hotel services',
      lead:
        'Five furnished apartments, handed over fully equipped and run directly by the owner along hotel lines. For professionals, companies and families staying in Naples for a few months who want to move in and get on with life.',
      ctaPrimary: 'Book a viewing',
      ctaSecondary: 'See the units',
      answer: [
        'Santopaolo Boutique Apartments offers mid-term rentals in Naples from 1 to 18 months at Vico Santa Maria a Cappella Vecchia 8b, Chiaia.',
        'Five units from 40 to 95 sqm on a single private floor, sleeping 2 to 6, all inclusive: utilities, Wi-Fi, two full cleans a week, weekly linen change, private gym and steam room. Monthly rents from €3,750 to €7,000. Direct dealing with the owner.',
      ],
    },
    who: {
      eyebrow: 'Who it is for',
      title: 'A home in Chiaia for as long as you need it',
      items: [
        {
          title: 'Professional stays',
          text: 'Managers, consultants and engineers posted to Naples for a project or a construction site.',
        },
        {
          title: 'Doctors and healthcare executives',
          text: 'Appointments at the Cardarelli, Pascale or Monaldi hospitals, or at the private clinics in the district.',
        },
        {
          title: 'Corporate relocation',
          text: 'Incoming employees, with or without family, waiting for a permanent home.',
        },
        {
          title: 'Home renovation',
          text: 'Owners leaving their apartment in Chiaia or Posillipo for a few months who want to stay in the neighbourhood and keep the services.',
        },
        {
          title: 'Team building and temporary offices',
          text: 'Teams moving to Naples for a quarter, a launch or a project, with several units on the same private floor.',
        },
        {
          title: 'Film crews and productions',
          text: 'Stays of several weeks for cast and crew, with the Production Base at the same address.',
        },
      ],
    },
    units: {
      eyebrow: 'Units and rents',
      title: 'Five apartments, one private floor',
      intro:
        'A single reserved floor at Vico Santa Maria a Cappella Vecchia 8b. Every unit is handed over fully furnished and equipped: kitchen with crockery, pans, utensils and appliances, washing machine, linen and everything daily life requires. Transitional lease from 1 to 18 months. The rent decreases with the length of stay: under 3 months, quoted on request.',
      columns: { unit: 'Unit', sqm: 'Floor area', composition: 'Layout', months: 'months' },
      note:
        'Monthly rents for stays of 3 to 18 months, all inclusive: utilities, Wi-Fi and every service in the package. Availability of apartments and extra services is subject to confirmation. Viewings by appointment, Saturdays included.',
    },
    organisation: {
      eyebrow: 'How it runs',
      title: 'Five units run directly by the owner',
      intro: 'A hotel-style organisation, with in-house staff and a single point of contact for the whole stay.',
      extrasTitle: 'Extra services, charged separately',
      direct: {
        title: 'Direct dealing',
        text: 'No intermediaries, no agency. The lease is agreed directly with the owner.',
      },
    },
    equipment: {
      eyebrow: 'What is provided',
      title: 'Fully liveable from day one',
      items: [
        { title: 'Complete kitchen', text: 'Crockery, pans, utensils and appliances' },
        { title: 'Washing machine', text: 'In every apartment' },
        { title: 'Wi-Fi in every unit', text: 'Suitable for video calls and remote work' },
        { title: 'Air conditioning', text: 'In every room' },
        { title: 'Hotel-standard linen', text: 'Bed linen weekly, towels on request' },
        { title: 'Complete furniture and fittings', text: 'Everything daily life requires' },
        { title: 'Workstation', text: 'On request, set up before you arrive' },
      ],
    },
    location: {
      eyebrow: 'Location',
      title: "Piazza dei Martiri, the seafront, the metro and Chiaia's business district on foot",
      text:
        'Vico Santa Maria a Cappella Vecchia 8b is in the heart of Chiaia. Offices, professional practices, consulates, the Villa Comunale and the Riviera are all within walking distance. The garage in the building solves the one problem of the district: covered parking.',
    },
    lease: {
      eyebrow: 'Lease',
      title: 'Transitional lease, clear terms',
      items: [
        {
          label: 'Type',
          title: 'Transitional lease',
          text: 'Lease under Italian Law 431/98, art. 5. Duration from 1 to 18 months, with a documented temporary need.',
        },
        {
          label: 'Registration',
          title: 'Handled by the owner',
          text: 'Registration with the Italian Revenue Agency included. The tenant receives a copy of the registered lease.',
        },
        {
          label: 'Named party',
          title: 'Individual or company',
          text: "The lease can be in the company's name, with monthly invoicing by Santopaolo Asset Management S.r.l.",
        },
        {
          label: 'Documents',
          title: 'What you need',
          text: 'ID document, Italian tax code, proof of the temporary need (letter of assignment, employment contract, building permit). For companies, a company registration extract.',
        },
      ],
    },
    faq: {
      eyebrow: 'Frequently asked questions',
      title: 'The answers you need before writing to us',
    },
    request: {
      eyebrow: 'Enquiry',
      title: 'Tell us when you arrive and how long you stay',
      text: 'We reply within 24 hours with availability, rent and a draft lease. Viewings by appointment, Saturdays included.',
      whatsappLabel: 'WhatsApp +39 331 322 5577',
      fields: {
        arrival: 'Arrival date',
        duration: 'Length of stay',
        unit: 'Unit',
        unitPlaceholder: 'Choose a unit',
        persons: 'People',
        reason: 'Reason for the stay',
        name: 'Full name',
        email: 'Email',
        notes: 'Notes',
        notesPlaceholder: 'Company, workstation, parking space, particular requirements',
      },
      submit: 'Send enquiry',
      sending: 'Sending',
      errors: {
        name: 'Please enter your full name.',
        email: 'Please enter a valid email address.',
        arrival: 'Please select an arrival date.',
        arrivalPast: 'The arrival date cannot be in the past.',
        unit: 'Please choose a unit.',
        capacity: 'This unit sleeps a maximum of {max} people.',
        rateLimited: 'Too many requests. Please wait a few minutes and try again.',
        generic: 'We could not send your enquiry. Please try again shortly or write to us on WhatsApp.',
      },
      success: {
        title: 'Enquiry received',
        codeLabel: 'Request code',
        body: 'We have sent you a confirmation email. We reply within 24 hours with availability, rent and a draft lease.',
        backHome: 'Back to home',
      },
    },
  },
};
