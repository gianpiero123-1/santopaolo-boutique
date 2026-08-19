import type { Lang } from '../i18n/index';

/** The photographic material does not exist yet; the gallery section stays hidden until this flips to true. Captions and note below are ready. */
export const GALLERY_ENABLED = false;

/**
 * Copy for the production base page, self-contained like the guide: only the
 * navbar label goes through the usual i18n dictionaries.
 */

export interface ProductionCopy {
  seo: { title: string; description: string };
  hero: {
    eyebrow: string;
    /** First line of the H1; `titleAccent` follows on its own line in brand red italic. */
    title: string;
    titleAccent: string;
    /** Mono rail under the H1, one line per entry, strings already uppercase. */
    specs: string[];
    cta: string;
  };
  /** Items numbered from their index and looped twice by the track. */
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
}

export const PRODUCTION_COPY: Record<Lang, ProductionCopy> = {
  it: {
    seo: {
      title: 'Base per produzioni a Napoli, ricettività e rimessaggio a un solo indirizzo',
      description:
        'Fino a 18 ospiti in cinque unità e oltre 1.000 metri quadri coperti nello stesso stabile a Chiaia, Napoli. Accesso 24/7.',
    },
    hero: {
      eyebrow: 'Production base, Chiaia, Napoli',
      title: 'Alloggio troupe, parcheggio e rimessaggio',
      titleAccent: 'un solo indirizzo.',
      specs: ['FINO A 18 OSPITI, CINQUE UNITÀ', 'OLTRE 1.000 MQ AL COPERTO', 'ACCESSO 24/7, 365 GIORNI'],
      cta: 'Trasmetti un brief',
    },
    ticker: [
      'Oltre 1.000 mq coperti',
      'Accesso 24/7, 365 giorni',
      'Carico e scarico al coperto',
      'Videosorveglianza integrale',
    ],
    surface: {
      eyebrow: 'Superficie coperta',
      value: '1.000',
      unit: 'Metri quadri, piano autorimessa',
      text1:
        'Oltre mille metri quadri coperti sotto le unità ricettive. A Chiaia la superficie coperta è scarsa, e una metratura simile non esiste altrove nel quartiere.',
      text2:
        'Non si affitta a giornata. Si perimetra sulla durata della lavorazione, con presa in carico e riconsegna formalizzate.',
      usesLabel: 'Destinazione',
      uses: [
        {
          title: 'Rimessaggio mezzi',
          text: 'Rimessaggio e stoccaggio al coperto, accesso 24/7.',
        },
        {
          title: 'Magazzino perimetrato',
          text: 'Porzioni di superficie riservate per la durata della lavorazione.',
        },
        {
          title: 'Manovra e carico',
          text: 'Spazio di manovra interno, nessuna operazione su strada.',
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
          title: 'Alloggio delle maestranze',
          text: 'Cinque unità da 45 a 90 metri quadri, disponibili singolarmente o a piano intero. Cucina e lavatrice in ogni unità, pulizia interna quotidiana, palestra e bagno turco al piano wellness. Ingressi e uscite senza vincoli di orario.',
          chips: ['Fino a 18 ospiti', 'Piano intero', 'Lavatrice in ogni unità', 'Pulizia quotidiana', 'Wellness'],
        },
        {
          tag: 'Rimessaggio',
          title: 'Rimessaggio di mezzi e attrezzature',
          text: 'Mezzi tecnici e attrezzatura di scena restano al coperto per tutta la durata delle riprese, sotto videosorveglianza integrale. Nessuno scarico su strada a fine giornata.',
          chips: ['Videosorveglianza', 'Accesso 24/7', 'Ricarica elettrica'],
        },
        {
          tag: 'Movimentazione',
          title: 'Carico, scarico e magazzino',
          text: 'Area di manovra interna per il carico e lo scarico. Porzioni di superficie perimetrabili a magazzino per la durata della lavorazione, con presa in carico e riconsegna concordate.',
          chips: ['Carico al coperto', 'Magazzino', 'Sopralluogo'],
        },
      ],
    },
    address: {
      eyebrow: 'Un solo indirizzo',
      title: 'Nessun trasferimento fra alloggio e rimessaggio.',
      text: 'Vico Santa Maria a Cappella Vecchia 8b. Tutto ciò che serve alla lavorazione è nello stesso stabile, con un referente unico per accessi, fornitori e orari.',
      bands: [
        { level: 'Piano appartamenti', value: 'Fino a 18 ospiti', side: 'Cinque unità, 325 mq' },
        {
          level: 'Piano wellness',
          value: 'Palestra e bagno turco',
          side: 'Riservato agli ospiti',
        },
        { level: 'Piano autorimessa', value: 'Oltre 1.000 mq', side: 'Rimessaggio e magazzino' },
      ],
    },
    gallery: {
      eyebrow: 'Materiale fotografico',
      title: 'Cinque inquadrature, in ordine di lettura.',
      captions: [
        'Accesso carrabile',
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
        { label: 'Accesso', value: '24/7, 365 giorni' },
        { label: 'Videosorveglianza', value: 'Integrale' },
        { label: 'Carico e scarico', value: 'Al coperto' },
        { label: 'Ricarica elettrica', value: 'Disponibile' },
        { label: 'Capienza', value: 'Fino a 18 ospiti, cinque unità' },
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
        hint: 'Per lavorazioni con rimessaggio mezzi il sopralluogo preliminare verifica percorsi di accesso e spazi di manovra.',
      },
      form: {
        fields: {
          company: 'Produzione o società',
          name: 'Referente',
          email: 'Posta elettronica',
          phone: 'Telefono',
          type: 'Tipo di lavorazione',
          dates: 'Periodo',
          beds: 'Ospiti',
          vehicles: 'Mezzi in rimessaggio',
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
          notes: 'Metri quadri stimati a magazzino, orari di accesso, esigenze di carico',
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
        fine: 'Riscontro entro 24 ore lavorative. I dati trasmessi servono solo a formulare il preventivo.',
      },
      foot: [
        'Santopaolo Boutique Apartments',
        'Santopaolo Asset Management S.r.l.',
        'Partita IVA 00744080631',
        'Napoli, Chiaia',
      ],
    },
  },
  en: {
    seo: {
      title: 'Production base in Naples, crew accommodation and vehicle storage at one address',
      description:
        'Sleeps up to 18 across five units, with over 1,000 covered square metres in one building in Chiaia, Naples. 24 hour access, 365 days.',
    },
    hero: {
      eyebrow: 'Production base, Chiaia, Naples',
      title: 'Crew accommodation, parking and storage',
      titleAccent: 'one address.',
      specs: ['SLEEPS UP TO 18, FIVE UNITS', 'OVER 1,000 SQM UNDER COVER', '24/7 ACCESS, 365 DAYS'],
      cta: 'Send a brief',
    },
    ticker: [
      'Over 1,000 sqm under cover',
      '24 hour access, 365 days',
      'Covered load in and load out',
      'Full CCTV coverage',
    ],
    surface: {
      eyebrow: 'Covered floor area',
      value: '1,000',
      unit: 'Square metres, garage level',
      text1:
        'Over 1,000 covered square metres directly beneath the apartments. Covered space is scarce in Chiaia, and nothing of this size exists elsewhere in the district.',
      text2:
        'The floor is not let by the day. It is marked out for the length of the production, with documented handover at the start and end.',
      usesLabel: 'Use',
      uses: [
        {
          title: 'Vehicle storage',
          text: 'Covered parking with 24 hour access.',
        },
        {
          title: 'Secure storage',
          text: 'Sections of the floor set aside for the length of the production.',
        },
        {
          title: 'Load in and load out',
          text: 'Indoor manoeuvring space, no work on the street.',
        },
      ],
    },
    scope: {
      eyebrow: 'Operational scope',
      title: 'Three functions on one site.',
      index: ['Accommodation', 'Storage', 'Handling'],
      panels: [
        {
          tag: 'Hospitality',
          title: 'Crew accommodation',
          text: 'Five units from 45 to 90 square metres, taken singly or as a whole floor. Kitchen and washing machine in every unit, daily housekeeping, gym and steam room on the wellness level. Arrivals and departures at any hour.',
          chips: ['Sleeps 18', 'Whole floor', 'Washing machine in every unit', 'Daily housekeeping', 'Wellness'],
        },
        {
          tag: 'Storage',
          title: 'Vehicle and equipment storage',
          text: 'Unit vehicles and set equipment stay inside for the length of the shoot, under full CCTV coverage. Nothing goes back onto the street at the end of the day.',
          chips: ['Full CCTV', '24 hour access', 'EV charging'],
        },
        {
          tag: 'Handling',
          title: 'Load in, load out and storage',
          text: 'Indoor manoeuvring area for load in and load out. Sections of the floor can be closed off as storage for the length of the production, with handover agreed on collection and return.',
          chips: ['Load in and load out', 'Storage', 'Site visit'],
        },
      ],
    },
    address: {
      eyebrow: 'A single address',
      title: 'No shuttling between accommodation and storage.',
      text: 'Vico Santa Maria a Cappella Vecchia 8b. Everything the production needs sits in one building, with a single point of contact for access, suppliers and schedules.',
      bands: [
        { level: 'Apartment level', value: 'Sleeps 18', side: 'Five units, 325 sqm' },
        { level: 'Wellness level', value: 'Gym and steam room', side: 'Reserved for guests' },
        { level: 'Garage level', value: 'Over 1,000 sqm', side: 'Vehicle and goods storage' },
      ],
    },
    gallery: {
      eyebrow: 'Photography',
      title: 'Five views, in order.',
      captions: [
        'Vehicle entrance',
        'Central aisle in perspective',
        'Parking bay with a commercial vehicle',
        'Load in and load out area',
        'Open floor, configurable as storage',
      ],
      note: 'Awaiting photography. Landscape format, lights on, a person or scale reference in at least two frames.',
    },
    specs: {
      eyebrow: 'Technical data',
      title: 'Verified on site.',
      rows: [
        { label: 'Covered floor area', value: 'Over 1,000 sqm' },
        { label: 'Access', value: '24 hours, 365 days' },
        { label: 'CCTV', value: 'Full coverage' },
        { label: 'Load in and load out', value: 'Under cover' },
        { label: 'EV charging', value: 'Available' },
        { label: 'Capacity', value: 'Sleeps 18, five units' },
      ],
    },
    closing: {
      eyebrow: 'Enquiries',
      title: 'Send dates, vehicles and the floor space required.',
      text: 'Site visits by appointment, available same day. Quotes are based on the actual scope of the production, not on a standard rate card.',
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
        hint: 'Where vehicle storage is needed, an early site visit checks access routes and manoeuvring space.',
      },
      form: {
        fields: {
          company: 'Production or company',
          name: 'Contact name',
          email: 'Email',
          phone: 'Telephone',
          type: 'Type of production',
          dates: 'Dates',
          beds: 'Guests',
          vehicles: 'Vehicles to store',
          notes: 'Space requirements and notes',
        },
        placeholders: {
          company: 'Company name',
          name: 'Full name',
          email: 'name@company.com',
          phone: '+39',
          dates: 'From, to',
          beds: 'Number of people',
          vehicles: 'Type and number',
          notes: 'Estimated square metres of storage, access times, loading needs',
        },
        typeOptions: [
          'Feature film or series',
          'Commercial',
          'Stills or fashion shoot',
          'Event',
          'Other',
        ],
        submit: 'Send the brief',
        sending: 'Sending',
        sent: 'Brief sent',
        error: 'The brief did not go through. Try again or email us directly.',
        fine: 'We reply within 24 working hours. Your details are used only to prepare the quote.',
      },
      foot: [
        'Santopaolo Boutique Apartments',
        'Santopaolo Asset Management S.r.l.',
        'VAT 00744080631',
        'Naples, Chiaia',
      ],
    },
  },
};
