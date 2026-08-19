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
      eyebrow: string;
      /** First line of the H1; `titleMuted` follows on its own line in marble grey. */
      title: string;
      titleMuted: string;
      text: string;
      cta: string;
    };
    /** Six items, numbered 01-06 from their index and looped twice by the track. */
    ticker: string[];
    surface: {
      eyebrow: string;
      /** The big figure, locale formatted; the component appends the accent plus sign. */
      value: string;
      unit: string;
      text1: string;
      text2: string;
      /** Mono label repeated above each of the three destination columns. */
      usesLabel: string;
      uses: { title: string; text: string }[];
    };
    scope: {
      eyebrow: string;
      title: string;
      /** Sticky index entries, one per panel, same order. */
      index: string[];
      panels: { tag: string; title: string; text: string; chips: string[] }[];
    };
    address: {
      eyebrow: string;
      title: string;
      text: string;
      /** Three bands; the last one renders solid bordeaux. */
      bands: { level: string; value: string; side: string }[];
    };
    gallery: {
      eyebrow: string;
      title: string;
      /** Captions of the five photo slots, in grid order. */
      captions: string[];
      note: string;
    };
    specs: {
      eyebrow: string;
      title: string;
      rows: { label: string; value: string }[];
    };
    closing: {
      eyebrow: string;
      title: string;
      text: string;
      contact: {
        /** `href` turns the first line into a link; extra lines break with <br>. */
        rows: { label: string; lines: string[]; href?: string }[];
        hint: string;
      };
      form: {
        fields: {
          company: string;
          name: string;
          email: string;
          phone: string;
          type: string;
          dates: string;
          beds: string;
          vehicles: string;
          notes: string;
        };
        placeholders: {
          company: string;
          name: string;
          email: string;
          phone: string;
          dates: string;
          beds: string;
          vehicles: string;
          notes: string;
        };
        typeOptions: string[];
        submit: string;
        sending: string;
        sent: string;
        error: string;
        fine: string;
      };
      /** Legal strip at the very bottom of the page. */
      foot: string[];
    };
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
        title: 'Base per produzioni a Napoli, ricettività e rimessaggio a un solo indirizzo',
        description:
          'Diciotto posti letto in cinque unità e oltre 1.000 metri quadri coperti nel medesimo stabile a Chiaia, Napoli. Oltre 100 posti auto, accesso 24 ore.',
      },
      hero: {
        eyebrow: 'Base operativa per produzioni, Napoli Chiaia',
        title: 'Ricettività e rimessaggio',
        titleMuted: 'al medesimo indirizzo.',
        text: 'Diciotto posti letto in cinque unità e oltre mille metri quadri coperti nel medesimo stabile. Nessun trasferimento fra la sistemazione delle maestranze e il ricovero dei mezzi.',
        cta: 'Trasmetti un brief',
      },
      ticker: [
        'Superficie coperta oltre 1.000 mq',
        'Oltre 100 posti auto',
        'Accesso 24 ore, 365 giorni',
        'Carico e scarico al coperto',
        'Videosorveglianza integrale',
      ],
      surface: {
        eyebrow: 'Superficie coperta',
        value: '1.000',
        unit: 'Metri quadri, piano autorimessa',
        text1:
          "Oltre mille metri quadri coperti al di sotto delle unità ricettive. A Chiaia la disponibilità di superficie coperta è strutturalmente limitata, e un'estensione di questa dimensione non trova riscontro nel quartiere.",
        text2:
          'La superficie non viene ceduta a tariffa giornaliera. Viene perimetrata sulla durata effettiva della lavorazione, con presa in carico e riconsegna formalizzate.',
        usesLabel: 'Destinazione',
        uses: [
          {
            title: 'Ricovero mezzi',
            text: 'Oltre cento posti auto al coperto, accesso ventiquattro ore su ventiquattro.',
          },
          {
            title: 'Deposito perimetrato',
            text: 'Porzioni di superficie riservate per la durata della lavorazione.',
          },
          {
            title: 'Manovra e carico',
            text: 'Operazioni interne, al riparo dagli agenti atmosferici.',
          },
        ],
      },
      scope: {
        eyebrow: 'Ambiti operativi',
        title: 'Tre funzioni nello stesso perimetro.',
        index: ['Alloggio', 'Rimessaggio', 'Movimentazione'],
        panels: [
          {
            tag: 'Ricettività',
            title: 'Sistemazione delle maestranze',
            text: 'Cinque unità da 45 a 90 metri quadri, disponibili singolarmente o a piano intero. Cucina in ogni unità, lavanderia comune, palestra e bagno turco al piano wellness. Nessuna limitazione di orario su ingressi e uscite.',
            chips: ['18 posti letto', 'Piano intero', 'Lavanderia', 'Wellness'],
          },
          {
            tag: 'Rimessaggio',
            title: 'Ricovero di mezzi e attrezzature',
            text: "Mezzi tecnici e attrezzatura di scena restano al coperto per l'intera durata delle riprese, sotto videosorveglianza integrale, senza necessità di scarico su strada a fine giornata.",
            chips: ['Videosorveglianza', 'Accesso 24 ore', 'Ricarica elettrica'],
          },
          {
            tag: 'Movimentazione',
            title: 'Carico, scarico e deposito',
            text: 'Area di manovra interna dedicata alle operazioni di carico e scarico, al riparo dagli agenti atmosferici. Porzioni di superficie perimetrabili a magazzino per la durata della lavorazione, con presa in carico e riconsegna concordate.',
            chips: ['Carico al coperto', 'Magazzino', 'Sopralluogo'],
          },
        ],
      },
      address: {
        eyebrow: 'Un solo indirizzo',
        title: 'Nessun trasferimento fra sistemazione e deposito.',
        text: "Vico Santa Maria a Cappella Vecchia 8b. L'intera dotazione necessaria alla lavorazione è contenuta nel medesimo stabile, con un referente unico per accessi, fornitori e orari.",
        bands: [
          { level: 'Piano appartamenti', value: '18 posti letto', side: 'Cinque unità, 325 mq' },
          {
            level: 'Piano wellness',
            value: 'Palestra e bagno turco',
            side: 'Riservato agli ospiti',
          },
          { level: 'Piano autorimessa', value: 'Oltre 1.000 mq', side: 'Oltre 100 posti auto' },
        ],
      },
      gallery: {
        eyebrow: 'Materiale fotografico',
        title: 'Cinque inquadrature, in ordine di lettura.',
        captions: [
          "Accesso carrabile, con riferimento dell'altezza",
          'Corsia centrale in prospettiva',
          'Posto auto con veicolo commerciale',
          'Area di carico e scarico',
          'Superficie libera, configurabile a magazzino',
        ],
        note: 'Spazi predisposti in attesa dei materiali. Ripresa orizzontale, illuminazione accesa, con una persona o un riferimento metrico in almeno due inquadrature per restituire la scala.',
      },
      specs: {
        eyebrow: 'Dati tecnici',
        title: 'Verificati sul posto.',
        rows: [
          { label: 'Superficie coperta', value: 'Oltre 1.000 mq' },
          { label: 'Posti auto', value: 'Oltre 100' },
          { label: 'Accesso', value: '24 ore, 365 giorni' },
          { label: 'Videosorveglianza', value: 'Integrale' },
          { label: 'Carico e scarico', value: 'Interno, al coperto' },
          { label: 'Ricarica elettrica', value: 'Disponibile' },
          { label: 'Posti letto', value: '18 in cinque unità' },
        ],
      },
      closing: {
        eyebrow: 'Presa in carico',
        title: 'Indicare date, mezzi e superficie necessaria.',
        text: 'Sopralluogo su appuntamento, disponibile anche in giornata. Preventivo formulato sul perimetro effettivo della lavorazione, non su tariffario standard.',
        contact: {
          rows: [
            { label: 'Referente', lines: ['Gian Piero Santopaolo'] },
            { label: 'Telefono', lines: ['+39 331 322 5577'], href: 'tel:+393313225577' },
            {
              label: 'Posta elettronica',
              lines: ['gianpiero@santopaoloboutiqueapartments.com'],
              href: 'mailto:gianpiero@santopaoloboutiqueapartments.com',
            },
            {
              label: 'Indirizzo',
              lines: ['Vico Santa Maria a Cappella Vecchia 8b', '80121 Napoli, Chiaia'],
            },
          ],
          hint: 'Per lavorazioni con esigenze di ricovero mezzi si consiglia il sopralluogo preliminare, indispensabile a verificare percorsi di accesso e spazi di manovra.',
        },
        form: {
          fields: {
            company: 'Produzione o società',
            name: 'Referente',
            email: 'Posta elettronica',
            phone: 'Telefono',
            type: 'Tipo di lavorazione',
            dates: 'Periodo',
            beds: 'Posti letto richiesti',
            vehicles: 'Mezzi da ricoverare',
            notes: 'Esigenze di superficie e note',
          },
          placeholders: {
            company: 'Ragione sociale',
            name: 'Nome e cognome',
            email: 'nome@societa.it',
            phone: '+39',
            dates: 'Dal, al',
            beds: 'Numero di persone',
            vehicles: 'Tipologia e quantità',
            notes: 'Metri quadri stimati per deposito, orari di accesso, esigenze di carico',
          },
          typeOptions: [
            'Lungometraggio o serie',
            'Pubblicità',
            'Servizio fotografico o moda',
            'Evento',
            'Altro',
          ],
          submit: 'Trasmetti il brief',
          sending: 'Trasmissione in corso',
          sent: 'Brief trasmesso',
          error: 'Trasmissione non riuscita, riprovare o scrivere direttamente.',
          fine: 'Riscontro entro ventiquattro ore lavorative. I dati trasmessi sono utilizzati esclusivamente per la formulazione del preventivo.',
        },
        foot: [
          'Santopaolo Boutique Apartments',
          'Santopaolo Asset Management S.r.l.',
          'Partita IVA 00744080631',
          'Napoli, Chiaia',
        ],
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
        title: 'Production base in Naples, accommodation and vehicle storage at a single address',
        description:
          'Eighteen beds across five units and over 1,000 covered square metres in the same building in Chiaia, Naples. Over 100 parking spaces, 24 hour access.',
      },
      hero: {
        eyebrow: 'Production base, Naples Chiaia',
        title: 'Accommodation and vehicle storage',
        titleMuted: 'at a single address.',
        text: 'Eighteen beds across five units and over a thousand covered square metres in the same building. No transfer between crew accommodation and vehicle storage.',
        cta: 'Send a brief',
      },
      ticker: [
        'Covered surface over 1,000 sqm',
        'Over 100 parking spaces',
        'Access 24 hours, 365 days',
        'Loading and unloading under cover',
        'Full video surveillance',
      ],
      surface: {
        eyebrow: 'Covered surface',
        value: '1,000',
        unit: 'Square metres, garage level',
        text1:
          'Over a thousand covered square metres beneath the guest units. Covered space in Chiaia is structurally scarce, and an area of this size has no equivalent in the district.',
        text2:
          'The space is not sold at a daily rate. It is set aside for the actual duration of the production, with formal handover on collection and return.',
        usesLabel: 'Use',
        uses: [
          {
            title: 'Vehicle storage',
            text: 'Over a hundred covered parking spaces, access twenty four hours a day.',
          },
          {
            title: 'Enclosed storage',
            text: 'Portions of the floor reserved for the duration of the production.',
          },
          {
            title: 'Manoeuvring and loading',
            text: 'Carried out indoors, sheltered from the weather.',
          },
        ],
      },
      scope: {
        eyebrow: 'Operational scope',
        title: 'Three functions within the same perimeter.',
        index: ['Accommodation', 'Storage', 'Handling'],
        panels: [
          {
            tag: 'Hospitality',
            title: 'Crew accommodation',
            text: 'Five units from 45 to 90 square metres, available individually or as a whole floor. Kitchen in every unit, shared laundry, gym and steam room on the wellness level. No time restrictions on arrivals and departures.',
            chips: ['18 beds', 'Whole floor', 'Laundry', 'Wellness'],
          },
          {
            tag: 'Storage',
            title: 'Vehicle and equipment storage',
            text: 'Technical vehicles and set equipment remain under cover for the full length of the shoot, under full video surveillance, with no need to unload onto the street at the end of the day.',
            chips: ['Video surveillance', '24 hour access', 'EV charging'],
          },
          {
            tag: 'Handling',
            title: 'Loading, unloading and storage',
            text: 'Indoor manoeuvring area for loading and unloading, sheltered from the weather. Portions of the floor can be enclosed as storage for the duration of the production, with handover agreed on collection and return.',
            chips: ['Indoor loading', 'Storage', 'Site visit'],
          },
        ],
      },
      address: {
        eyebrow: 'A single address',
        title: 'No transfer between accommodation and storage.',
        text: 'Vico Santa Maria a Cappella Vecchia 8b. Everything the production needs is contained within the same building, with a single point of contact for access, suppliers and schedules.',
        bands: [
          { level: 'Apartment level', value: '18 beds', side: 'Five units, 325 sqm' },
          { level: 'Wellness level', value: 'Gym and steam room', side: 'Reserved for guests' },
          { level: 'Garage level', value: 'Over 1,000 sqm', side: 'Over 100 parking spaces' },
        ],
      },
      gallery: {
        eyebrow: 'Photographic material',
        title: 'Five frames, in reading order.',
        captions: [
          'Vehicle entrance, with height reference',
          'Central aisle in perspective',
          'Parking space with commercial vehicle',
          'Loading and unloading area',
          'Open floor, configurable as storage',
        ],
        note: 'Slots awaiting material. Landscape orientation, lights on, with a person or a measuring reference in at least two frames to convey scale.',
      },
      specs: {
        eyebrow: 'Technical data',
        title: 'Verified on site.',
        rows: [
          { label: 'Covered surface', value: 'Over 1,000 sqm' },
          { label: 'Parking spaces', value: 'Over 100' },
          { label: 'Access', value: '24 hours, 365 days' },
          { label: 'Video surveillance', value: 'Full' },
          { label: 'Loading and unloading', value: 'Indoors, under cover' },
          { label: 'EV charging', value: 'Available' },
          { label: 'Beds', value: '18 across five units' },
        ],
      },
      closing: {
        eyebrow: 'Taking on the project',
        title: 'Provide dates, vehicles and the space required.',
        text: 'Site visit by appointment, available same day. Quotation based on the actual perimeter of the production, not on a standard rate card.',
        contact: {
          rows: [
            { label: 'Contact', lines: ['Gian Piero Santopaolo'] },
            { label: 'Telephone', lines: ['+39 331 322 5577'], href: 'tel:+393313225577' },
            {
              label: 'Email',
              lines: ['gianpiero@santopaoloboutiqueapartments.com'],
              href: 'mailto:gianpiero@santopaoloboutiqueapartments.com',
            },
            {
              label: 'Address',
              lines: ['Vico Santa Maria a Cappella Vecchia 8b', '80121 Naples, Chiaia'],
            },
          ],
          hint: 'For productions requiring vehicle storage a preliminary site visit is recommended, as it is the only way to verify access routes and manoeuvring space.',
        },
        form: {
          fields: {
            company: 'Production or company',
            name: 'Contact',
            email: 'Email',
            phone: 'Telephone',
            type: 'Type of production',
            dates: 'Dates',
            beds: 'Beds required',
            vehicles: 'Vehicles to store',
            notes: 'Space requirements and notes',
          },
          placeholders: {
            company: 'Company name',
            name: 'First and last name',
            email: 'name@company.com',
            phone: '+39',
            dates: 'From, to',
            beds: 'Number of people',
            vehicles: 'Type and quantity',
            notes: 'Estimated square metres for storage, access times, loading requirements',
          },
          typeOptions: [
            'Feature or series',
            'Advertising',
            'Photo shoot or fashion',
            'Event',
            'Other',
          ],
          submit: 'Send the brief',
          sending: 'Sending',
          sent: 'Brief sent',
          error: 'Submission failed, please retry or write to us directly.',
          fine: 'Response within twenty four working hours. The information provided is used solely to prepare the quotation.',
        },
        foot: [
          'Santopaolo Boutique Apartments',
          'Santopaolo Asset Management S.r.l.',
          'VAT 00744080631',
          'Naples, Chiaia',
        ],
      },
    },
  },
};
