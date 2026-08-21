import type { Lang } from '../i18n/index';

/** The photographic material does not exist yet; the gallery section stays hidden until this flips to true. Captions and note below are ready. */
export const GALLERY_ENABLED = false;

/** Photography for the deep-section plates does not exist yet; graphic placeholders render until this flips to true. */
export const PLATES_ENABLED = false;

/**
 * Copy for the production base page, self-contained like the guide: only the
 * navbar label goes through the usual i18n dictionaries.
 */

export interface ProductionCopy {
  seo: { title: string; description: string };
  hero: {
    /** Mono line above the H1, already uppercase. */
    eyebrow: string;
    title: string;
    /** Mono address line under the H1, above the 44px red rule. */
    subtitle: string;
  };
  /** Single paragraph; `closing` renders in ivory at the end of the same paragraph. */
  summary: { label: string; text: string; closing: string };
  /** Three equal cards, numbered 01-03 from the index; each links down to its section anchor. */
  functions: { title: string; text: string; linkLabel: string; linkHref: string }[];
  /** Deep sections under the three-function grid; the ids alloggi/spazio/autorimessa are fixed anchors. */
  sections: {
    /** Labels of the fixed left spine, in section order. */
    spine: string[];
    alloggi: {
      titleLines: string[];
      lead: string;
      /** Rendered in ivory at the end of the same paragraph. */
      leadClosing: string;
      rail: string[];
      units: { name: string; note: string; area: string; guests: string; href: string }[];
    };
    spazio: {
      titleLines: string[];
      lead: string;
      leadClosing: string;
      rail: string[];
      usesLabel: string;
      uses: { title: string; text: string }[];
      plates: { caption1: string; caption2: string; src: string }[];
    };
    autorimessa: {
      titleLines: string[];
      lead: string;
      leadClosing: string;
      rail: string[];
      plates: { caption1: string; caption2: string; src: string }[];
      cta: string;
    };
  };
  /** Items numbered from their index and looped twice by the track. */
  ticker: string[];
  gallery: {
    eyebrow: string;
    title: string;
    /** Captions of the five photo slots, in grid order. */
    captions: string[];
    note: string;
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
      eyebrow: 'SANTOPAOLO BOUTIQUE APARTMENTS',
      title: 'Production Base',
      subtitle: 'VICO SANTA MARIA A CAPPELLA VECCHIA 8B, CHIAIA, NAPOLI',
    },
    summary: {
      label: 'SINTESI DEL SERVIZIO',
      text: 'Tre funzioni normalmente distribuite su sedi diverse, accorpate in un solo indirizzo: ricettività per maestranze e cast, spazio coperto libero configurabile per la lavorazione, autorimessa per movimentazione mezzi e merci con presidio 24 ore.',
      closing: 'Un solo interlocutore, un solo accesso, nessuno spostamento tra basi durante la lavorazione.',
    },
    functions: [
      {
        title: 'Alloggi',
        text: "Cinque appartamenti sullo stesso piano, da 45 a 90 mq, fino a 18 ospiti. Occupazione parziale o esclusiva dell'intero piano per l'intera durata della lavorazione. Wellness floor con palestra e bagno turco a servizio del piano.",
        linkLabel: 'Vedi la sezione',
        linkHref: '#alloggi',
      },
      {
        title: 'Spazio configurabile',
        text: 'Oltre 1.000 mq coperti liberi, configurabili sulla singola lavorazione. Deposito attrezzatura e scenografia, allestimento, magazzino costumi, sartoria, trucco, set interno. Accesso mezzi al coperto.',
        linkLabel: 'Vedi la sezione',
        linkHref: '#spazio',
      },
      {
        title: 'Autorimessa',
        text: 'Accesso 24/7, 365 giorni. Carico e scarico al coperto, aree di drop off e attesa mezzi, presa in carico merci e consegne da personale qualificato, videosorveglianza integrale.',
        linkLabel: 'Vedi la sezione',
        linkHref: '#autorimessa',
      },
    ],
    sections: {
      spine: ['Alloggi', 'Spazio', 'Autorimessa'],
      alloggi: {
        titleLines: ['Cinque appartamenti', 'sullo stesso piano'],
        lead: 'Ricettività per maestranze e cast nello stesso edificio della base operativa. Il piano si occupa per intero o in parte, per la durata della lavorazione, con una sola presa in carico e un solo referente. Ogni unità ha cucina, lavatrice e pulizia interna quotidiana.',
        leadClosing: 'Chi lavora e chi dorme sta allo stesso indirizzo, nessuno spostamento tra basi.',
        rail: ['Cinque unità', 'Da 45 a 90 mq', 'Fino a 18 ospiti', 'Wellness floor'],
        units: [
          { name: 'Appartamento 1', note: 'Due camere, due bagni, vasca e doccia', area: '90 mq', guests: '6 ospiti', href: '/apartments/santopaolo-1' },
          { name: 'Appartamento 2', note: 'Camera con bagno en suite e vasca', area: '60 mq', guests: '2 ospiti', href: '/apartments/santopaolo-2' },
          { name: 'Appartamento 3', note: 'Camera e divano letto, doccia', area: '70 mq', guests: '4 ospiti', href: '/apartments/santopaolo-3' },
          { name: 'Appartamento 4', note: 'Camera e divano letto, doccia', area: '60 mq', guests: '4 ospiti', href: '/apartments/santopaolo-4' },
          { name: 'Appartamento 5', note: 'Monolocale, doccia', area: '45 mq', guests: '2 ospiti', href: '/apartments/santopaolo-5' },
        ],
      },
      spazio: {
        titleLines: ['Oltre 1.000 mq coperti,', 'configurati sulla lavorazione'],
        lead: 'Superficie libera al coperto, assegnata per la durata della lavorazione e ripartita sulle esigenze della singola produzione. I mezzi entrano, scaricano e stazionano dentro il perimetro, senza occupare suolo pubblico.',
        leadClosing: 'Si concorda la metratura, il periodo e le condizioni di accesso, il resto lo configurate voi.',
        rail: ['Superficie assegnata a metratura', 'Accesso mezzi al coperto', 'Presidio 24 ore'],
        usesLabel: 'Impiego',
        uses: [
          {
            title: 'Deposito merce e attrezzatura',
            text: "Scenografia, materiale tecnico, magazzino costumi, sartoria. Presa in carico delle consegne da personale qualificato, movimentazione interna, area assegnata per l'intera lavorazione.",
          },
          {
            title: 'Camion di produzione',
            text: "Stazionamento al coperto dei mezzi di produzione fuori dalla viabilità cittadina, con aree di manovra e di attesa. Carico e scarico all'interno, senza permessi di occupazione stradale.",
          },
          {
            title: 'Mezzi da ripresa',
            text: "Rimessaggio di camera car, gruppi elettrogeni, mezzi luci e attrezzature su ruote, con accesso diretto all'area di lavorazione e ai reparti alloggiati al piano.",
          },
        ],
        plates: [
          { caption1: 'Lastra 01', caption2: 'Superficie libera configurabile', src: '' },
          { caption1: 'Lastra 02', caption2: 'Accesso carrabile', src: '' },
          { caption1: 'Lastra 03', caption2: 'Area di carico e scarico', src: '' },
        ],
      },
      autorimessa: {
        titleLines: ['Vetture di cast e troupe,', 'allo stesso indirizzo'],
        lead: "Stalli al coperto per le vetture di cast, troupe e reparti, nello stesso edificio degli alloggi. Accesso 24 ore su 24, 365 giorni all'anno, videosorveglianza integrale su tutto il perimetro, drop off e aree di attesa per i mezzi in arrivo.",
        leadClosing: 'Chi arriva di notte a fine lavorazione entra, lascia il mezzo e sale al piano.',
        rail: ['Accesso 24/7, 365 giorni', 'Videosorveglianza integrale', 'Carico e scarico al coperto', 'Ricarica EV'],
        plates: [
          { caption1: 'Lastra 04', caption2: 'Corsia centrale in prospettiva', src: '' },
          { caption1: 'Lastra 05', caption2: 'Stallo con veicolo commerciale', src: '' },
        ],
        cta: 'Richiedi un sopralluogo',
      },
    },
    ticker: [
      'Oltre 1.000 mq coperti',
      'Accesso 24/7, 365 giorni',
      'Carico e scarico al coperto',
      'Videosorveglianza integrale',
    ],
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
      eyebrow: 'SANTOPAOLO BOUTIQUE APARTMENTS',
      title: 'Production Base',
      subtitle: 'VICO SANTA MARIA A CAPPELLA VECCHIA 8B, CHIAIA, NAPLES',
    },
    summary: {
      label: 'SERVICE SUMMARY',
      text: 'Three functions that usually sit on separate sites, brought together at one address: accommodation for crew and cast, open covered space configured around each production, and vehicle storage with covered load in and load out, staffed 24 hours a day.',
      closing: 'One point of contact, one entrance, no moving between bases during the shoot.',
    },
    functions: [
      {
        title: 'Accommodation',
        text: 'Five apartments on one floor, 45 to 90 sqm, sleeps up to 18. Take part of the floor or all of it for the length of the production. Wellness floor with gym and steam room serving the apartments.',
        linkLabel: 'See the section',
        linkHref: '#alloggi',
      },
      {
        title: 'Configurable space',
        text: 'Over 1,000 sqm of open covered space, configured production by production. Equipment and set storage, build and fit out, costume store, wardrobe, makeup, interior sets. Covered vehicle access.',
        linkLabel: 'See the section',
        linkHref: '#spazio',
      },
      {
        title: 'Vehicle storage',
        text: '24/7 access, 365 days. Covered load in and load out, drop off and holding areas for vehicles, goods and deliveries received by trained personnel, full CCTV coverage.',
        linkLabel: 'See the section',
        linkHref: '#autorimessa',
      },
    ],
    sections: {
      spine: ['Accommodation', 'Space', 'Vehicle storage'],
      alloggi: {
        titleLines: ['Five apartments', 'on one floor'],
        lead: 'Accommodation for crew and cast in the same building as the operating base. Take the whole floor or part of it for the length of the production, handled by one contact. Every unit has a kitchen, a washing machine and daily cleaning.',
        leadClosing: 'The people working and the people sleeping are at one address, with no moving between bases.',
        rail: ['Five units', '45 to 90 sqm', 'Sleeps up to 18', 'Wellness floor'],
        units: [
          { name: 'Apartment 1', note: 'Two bedrooms, two bathrooms, bath and shower', area: '90 sqm', guests: 'Sleeps 6', href: '/en/apartments/santopaolo-1' },
          { name: 'Apartment 2', note: 'Bedroom with en suite bathroom and bath', area: '60 sqm', guests: 'Sleeps 2', href: '/en/apartments/santopaolo-2' },
          { name: 'Apartment 3', note: 'Bedroom and sofa bed, shower', area: '70 sqm', guests: 'Sleeps 4', href: '/en/apartments/santopaolo-3' },
          { name: 'Apartment 4', note: 'Bedroom and sofa bed, shower', area: '60 sqm', guests: 'Sleeps 4', href: '/en/apartments/santopaolo-4' },
          { name: 'Apartment 5', note: 'Studio, shower', area: '45 sqm', guests: 'Sleeps 2', href: '/en/apartments/santopaolo-5' },
        ],
      },
      spazio: {
        titleLines: ['Over 1,000 sqm covered,', 'configured around the production'],
        lead: 'Open covered space, assigned for the length of the production and divided up around what each production needs. Vehicles come in, unload and stay inside the perimeter, with no street occupation permits.',
        leadClosing: 'We agree the area, the dates and the access terms, you configure the rest.',
        rail: ['Area assigned by the square metre', 'Covered vehicle access', 'Staffed 24 hours'],
        usesLabel: 'Use',
        uses: [
          {
            title: 'Goods and equipment storage',
            text: 'Sets, technical kit, costume store, wardrobe. Deliveries received by trained personnel, moved internally, with an area assigned for the whole production.',
          },
          {
            title: 'Production trucks',
            text: 'Covered standing for production vehicles off the city road network, with turning and holding areas. Load in and load out inside the building, with no street occupation permits.',
          },
          {
            title: 'Camera and lighting vehicles',
            text: 'Storage for camera cars, generators, lighting trucks and wheeled kit, with direct access to the working area and to the departments housed on the floor.',
          },
        ],
        plates: [
          { caption1: 'Plate 01', caption2: 'Open configurable space', src: '' },
          { caption1: 'Plate 02', caption2: 'Vehicle entrance', src: '' },
          { caption1: 'Plate 03', caption2: 'Load in and load out area', src: '' },
        ],
      },
      autorimessa: {
        titleLines: ['Cast and crew vehicles,', 'at the same address'],
        lead: 'Covered spaces for cast, crew and department vehicles, in the same building as the apartments. Access 24 hours a day, 365 days a year, full CCTV coverage across the perimeter, drop off and holding areas for arriving vehicles.',
        leadClosing: 'Anyone arriving late after a shoot drives in, leaves the vehicle and goes up to the floor.',
        rail: ['24/7 access, 365 days', 'Full CCTV coverage', 'Covered load in and load out', 'EV charging'],
        plates: [
          { caption1: 'Plate 04', caption2: 'Central aisle in perspective', src: '' },
          { caption1: 'Plate 05', caption2: 'Bay with commercial vehicle', src: '' },
        ],
        cta: 'Request a site visit',
      },
    },
    ticker: [
      'Over 1,000 sqm under cover',
      '24 hour access, 365 days',
      'Covered load in and load out',
      'Full CCTV coverage',
    ],
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
