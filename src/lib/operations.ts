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
    hero: { eyebrow: string; h1: string; sub: string; cta: string };
    specs: { label: string; value: string }[];
    specNote: string;
    capabilitiesTitle: string;
    capabilities: { title: string; text: string }[];
    ztlTitle: string;
    ztlText: string;
    apartmentsTitle: string;
    apartmentsText: string;
    apartmentsLink: string;
    photosTitle: string;
    /** Labels of the eight garage photo slots, in grid order. */
    photoLabels: string[];
    whoTitle: string;
    whoText: string;
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
          'Alloggio troupe fino a 18 persone, garage coperto di 1.000 mq con 150 posti, deposito e carico coperto, nel centro di Napoli.',
      },
      hero: {
        eyebrow: 'Santopaolo Production & Corporate',
        h1: 'Una base nel centro di Napoli per produzioni, aziende e team temporanei.',
        sub: 'Alloggio per la troupe, 150 posti auto coperti, deposito e carico al coperto, dentro la ZTL di Chiaia.',
        cta: 'Inviaci il tuo brief',
      },
      specs: [
        { label: 'Superficie coperta', value: '1.000 mq' },
        { label: 'Posti auto', value: 'fino a 150' },
        { label: 'Altezza massima', value: '3 m' },
        { label: 'Accesso', value: '24 ore, 365 giorni' },
        { label: 'Larghezza mezzi', value: 'nessuna limitazione' },
        { label: 'Carico e scarico', value: 'al coperto, in sede' },
        { label: 'Videosorveglianza', value: 'sì, copertura totale' },
        { label: 'Zona', value: 'dentro la ZTL di Chiaia, centro di Napoli' },
        { label: 'Alloggio', value: '5 appartamenti, stesso edificio, fino a 18 persone' },
      ],
      specNote:
        'I mezzi oltre 3 m di altezza non entrano. Tutto sotto quella quota passa, inclusi van passo lungo e furgoni.',
      capabilitiesTitle: 'Cosa puoi fare qui',
      capabilities: [
        {
          title: 'Alloggio troupe',
          text: 'Cinque appartamenti su un piano, fino a 18 persone, housekeeping incluso.',
        },
        {
          title: 'Parcheggio mezzi',
          text: 'Van tecnici, auto di produzione e transfer dei talent, al coperto e videosorvegliati.',
        },
        {
          title: 'Deposito attrezzature',
          text: 'Aree dedicate configurabili in base alla dimensione del progetto.',
        },
        {
          title: 'Carico coperto',
          text: 'Scarichi all’interno, niente permessi su strada, niente rischio meteo.',
        },
        {
          title: 'Ricezione materiali',
          text: 'Riceviamo e firmiamo le consegne in tua assenza.',
        },
        {
          title: 'Base temporanea',
          text: 'Un punto fisso in città per tutta la durata delle riprese.',
        },
      ],
      ztlTitle: 'Perché la ZTL conta',
      ztlText:
        'Chiaia è zona a traffico limitato. In centro la maggior parte dei mezzi di produzione parcheggia lontano dal set, o non parcheggia. Il nostro garage è sotto gli appartamenti, dentro la zona. Troupe, mezzi e attrezzature restano nello stesso punto.',
      apartmentsTitle: 'Gli appartamenti',
      apartmentsText:
        'Cinque unità sullo stesso piano, da 45 a 90 mq, fino a 18 persone. Un’unità con due camere e due bagni, quattro con una camera, un bagno e divano letto matrimoniale. Palestra e bagno turco al piano wellness.',
      apartmentsLink: 'Vedi gli appartamenti',
      photosTitle: 'Il garage',
      photoLabels: [
        'Ingresso',
        'Corsie',
        'Posto van',
        'Area carico',
        'Area deposito',
        'Accesso pedonale',
        'Videosorveglianza',
        'Spazio libero configurabile',
      ],
      whoTitle: 'Chi ci usa',
      whoText:
        'Produzioni film e TV, spot pubblicitari, produzioni moda, eventi, team tecnici, aziende di installazione, personale aziendale in trasferta, equipaggi di yacht.',
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
          'Crew accommodation for up to 18, 1,000 sqm covered garage with 150 spaces, storage and covered loading, in central Naples.',
      },
      hero: {
        eyebrow: 'Santopaolo Production & Corporate',
        h1: 'A central Naples base for productions, companies and temporary teams.',
        sub: 'Crew accommodation, 150 covered parking spaces, storage and covered loading, inside the restricted traffic zone of Chiaia.',
        cta: 'Send us your brief',
      },
      specs: [
        { label: 'Covered area', value: '1,000 sqm' },
        { label: 'Parking spaces', value: 'up to 150' },
        { label: 'Maximum height', value: '3 m' },
        { label: 'Access', value: '24 hours, 365 days' },
        { label: 'Vehicle width', value: 'no restriction' },
        { label: 'Loading and unloading', value: 'covered, on site' },
        { label: 'Surveillance', value: 'yes, full coverage' },
        { label: 'Zone', value: 'inside Chiaia ZTL, central Naples' },
        { label: 'Accommodation', value: '5 apartments, same building, up to 18 people' },
      ],
      specNote:
        'Vehicles above 3 m in height cannot enter. Everything below that clears, including long wheelbase vans and panel vans.',
      capabilitiesTitle: 'What you can do here',
      capabilities: [
        {
          title: 'Crew accommodation',
          text: 'Five apartments on one floor, up to 18 people, housekeeping included.',
        },
        {
          title: 'Vehicle parking',
          text: 'Technical vans, production cars and talent transport, covered and monitored.',
        },
        {
          title: 'Equipment storage',
          text: 'Dedicated areas configurable by project size.',
        },
        {
          title: 'Covered loading',
          text: 'Unload inside, no street permits, no weather risk.',
        },
        {
          title: 'Equipment reception',
          text: 'We receive and sign for deliveries in your absence.',
        },
        {
          title: 'Temporary base',
          text: 'A fixed point in the city for the length of the shoot.',
        },
      ],
      ztlTitle: 'Why the ZTL matters',
      ztlText:
        'Chiaia is a restricted traffic zone. Most production vehicles in central Naples park far from the location, or not at all. Our garage sits under the apartments, inside the zone. Crew, vehicles and equipment stay in the same place.',
      apartmentsTitle: 'The apartments',
      apartmentsText:
        'Five units on the same floor, from 45 to 90 sqm, up to 18 people. One unit with two bedrooms and two bathrooms, four with one bedroom, one bathroom and a double sofa bed. Gym and steam room on the wellness floor.',
      apartmentsLink: 'See the apartments',
      photosTitle: 'The garage',
      photoLabels: [
        'Entrance',
        'Lanes',
        'Van bay',
        'Loading area',
        'Storage area',
        'Pedestrian access',
        'Video surveillance',
        'Configurable open space',
      ],
      whoTitle: 'Who uses this base',
      whoText:
        'Film and TV productions, commercial shoots, fashion productions, events, technical teams, installation companies, corporate staff on temporary assignment, yacht crews.',
    },
  },
};
