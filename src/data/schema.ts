import type { Lang } from '../i18n/index';
import apartmentsData from './apartments.json';

/**
 * JSON-LD graph for the public site.
 *
 * Every page emits a single `@graph` block. Persistent entities (Organization,
 * WebSite, LodgingBusiness, the five Accommodation nodes) carry stable `@id`s
 * that are byte-identical on the IT and EN pages, so consumers merge them
 * instead of seeing two competing businesses. Only WebPage and BreadcrumbList
 * are per-URL, and therefore per-language.
 */

export const SITE = 'https://www.santopaoloapartments.com';

export const ORGANIZATION_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;
export const LODGING_ID = `${SITE}/#lodging`;
export const LOGO_ID = `${SITE}/#logo`;

export const accommodationId = (slug: string) => `${SITE}/apartments/${slug}/#accommodation`;

/* ------------------------------------------------------------------ types */

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export interface JsonLdNode {
  '@type': string | string[];
  '@id'?: string;
  [key: string]: JsonLdValue | undefined;
}

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
}

/** A pointer to a node defined elsewhere in the same graph. */
export type JsonLdRef = { '@id': string };

const ref = (id: string): JsonLdRef => ({ '@id': id });

/* -------------------------------------------------------------- constants */

const NAME = 'Santopaolo Boutique Apartments';
const TELEPHONE = '+393313225577';
const EMAIL = 'gianpiero@santopaoloboutiqueapartments.com';

const SAME_AS = [
  'https://www.instagram.com/santopaoloboutiqueapartments',
  'https://www.booking.com/hotel/it/santopaolo-boutique-apartment.html',
  'https://www.agoda.com/santopaolo-boutique-apartment/hotel/naples-it.html',
  'https://www.hotels.com/ho4084786496',
];

const POSTAL_ADDRESS: JsonLdValue = {
  '@type': 'PostalAddress',
  streetAddress: 'Vico Santa Maria a Cappella Vecchia 8b',
  addressLocality: 'Napoli',
  addressRegion: 'NA',
  postalCode: '80121',
  addressCountry: 'IT',
};

const GEO: JsonLdValue = {
  '@type': 'GeoCoordinates',
  latitude: 40.8343,
  longitude: 14.24247,
};

/* ------------------------------------------------------------ label maps */

/**
 * Human-readable strings resolved by page language. The `@id`s never vary, so
 * an IT and an EN page describe one entity in two languages rather than two
 * competing entities.
 */
type Localized = Record<Lang, string>;

const AMENITY_LABELS = {
  gym: { it: 'Palestra attrezzata', en: 'Fully equipped gym' },
  steamRoom: { it: 'Bagno turco', en: 'Steam room' },
  garage: {
    it: 'Garage coperto custodito oltre 1.000 mq, accesso 24 ore',
    en: 'Covered guarded garage, over 1,000 sqm, 24 hour access',
  },
  evCharging: { it: 'Ricarica veicoli elettrici', en: 'Electric vehicle charging' },
  sharedLaundry: { it: 'Lavanderia comune', en: 'Shared laundry' },
  lift: { it: 'Ascensore', en: 'Lift' },
  wifi: { it: 'WiFi', en: 'WiFi' },
  airConditioning: { it: 'Aria condizionata', en: 'Air conditioning' },
  kitchen: { it: 'Cucina attrezzata', en: 'Fully equipped kitchen' },
  safe: { it: 'Cassaforte', en: 'Safe' },
  linen: { it: 'Biancheria e asciugamani inclusi', en: 'Linen and towels included' },
  lateCheckIn: { it: 'Late check-in', en: 'Late check-in' },

  // Per-unit deltas.
  bathroomWithBathtub: { it: 'Bagno con vasca', en: 'Bathroom with bathtub' },
  bathroomWithShower: { it: 'Bagno con doccia', en: 'Bathroom with shower' },
  secondBathroomWithShower: { it: 'Secondo bagno con doccia', en: 'Second bathroom with shower' },
  ensuiteWithBathtub: { it: 'Bagno en-suite con vasca', en: 'En-suite bathroom with bathtub' },
  ensuiteWithShower: { it: 'Bagno en-suite con doccia', en: 'En-suite bathroom with shower' },
  masterWithEnsuite: {
    it: 'Camera principale con bagno en-suite',
    en: 'Master bedroom with en-suite bathroom',
  },
  microwave: { it: 'Microonde', en: 'Microwave' },
  armchair: { it: 'Poltrona', en: 'Armchair' },
  separateLivingArea: { it: 'Zona giorno separata', en: 'Separate living area' },
  kitchenette: { it: 'Angolo cottura', en: 'Kitchenette' },
} as const satisfies Record<string, Localized>;

type AmenityKey = keyof typeof AMENITY_LABELS;

/** Free-text on purpose: "letto alla francese" has no BedType equivalent. */
const BED_LABELS = {
  double: { it: 'Letto matrimoniale', en: 'Double bed' },
  french: { it: 'Letto alla francese', en: 'French bed, small double' },
  doubleSofa: { it: 'Divano letto doppio', en: 'Double sofa bed' },
} as const satisfies Record<string, Localized>;

type BedKey = keyof typeof BED_LABELS;

const OCCUPANCY_UNIT: Localized = { it: 'persone', en: 'people' };

/**
 * Toponyms for the Place nodes. `addressLocality` deliberately stays "Napoli"
 * in both languages: that is the postal form of the address, not prose.
 */
const PLACE_LABELS = {
  districtName: { it: 'Chiaia', en: 'Chiaia' },
  districtAlternateName: { it: 'Chiaia, Naples', en: 'Chiaia, Naples' },
  cityName: { it: 'Napoli', en: 'Naples' },
  cityAlternateName: { it: 'Naples', en: 'Napoli' },
} as const satisfies Record<string, Localized>;

const DISTRICT_SAME_AS = [
  'https://www.wikidata.org/wiki/Q1071579',
  'https://it.wikipedia.org/wiki/Chiaia',
  'https://en.wikipedia.org/wiki/Chiaia',
];

const CITY_SAME_AS = [
  'https://www.wikidata.org/wiki/Q2634',
  'https://it.wikipedia.org/wiki/Napoli',
  'https://en.wikipedia.org/wiki/Naples',
];

/** Shared by every unit and by the building itself. */
const COMMON_AMENITY_KEYS: AmenityKey[] = [
  'gym',
  'steamRoom',
  'garage',
  'evCharging',
  'sharedLaundry',
  'lift',
  'wifi',
  'airConditioning',
  'kitchen',
  'safe',
  'linen',
  'lateCheckIn',
];

const amenity = (key: AmenityKey, lang: Lang): JsonLdValue => ({
  '@type': 'LocationFeatureSpecification',
  name: AMENITY_LABELS[key][lang],
  value: true,
});

/** Chiaia inside Naples. Anonymous nodes: they carry no `@id` to keep stable. */
const containedInPlace = (lang: Lang): JsonLdValue => ({
  '@type': 'Place',
  name: PLACE_LABELS.districtName[lang],
  alternateName: PLACE_LABELS.districtAlternateName[lang],
  sameAs: DISTRICT_SAME_AS,
  containedInPlace: {
    '@type': 'Place',
    name: PLACE_LABELS.cityName[lang],
    alternateName: PLACE_LABELS.cityAlternateName[lang],
    sameAs: CITY_SAME_AS,
  },
});

/* ------------------------------------------------------------ url helpers */

/** Normalises to exactly one trailing slash so `@id`s never drift apart. */
export function canonicalPath(pathname: string): string {
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export function absoluteUrl(pathname: string): string {
  return `${SITE}${canonicalPath(pathname)}`;
}

/** Strips the `/en` prefix, giving the language-neutral route. */
function neutralPath(pathname: string): string {
  const path = canonicalPath(pathname);
  return path === '/en/' ? '/' : path.replace(/^\/en\//, '/');
}

function localePath(lang: Lang, neutral: string): string {
  if (lang === 'it') return neutral;
  return neutral === '/' ? '/en/' : `/en${neutral}`;
}

/** Detail page of a unit in the language being rendered. */
export function unitUrl(slug: string, lang: Lang): string {
  return `${SITE}${localePath(lang, canonicalPath(`/apartments/${slug}`))}`;
}

/* ------------------------------------------------- per-unit schema extras */

interface BedSpec {
  type: BedKey;
  numberOfBeds: number;
}

interface UnitSchemaExtras {
  /** Rooms beyond bedrooms are not derivable from apartments.json. */
  numberOfRooms: number;
  beds: BedSpec[];
  /** Amenities this unit has on top of COMMON_AMENITY_KEYS. */
  extraAmenities: AmenityKey[];
}

const UNIT_EXTRAS: Record<string, UnitSchemaExtras> = {
  'santopaolo-1': {
    numberOfRooms: 3,
    beds: [
      { type: 'double', numberOfBeds: 1 },
      { type: 'french', numberOfBeds: 1 },
      { type: 'doubleSofa', numberOfBeds: 1 },
    ],
    extraAmenities: [
      'bathroomWithBathtub',
      'secondBathroomWithShower',
      'microwave',
      'armchair',
      'masterWithEnsuite',
    ],
  },
  'santopaolo-2': {
    numberOfRooms: 2,
    beds: [{ type: 'double', numberOfBeds: 1 }],
    extraAmenities: ['ensuiteWithBathtub', 'separateLivingArea'],
  },
  'santopaolo-3': {
    numberOfRooms: 2,
    beds: [
      { type: 'double', numberOfBeds: 1 },
      { type: 'doubleSofa', numberOfBeds: 1 },
    ],
    extraAmenities: ['bathroomWithShower'],
  },
  'santopaolo-4': {
    numberOfRooms: 2,
    beds: [
      { type: 'double', numberOfBeds: 1 },
      { type: 'doubleSofa', numberOfBeds: 1 },
    ],
    extraAmenities: ['bathroomWithShower', 'microwave'],
  },
  'santopaolo-5': {
    numberOfRooms: 1,
    beds: [{ type: 'double', numberOfBeds: 1 }],
    extraAmenities: ['ensuiteWithShower', 'microwave', 'kitchenette'],
  },
};

/* ---------------------------------------------------------------- builders */

export function buildOrganization(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: NAME,
    legalName: 'Santopaolo Asset Management S.r.l.',
    vatID: '00744080631',
    taxID: '00744080631',
    url: `${SITE}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': LOGO_ID,
      url: `${SITE}/santopaolo-logo-email.png`,
      contentUrl: `${SITE}/santopaolo-logo-email.png`,
      width: 460,
      height: 384,
      caption: NAME,
    },
    image: ref(LOGO_ID),
    email: EMAIL,
    telephone: TELEPHONE,
    address: POSTAL_ADDRESS,
    sameAs: SAME_AS,
  };
}

export function buildWebSite(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE}/`,
    name: NAME,
    publisher: ref(ORGANIZATION_ID),
    inLanguage: ['it-IT', 'en-GB'],
  };
}

export function buildLodgingBusiness(lang: Lang): JsonLdNode {
  return {
    '@type': 'LodgingBusiness',
    '@id': LODGING_ID,
    name: NAME,
    parentOrganization: ref(ORGANIZATION_ID),
    url: `${SITE}/`,
    telephone: TELEPHONE,
    email: EMAIL,
    address: POSTAL_ADDRESS,
    geo: GEO,
    containedInPlace: containedInPlace(lang),
    checkinTime: '14:00',
    checkoutTime: '10:00',
    numberOfRooms: 5,
    petsAllowed: false,
    smokingAllowed: false,
    availableLanguage: ['it', 'en'],
    sameAs: SAME_AS,
    amenityFeature: COMMON_AMENITY_KEYS.map(key => amenity(key, lang)),
    containsPlace: apartmentsData.map(unit => ref(accommodationId(unit.slug))),
  };
}

/**
 * Identity-only node for the four units a page is not about. `containsPlace`
 * on LodgingBusiness points at all five, so all five must resolve to something
 * on every page; the full description belongs on the unit's own page.
 */
export function buildAccommodationStub(
  unit: (typeof apartmentsData)[number],
  lang: Lang
): JsonLdNode {
  return {
    '@type': 'Apartment',
    '@id': accommodationId(unit.slug),
    // The name is a proper noun, identical in both languages.
    name: unit.name,
    url: unitUrl(unit.slug, lang),
    image: `${SITE}${unit.gallery[0].src}`,
  };
}

export function buildAccommodation(
  unit: (typeof apartmentsData)[number],
  lang: Lang
): JsonLdNode {
  const extras = UNIT_EXTRAS[unit.slug];
  if (!extras) throw new Error(`schema.ts: no UNIT_EXTRAS entry for "${unit.slug}"`);

  return {
    '@type': 'Apartment',
    '@id': accommodationId(unit.slug),
    name: unit.name,
    description: lang === 'it' ? unit.description_it : unit.description_en,
    containedInPlace: ref(LODGING_ID),
    // Points at the page being rendered; the @id stays anchored to the IT URL.
    url: unitUrl(unit.slug, lang),
    image: `${SITE}${unit.gallery[0].src}`,
    address: POSTAL_ADDRESS,
    geo: GEO,
    identifier: [
      { '@type': 'PropertyValue', name: 'CIN', value: unit.cin },
      { '@type': 'PropertyValue', name: 'CIR', value: unit.cir },
    ],
    floorSize: {
      '@type': 'QuantitativeValue',
      value: unit.size_sqm,
      unitCode: 'MTK',
    },
    numberOfBedrooms: unit.bedrooms,
    numberOfRooms: extras.numberOfRooms,
    numberOfBathroomsTotal: unit.bathrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: unit.max_guests,
      unitText: OCCUPANCY_UNIT[lang],
    },
    bed: extras.beds.map(b => ({
      '@type': 'BedDetails',
      typeOfBed: BED_LABELS[b.type][lang],
      numberOfBeds: b.numberOfBeds,
    })),
    amenityFeature: [...COMMON_AMENITY_KEYS, ...extras.extraAmenities].map(key =>
      amenity(key, lang)
    ),
  };
}

/* ------------------------------------------------------------ breadcrumbs */

const SEGMENT_LABELS: Record<string, Record<Lang, string>> = {
  apartments: { it: 'Appartamenti', en: 'Apartments' },
  wellness: { it: 'Wellness', en: 'Wellness' },
  concierge: { it: 'Concierge', en: 'Concierge' },
  services: { it: 'Servizi', en: 'Services' },
  contact: { it: 'Contatti', en: 'Contact' },
  book: { it: 'Prenota', en: 'Book' },
  privacy: { it: 'Privacy Policy', en: 'Privacy Policy' },
  terms: { it: 'Termini e Condizioni', en: 'Terms & Conditions' },
};

const HOME_LABEL: Record<Lang, string> = { it: 'Home', en: 'Home' };

const unitNameBySlug = new Map(apartmentsData.map(u => [u.slug, u.name]));

function segmentLabel(segment: string, lang: Lang): string | null {
  return SEGMENT_LABELS[segment]?.[lang] ?? unitNameBySlug.get(segment) ?? null;
}

/**
 * Home > … > current page, with item URLs in the language being rendered.
 * Returns null on the home page, which has no trail of its own.
 */
export function buildBreadcrumbList(lang: Lang, pathname: string): JsonLdNode | null {
  const neutral = neutralPath(pathname);
  if (neutral === '/') return null;

  const segments = neutral.split('/').filter(Boolean);
  const items: JsonLdValue[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: HOME_LABEL[lang],
      item: `${SITE}${localePath(lang, '/')}`,
    },
  ];

  let walked = '';
  for (const segment of segments) {
    walked += `/${segment}`;
    const name = segmentLabel(segment, lang);
    // An unmapped segment means a new route was added without a label; skip it
    // rather than emitting a raw slug as a crumb.
    if (!name) continue;
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name,
      item: `${SITE}${localePath(lang, canonicalPath(walked))}`,
    });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE}${localePath(lang, neutral)}#breadcrumb`,
    itemListElement: items,
  };
}

/* -------------------------------------------------------------- assembly */

export interface PageGraphOptions {
  lang: Lang;
  pathname: string;
  title: string;
  description: string;
  /** Slug of the unit when rendering an apartment detail page. */
  apartmentSlug?: string;
}

function buildWebPage(opts: PageGraphOptions, breadcrumbId: string | null): JsonLdNode {
  const url = absoluteUrl(opts.pathname);
  const node: JsonLdNode = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    isPartOf: ref(WEBSITE_ID),
    about: ref(LODGING_ID),
    publisher: ref(ORGANIZATION_ID),
    inLanguage: opts.lang === 'it' ? 'it-IT' : 'en-GB',
  };
  if (breadcrumbId) node.breadcrumb = ref(breadcrumbId);
  if (opts.apartmentSlug) node.mainEntity = ref(accommodationId(opts.apartmentSlug));
  return node;
}

/**
 * Collapses nodes sharing an `@id`, keeping the richer definition. Guards
 * against the same entity being emitted twice with different depth.
 */
function dedupeById(nodes: JsonLdNode[]): JsonLdNode[] {
  const byId = new Map<string, JsonLdNode>();
  const anonymous: JsonLdNode[] = [];

  for (const node of nodes) {
    const id = node['@id'];
    if (!id) {
      anonymous.push(node);
      continue;
    }
    const existing = byId.get(id);
    if (!existing || Object.keys(node).length > Object.keys(existing).length) {
      byId.set(id, node);
    }
  }

  return [...byId.values(), ...anonymous];
}

/**
 * The single `@graph` emitted per page. Organization, WebSite and
 * LodgingBusiness are repeated on every page on purpose: consumers evaluate
 * structured data one page at a time, so a bare `{"@id": …}` pointing at a node
 * defined only on the home page would dangle. Stable `@id`s make the repetition
 * a merge, not a duplicate. The units appear as identity-only stubs except on
 * their own page, which carries the full description.
 */
export function buildPageGraph(opts: PageGraphOptions): JsonLdGraph {
  const breadcrumb = buildBreadcrumbList(opts.lang, opts.pathname);

  const nodes: JsonLdNode[] = [
    buildOrganization(),
    buildWebSite(),
    buildLodgingBusiness(opts.lang),
    ...apartmentsData.map(unit =>
      unit.slug === opts.apartmentSlug
        ? buildAccommodation(unit, opts.lang)
        : buildAccommodationStub(unit, opts.lang)
    ),
    buildWebPage(opts, breadcrumb ? (breadcrumb['@id'] as string) : null),
  ];

  if (breadcrumb) nodes.push(breadcrumb);

  return {
    '@context': 'https://schema.org',
    '@graph': dedupeById(nodes),
  };
}
