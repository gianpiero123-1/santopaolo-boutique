import type { Lang } from '../i18n/index';

/**
 * Copy for the B2B Operations area. Self-contained like the guide: only the
 * navbar label goes through the usual i18n dictionaries.
 */

export type OpsIconName = 'bed' | 'car' | 'anchor' | 'utensils-crossed' | 'package' | 'life-buoy';

export interface OpsSolution {
  title: string;
  text: string;
  href: string;
}

export interface OpsStubCopy {
  name: string;
  description: string;
}

/** Stub route slugs under /operations and /en/operations. */
export const OPS_STUB_SLUGS = ['private-stays', 'production', 'local-desk', 'partners'] as const;
export type OpsStubSlug = (typeof OPS_STUB_SLUGS)[number];

export function opsPath(lang: Lang, slug?: OpsStubSlug): string {
  const base = lang === 'en' ? '/en/operations' : '/operations';
  return slug ? `${base}/${slug}` : base;
}

interface OpsCopy {
  seo: { title: string; description: string };
  hero: {
    eyebrow: string;
    h1: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  facts: string[];
  solutionsTitle: string;
  solutions: OpsSolution[];
  whoTitle: string;
  who: { title: string; text: string }[];
  categoriesTitle: string;
  categories: { icon: OpsIconName; label: string }[];
  whyTitle: string;
  why: { title: string; text: string }[];
  howTitle: string;
  how: { title: string; text: string }[];
  partnerStrip: { text: string; cta: string };
  form: {
    title: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    dates: string;
    guests: string;
    vehicles: string;
    projectType: string;
    projectTypes: string[];
    storage: string;
    storageOptions: [string, string];
    services: string;
    budget: string;
    notes: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    directContact: string;
    /** Production-only fields, rendered by BriefForm when `extended` is set. */
    projectDuration: string;
    vehiclesByType: string;
  };
  stub: { inPreparation: string; back: string };
  stubs: Record<OpsStubSlug, OpsStubCopy>;
  production: {
    seo: { title: string; description: string };
    hero: {
      /** Rendered with the slash in the brand accent colour. */
      eyebrow: string;
      h1: string;
      sub: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    /** Stat band; a slash in `value` renders in the accent, `unit` smaller and muted. */
    stats: { value: string; unit?: string; label: string }[];
    scope: {
      eyebrow: string;
      title: string;
      /** Four wide rows, numbered 01-04 from their index. */
      items: { title: string; text: string }[];
    };
    tech: {
      eyebrow: string;
      title: string;
      rows: { label: string; value: string }[];
      /** The accent-bordered aside under the data rows. */
      note: string;
    };
    spaces: {
      eyebrow: string;
      title: string;
      /** Labels of the five garage photo slots, in grid order. */
      labels: string[];
    };
    apartmentsTitle: string;
    apartmentsText: string;
    apartmentsLink: string;
    closing: { title: string; line: string };
  };
}

export const OPS_COPY: Record<Lang, OpsCopy> = {
  it: {
    seo: {
      title: 'Santopaolo Hospitality & Logistics, Naples',
      description:
        'Cinque appartamenti privati, garage interno e spazi operativi nel centro di Napoli, per gruppi, aziende e produzioni.',
    },
    hero: {
      eyebrow: 'Santopaolo Hospitality & Logistics',
      h1: 'Ospitalità, spazi e servizi operativi da un’unica base nel centro di Napoli.',
      sub: 'Cinque appartamenti privati, parcheggio interno, spazi operativi e una rete selezionata di fornitori locali, per gruppi, aziende e produzioni.',
      ctaPrimary: 'Inviaci il tuo brief',
      ctaSecondary: 'Le soluzioni',
    },
    facts: [
      '5 appartamenti privati',
      'fino a 18 ospiti',
      'garage interno',
      'oltre 1.000 mq al piano terra',
      'Chiaia centro di Napoli',
      'un referente dedicato',
    ],
    solutionsTitle: 'Le soluzioni',
    solutions: [
      {
        title: 'Soggiorni privati',
        text: 'Per gruppi che vogliono privacy, flessibilità e più appartamenti nello stesso edificio.',
        href: '/operations/private-stays',
      },
      {
        title: 'Produzioni e aziende',
        text: 'Alloggio, parcheggio, deposito e supporto operativo da un’unica base centrale.',
        href: '/operations/production',
      },
      {
        title: 'Operazioni locali',
        text: 'Un unico referente locale che coordina trasporti, mare, ospitalità e servizi specializzati.',
        href: '/operations/local-desk',
      },
    ],
    whoTitle: 'Chi serviamo',
    who: [
      {
        title: 'Clienti diretti',
        text: 'Gruppi privati, famiglie, aziende, produzioni, entourage, troupe, delegazioni, organizzatori di eventi, team temporanei.',
      },
      {
        title: 'Partner',
        text: 'DMC, travel designer, agenzie, case di produzione, location manager, wedding e event planner, yacht manager, property manager, concierge, corporate travel manager.',
      },
    ],
    categoriesTitle: 'Categorie di servizi',
    categories: [
      { icon: 'bed', label: 'Alloggio' },
      { icon: 'car', label: 'Mobilità' },
      { icon: 'anchor', label: 'Mare' },
      { icon: 'utensils-crossed', label: 'Ristorazione e ospitalità' },
      { icon: 'package', label: 'Logistica di produzione' },
      { icon: 'life-buoy', label: 'Assistenza locale' },
    ],
    whyTitle: 'Perché Santopaolo',
    why: [
      {
        title: 'Base di proprietà',
        text: 'Appartamenti, garage e spazi sotto il nostro controllo diretto.',
      },
      { title: 'Posizione centrale', text: 'Un’unica base nel centro di Napoli.' },
      { title: 'Rete locale', text: 'Operatori e fornitori selezionati in tutta la città.' },
      { title: 'Un solo referente', text: 'Un unico interlocutore per ogni aspetto operativo.' },
      {
        title: 'White label',
        text: 'Possiamo lavorare dietro il marchio di agenzie e partner.',
      },
    ],
    howTitle: 'Come funziona',
    how: [
      { title: 'Inviaci il brief', text: 'Date, persone, mezzi, spazi e servizi.' },
      { title: 'Costruiamo la soluzione', text: 'I nostri asset più fornitori selezionati.' },
      {
        title: 'Ricevi una proposta coordinata',
        text: 'Costi, disponibilità, piano operativo.',
      },
      { title: 'Gestiamo l’operazione', text: 'Dall’arrivo alla partenza.' },
    ],
    partnerStrip: {
      text: 'Lavoriamo sia con il nostro marchio sia in white label. Il partner mantiene il controllo della relazione con il cliente.',
      cta: 'Lavora con noi',
    },
    form: {
      title: 'Inviaci il tuo brief',
      name: 'Nome',
      company: 'Azienda',
      email: 'Email',
      phone: 'Telefono',
      dates: 'Date',
      guests: 'Numero ospiti',
      vehicles: 'Numero e tipo di mezzi',
      projectType: 'Tipo di progetto',
      projectTypes: ['Soggiorno privato', 'Produzione', 'Azienda', 'Evento', 'Altro'],
      storage: 'Deposito richiesto',
      storageOptions: ['Sì', 'No'],
      services: 'Servizi richiesti',
      budget: 'Budget indicativo',
      notes: 'Note libere',
      submit: 'Invia brief',
      sending: 'Invio in corso',
      success: 'Brief ricevuto. Ti ricontattiamo a breve.',
      error: 'Non siamo riusciti a inviare il brief. Riprova tra poco.',
      directContact: 'Contatto diretto',
      projectDuration: 'Durata del progetto',
      vehiclesByType: 'Numero di mezzi per tipo',
    },
    stub: { inPreparation: 'Pagina in preparazione.', back: 'Torna a Operations' },
    stubs: {
      'private-stays': {
        name: 'Soggiorni privati',
        description:
          'Più appartamenti privati nello stesso edificio a Chiaia, Napoli, per gruppi che vogliono privacy e flessibilità.',
      },
      production: {
        name: 'Produzioni e aziende',
        description:
          'Alloggio, parcheggio, deposito e supporto operativo per produzioni e aziende, da un’unica base nel centro di Napoli.',
      },
      'local-desk': {
        name: 'Operazioni locali',
        description:
          'Un unico referente locale a Napoli che coordina trasporti, mare, ospitalità e servizi specializzati.',
      },
      partners: {
        name: 'Partner',
        description:
          'Collaborazioni con DMC, agenzie, case di produzione e planner, con il nostro marchio o in white label.',
      },
    },
    production: {
      seo: {
        title: 'Base per produzioni a Napoli, alloggio, parcheggio e deposito',
        description:
          'Ricettività fino a 18 persone, 150 posti auto al coperto, 1.000 mq configurabili a magazzino, a Chiaia, Napoli.',
      },
      hero: {
        eyebrow: 'Santopaolo / Production & Corporate',
        h1: 'Ricettività, rimessaggio e magazzino sotto un solo tetto.',
        sub: 'Diciotto posti letto su un unico livello. Centocinquanta posti auto al coperto al piano sottostante. Mille metri quadri configurabili a magazzino. Chiaia, Napoli.',
        ctaPrimary: 'Trasmetti il brief',
        ctaSecondary: 'Scheda tecnica in PDF',
      },
      stats: [
        { value: '150', label: 'posti al coperto' },
        { value: '1.000', unit: 'mq', label: 'superficie coperta' },
        { value: '18', label: 'ricettività' },
        { value: '24/7', label: 'accesso continuativo' },
      ],
      scope: {
        eyebrow: '01 — Ambiti operativi',
        title: 'Cosa copriamo in fase di lavorazione',
        items: [
          {
            title: 'Ospitalità cast e maestranze',
            text: 'Cinque unità sullo stesso pianerottolo, ricettività fino a diciotto persone, pulizie e cambio biancheria compresi.',
          },
          {
            title: 'Rimessaggio mezzi scena e di reparto',
            text: 'Van, mezzi tecnici e vetture per il trasporto cast, al coperto e sotto videosorveglianza continuativa.',
          },
          {
            title: 'Magazzino e stoccaggio attrezzature',
            text: 'Aree perimetrate e dimensionate sul volume e sulla durata della lavorazione.',
          },
          {
            title: 'Movimentazione e presa in carico forniture',
            text: 'Carico e scarico all’interno della struttura, ricezione delle consegne in assenza del referente di produzione.',
          },
        ],
      },
      tech: {
        eyebrow: '02 — Dati tecnici',
        title: 'Quello che serve prima del sopralluogo',
        rows: [
          { label: 'Sagoma limite', value: '3 m in altezza' },
          { label: 'Spazio di manovra', value: 'Senza vincoli' },
          { label: 'Movimentazione', value: 'Interna, al coperto' },
          { label: 'Videosorveglianza', value: 'Integrale, continuativa' },
          { label: 'Ricettività', value: '5 unità, unico livello' },
          { label: 'Ubicazione', value: 'Chiaia, Napoli' },
        ],
        note: 'A Chiaia la disponibilità di posti auto al coperto è pressoché nulla. Qui se ne contano centocinquanta, al livello sottostante gli alloggi. La sagoma limite è di tre metri in altezza, al di sotto transita qualsiasi mezzo, van a passo lungo compresi.',
      },
      spaces: {
        eyebrow: '03 — Gli spazi',
        title: 'L’autorimessa',
        labels: ['Accesso carrabile', 'Corsie', 'Stallo van', 'Area movimentazione', 'Magazzino'],
      },
      apartmentsTitle: 'Gli appartamenti',
      apartmentsText:
        'Cinque unità sullo stesso piano, da 45 a 90 mq, fino a 18 persone. Un’unità con due camere e due bagni, quattro con una camera, un bagno e divano letto matrimoniale. Palestra e bagno turco al piano wellness.',
      apartmentsLink: 'Vedi gli appartamenti',
      closing: {
        title:
          'Trasmetteteci il piano di lavorazione. Vi restituiamo configurazione, disponibilità e preventivo.',
        line: 'Riscontro entro ventiquattro ore lavorative.',
      },
    },
  },
  en: {
    seo: {
      title: 'Santopaolo Hospitality & Logistics, Naples',
      description:
        'Five private apartments, on site garage and operational spaces in central Naples, for groups, companies and productions.',
    },
    hero: {
      eyebrow: 'Santopaolo Hospitality & Logistics',
      h1: 'Hospitality, space and local operations from one central Naples base.',
      sub: 'Five private apartments, on site parking, operational spaces and a selected network of local providers, for groups, companies and productions.',
      ctaPrimary: 'Send us your brief',
      ctaSecondary: 'Explore solutions',
    },
    facts: [
      '5 private apartments',
      'up to 18 guests',
      'on site garage',
      '1,000+ sqm ground floor',
      'Chiaia central Naples',
      'one dedicated contact',
    ],
    solutionsTitle: 'Solutions',
    solutions: [
      {
        title: 'Private Stays',
        text: 'For groups who want privacy, flexibility and several apartments in the same building.',
        href: '/en/operations/private-stays',
      },
      {
        title: 'Production & Corporate',
        text: 'Accommodation, parking, storage and operational support from one central base.',
        href: '/en/operations/production',
      },
      {
        title: 'Local Operations',
        text: 'A single local contact coordinating transport, sea, hospitality and specialised services.',
        href: '/en/operations/local-desk',
      },
    ],
    whoTitle: 'Who we serve',
    who: [
      {
        title: 'Direct clients',
        text: 'Private groups, families, companies, productions, entourages, crews, delegations, event organisers, temporary teams.',
      },
      {
        title: 'Partners',
        text: 'DMCs, travel designers, agencies, production companies, location managers, wedding and event planners, yacht managers, property managers, concierges, corporate travel managers.',
      },
    ],
    categoriesTitle: 'Service categories',
    categories: [
      { icon: 'bed', label: 'Accommodation' },
      { icon: 'car', label: 'Mobility' },
      { icon: 'anchor', label: 'Sea' },
      { icon: 'utensils-crossed', label: 'Food and hospitality' },
      { icon: 'package', label: 'Production logistics' },
      { icon: 'life-buoy', label: 'Local assistance' },
    ],
    whyTitle: 'Why Santopaolo',
    why: [
      {
        title: 'Proprietary base',
        text: 'Apartments, garage and spaces under our direct control.',
      },
      { title: 'Central location', text: 'One base in the centre of Naples.' },
      { title: 'Local network', text: 'Selected operators and suppliers across the city.' },
      { title: 'One point of contact', text: 'A single referent for every moving part.' },
      {
        title: 'White label',
        text: 'We can work behind the brand of agencies and partners.',
      },
    ],
    howTitle: 'How it works',
    how: [
      { title: 'Send your brief', text: 'Dates, people, vehicles, spaces and services.' },
      { title: 'We build the solution', text: 'Our own assets plus selected providers.' },
      {
        title: 'Receive one coordinated proposal',
        text: 'Costs, availability, operational plan.',
      },
      { title: 'We manage the operation', text: 'From arrival to departure.' },
    ],
    partnerStrip: {
      text: 'We work both visibly and in white label. The partner keeps ownership of the client relationship.',
      cta: 'Work with us',
    },
    form: {
      title: 'Send us your brief',
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      dates: 'Dates',
      guests: 'Number of guests',
      vehicles: 'Number and type of vehicles',
      projectType: 'Project type',
      projectTypes: ['Private stay', 'Production', 'Corporate', 'Event', 'Other'],
      storage: 'Storage required',
      storageOptions: ['Yes', 'No'],
      services: 'Services required',
      budget: 'Indicative budget',
      notes: 'Notes',
      submit: 'Send brief',
      sending: 'Sending',
      success: 'Brief received. We will get back to you shortly.',
      error: 'We could not send your brief. Please try again shortly.',
      directContact: 'Direct contact',
      projectDuration: 'Project duration',
      vehiclesByType: 'Number of vehicles per type',
    },
    stub: { inPreparation: 'Page in preparation.', back: 'Back to Operations' },
    stubs: {
      'private-stays': {
        name: 'Private Stays',
        description:
          'Several private apartments in the same building in Chiaia, Naples, for groups who want privacy and flexibility.',
      },
      production: {
        name: 'Production & Corporate',
        description:
          'Accommodation, parking, storage and operational support for productions and companies, from one central Naples base.',
      },
      'local-desk': {
        name: 'Local Operations',
        description:
          'A single local contact in Naples coordinating transport, sea, hospitality and specialised services.',
      },
      partners: {
        name: 'Partners',
        description:
          'Partnerships with DMCs, agencies, production companies and planners, under our brand or in white label.',
      },
    },
    production: {
      seo: {
        title: 'Production base in Naples, accommodation, parking and storage',
        description:
          'Sleeping capacity for up to 18, 150 covered parking spaces, 1,000 sqm configurable as storage, in Chiaia, Naples.',
      },
      hero: {
        eyebrow: 'Santopaolo / Production & Corporate',
        h1: 'Crew accommodation, vehicle storage and warehousing under one roof.',
        sub: 'Eighteen beds on a single floor. One hundred and fifty covered parking spaces on the level below. One thousand square metres configurable as storage. Chiaia, Naples.',
        ctaPrimary: 'Send your brief',
        ctaSecondary: 'Technical sheet as PDF',
      },
      stats: [
        { value: '150', label: 'covered spaces' },
        { value: '1,000', unit: 'sqm', label: 'covered area' },
        { value: '18', label: 'sleeping capacity' },
        { value: '24/7', label: 'continuous access' },
      ],
      scope: {
        eyebrow: '01 — Scope of works',
        title: 'What we cover during production',
        items: [
          {
            title: 'Cast and crew accommodation',
            text: 'Five units on the same landing, capacity up to eighteen, housekeeping and linen included.',
          },
          {
            title: 'Production and department vehicle storage',
            text: 'Vans, technical vehicles and cast transport, covered and under continuous surveillance.',
          },
          {
            title: 'Equipment warehousing',
            text: 'Enclosed areas sized on the volume and duration of the shoot.',
          },
          {
            title: 'Load-in and delivery handling',
            text: 'Loading and unloading inside the building, deliveries signed for in the absence of the production coordinator.',
          },
        ],
      },
      tech: {
        eyebrow: '02 — Technical data',
        title: 'What you need before the tech scout',
        rows: [
          { label: 'Clearance height', value: '3 m' },
          { label: 'Manoeuvring space', value: 'Unrestricted' },
          { label: 'Load-in', value: 'Internal, covered' },
          { label: 'Surveillance', value: 'Full, continuous' },
          { label: 'Capacity', value: '5 units, single floor' },
          { label: 'Location', value: 'Chiaia, Naples' },
        ],
        note: 'Covered parking in Chiaia is close to non existent. There are one hundred and fifty spaces here, on the level below the apartments. Clearance is three metres, anything under that gets in, long wheelbase vans included.',
      },
      spaces: {
        eyebrow: '03 — The spaces',
        title: 'The garage',
        labels: ['Vehicle access', 'Lanes', 'Van bay', 'Handling area', 'Warehouse'],
      },
      apartmentsTitle: 'The apartments',
      apartmentsText:
        'Five units on the same floor, from 45 to 90 sqm, up to 18 people. One unit with two bedrooms and two bathrooms, four with one bedroom, one bathroom and a double sofa bed. Gym and steam room on the wellness floor.',
      apartmentsLink: 'See the apartments',
      closing: {
        title:
          'Send us your shooting schedule. We come back with configuration, availability and a quote.',
        line: 'Response within twenty four working hours.',
      },
    },
  },
};
