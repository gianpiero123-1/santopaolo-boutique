# AUDIT — Meccanismo di prenotazione del sito Santopaolo Boutique Apartments

Audit di sola lettura eseguito il 17/08/2026. Nessun file di codice è stato modificato.

---

## 1. Alberatura

Albero di `src/` fino a 3 livelli (esclusi `node_modules` e `.astro`):

```
src/
├── components/
│   ├── ApartmentCard.astro
│   ├── BookingWidget.astro
│   ├── Footer.astro
│   ├── Hero.astro
│   ├── JsonLd.astro
│   ├── LanguageSwitcher.astro
│   ├── Lightbox.astro
│   ├── Navbar.astro
│   ├── PhotoGallery.astro
│   ├── ServiceCard.astro
│   ├── WhatsAppFloat.astro
│   └── admin/
│       ├── AdminNavFoot.astro
│       ├── AdminTopbar.astro
│       ├── BookingDetail.astro
│       └── Calendar.astro
├── data/
│   ├── apartments.json
│   ├── schema.ts
│   └── services.json
├── i18n/
│   ├── en.ts
│   ├── index.ts
│   └── it.ts
├── layouts/
│   ├── AdminLayout.astro
│   └── BaseLayout.astro
├── lib/
│   ├── auth.ts
│   ├── constants.ts
│   ├── cron.ts
│   ├── dates.ts
│   ├── env.ts
│   ├── kalisi-client.ts
│   ├── queries.ts
│   ├── supabase-client.ts
│   ├── tax-report.ts
│   ├── tax.ts
│   ├── telegram-messages.ts
│   ├── telegram.ts
│   └── ui.ts
├── middleware.ts
├── pages/
│   ├── 404.astro
│   ├── book.astro
│   ├── contact.astro
│   ├── index.astro
│   ├── privacy.astro
│   ├── terms.astro
│   ├── wellness.astro
│   ├── admin/
│   │   ├── bookings.astro
│   │   ├── calendar.astro
│   │   ├── extra-services.astro
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── stats.astro
│   │   ├── tasks.astro
│   │   └── tax.astro
│   ├── apartments/
│   │   ├── [slug].astro
│   │   └── index.astro
│   ├── api/
│   │   ├── auth/          (login.ts, logout.ts)
│   │   ├── extra-services/ (index.ts, [id].ts)
│   │   ├── kalisi/        (sync.ts, sync-guests.ts, backfill-bookings.ts, backfill-guests.ts)
│   │   ├── notes/         (index.ts, [id].ts)
│   │   ├── tasks/         (index.ts, [id].ts)
│   │   ├── tax/           (report.ts)
│   │   └── telegram/      (checkin-reminders.ts, morning-brief.ts, task-reminders.ts)
│   ├── concierge/
│   │   ├── index.astro
│   │   └── services.astro
│   └── en/
│       ├── book.astro
│       ├── contact.astro
│       ├── index.astro
│       ├── privacy.astro
│       ├── terms.astro
│       ├── wellness.astro
│       ├── apartments/    ([slug].astro, index.astro)
│       └── concierge/     (index.astro, services.astro)
└── styles/
    ├── admin.css
    ├── concierge-hero.css
    └── global.css
```

---

## 2. Pagine esistenti

### Pagine pubbliche IT (tutte con mirror /en/ ✅ salvo dove indicato)

| File | Rotta pubblica | Mirror /en/ |
|---|---|---|
| `src/pages/index.astro` | `/` | ✅ `en/index.astro` → `/en/` |
| `src/pages/apartments/index.astro` | `/apartments` | ✅ `en/apartments/index.astro` → `/en/apartments` |
| `src/pages/apartments/[slug].astro` | `/apartments/santopaolo-1…5` (5 pagine statiche) | ✅ `en/apartments/[slug].astro` |
| `src/pages/book.astro` | `/book` | ✅ `en/book.astro` → `/en/book` |
| `src/pages/concierge/index.astro` | `/concierge` | ✅ `en/concierge/index.astro` |
| `src/pages/concierge/services.astro` | `/concierge/services` | ✅ `en/concierge/services.astro` |
| `src/pages/contact.astro` | `/contact` | ✅ `en/contact.astro` |
| `src/pages/wellness.astro` | `/wellness` | ✅ `en/wellness.astro` |
| `src/pages/privacy.astro` | `/privacy` | ✅ `en/privacy.astro` |
| `src/pages/terms.astro` | `/terms` | ✅ `en/terms.astro` |
| `src/pages/404.astro` | pagina 404 (SSR, `prerender = false`) | ❌ nessun mirror (unica, testo IT) |

### Area admin (SSR, protetta da middleware, nessun mirror — ❌ per tutte)

| File | Rotta |
|---|---|
| `src/pages/admin/index.astro` | `/admin` |
| `src/pages/admin/login.astro` | `/admin/login` |
| `src/pages/admin/bookings.astro` | `/admin/bookings` |
| `src/pages/admin/calendar.astro` | `/admin/calendar` |
| `src/pages/admin/tasks.astro` | `/admin/tasks` |
| `src/pages/admin/extra-services.astro` | `/admin/extra-services` |
| `src/pages/admin/stats.astro` | `/admin/stats` |
| `src/pages/admin/tax.astro` | `/admin/tax` |

### API interne (SSR, nessun mirror — ❌ per tutte)

| File | Rotta |
|---|---|
| `src/pages/api/auth/login.ts` | `POST /api/auth/login` |
| `src/pages/api/auth/logout.ts` | `POST /api/auth/logout` |
| `src/pages/api/extra-services/index.ts` | `/api/extra-services` |
| `src/pages/api/extra-services/[id].ts` | `/api/extra-services/:id` |
| `src/pages/api/kalisi/sync.ts` | `/api/kalisi/sync` |
| `src/pages/api/kalisi/sync-guests.ts` | `/api/kalisi/sync-guests` |
| `src/pages/api/kalisi/backfill-bookings.ts` | `/api/kalisi/backfill-bookings` |
| `src/pages/api/kalisi/backfill-guests.ts` | `/api/kalisi/backfill-guests` |
| `src/pages/api/notes/index.ts` | `/api/notes` |
| `src/pages/api/notes/[id].ts` | `/api/notes/:id` |
| `src/pages/api/tasks/index.ts` | `/api/tasks` |
| `src/pages/api/tasks/[id].ts` | `/api/tasks/:id` |
| `src/pages/api/tax/report.ts` | `/api/tax/report` |
| `src/pages/api/telegram/checkin-reminders.ts` | `/api/telegram/checkin-reminders` |
| `src/pages/api/telegram/morning-brief.ts` | `/api/telegram/morning-brief` |
| `src/pages/api/telegram/task-reminders.ts` | `/api/telegram/task-reminders` |

---

## 3. Occorrenze esterne

Grep case-insensitive su `src/`, `public/` e root (esclusi `node_modules`, `.git`, `dist`, `.astro`, `package-lock.json`).

Nota: `.env.local` e `.env.example` contengono entrambi la stringa `italianway.house` nel valore di `KALISI_BASE_URL` (valori non riportati qui perché i file contengono credenziali). `public/` non ha nessun match (solo immagini, robots.txt, manifest).

### italianway (20 match)

```
src/components/BookingWidget.astro:5:  italianwayId: string;
src/components/BookingWidget.astro:10:const { italianwayId, maxGuests, lang = 'it' } = Astro.props;
src/components/BookingWidget.astro:15:const baseUrl = `https://napartments.italianway.house/apartments/${italianwayId}-${slug}`;
src/components/BookingWidget.astro:40:const formId = `booking-${italianwayId}`;
src/lib/kalisi-client.ts:72:   * Authenticate against the Kalisi/Italianway admin. Scrapes the CSRF token
src/lib/kalisi-client.ts:432:  return (env('KALISI_BASE_URL') || 'https://napartments.italianway.house').replace(/\/$/, '');
src/pages/book.astro:10:// Mapping appartamento -> ID booking engine Italianway (allineato a apartments/[slug].astro)
src/pages/book.astro:11:const italianwayIds: Record<number, string> = {
src/pages/book.astro:79:          <BookingWidget italianwayId={italianwayIds[apt.id]} maxGuests={apt.max_guests} lang={lang} />
src/pages/apartments/[slug].astro:19:// Mapping appartamento -> ID booking engine Italianway
src/pages/apartments/[slug].astro:20:const italianwayIds: Record<number, string> = {
src/pages/apartments/[slug].astro:27:const italianwayId = italianwayIds[apartment.id];
src/pages/apartments/[slug].astro:167:          <BookingWidget italianwayId={italianwayId} maxGuests={apartment.max_guests} lang={lang} />
src/pages/en/book.astro:10:// Mapping appartamento -> ID booking engine Italianway (allineato a apartments/[slug].astro)
src/pages/en/book.astro:11:const italianwayIds: Record<number, string> = {
src/pages/en/book.astro:66:          <BookingWidget italianwayId={italianwayIds[apt.id]} maxGuests={apt.max_guests} lang={lang} />
src/pages/en/apartments/[slug].astro:19:// Mapping apartment -> Italianway booking engine ID
src/pages/en/apartments/[slug].astro:20:const italianwayIds: Record<number, string> = {
src/pages/en/apartments/[slug].astro:27:const italianwayId = italianwayIds[apartment.id];
src/pages/en/apartments/[slug].astro:167:          <BookingWidget italianwayId={italianwayId} maxGuests={apartment.max_guests} lang={lang} />
```

### napoliapartments (0 match)

Nessuna occorrenza.

### napartments (3 match)

```
src/components/BookingWidget.astro:15:const baseUrl = `https://napartments.italianway.house/apartments/${italianwayId}-${slug}`;
src/lib/kalisi-client.ts:432:  return (env('KALISI_BASE_URL') || 'https://napartments.italianway.house').replace(/\/$/, '');
src/i18n/en.ts:14:      headline: 'Five boutique\napartments in the\nheart of Chiaia',   ← falso positivo: è "\napartments" (newline + apartments)
```

### boundless (2 match)

```
src/lib/tax.ts:13:export const EXCLUDED_GUESTS = ['Boundless Travel srl'];
src/lib/tax.ts:109: * ("Boundless Travel srl - Booking.com"), quindi basta che il nome escluso
```

### kalisi (127 match)

I file coinvolti sono: `src/lib/kalisi-client.ts` (il grosso: 71 match), le 4 rotte `src/pages/api/kalisi/*`, `src/components/admin/BookingDetail.astro`, `src/components/admin/AdminTopbar.astro`, `src/pages/admin/stats.astro`, `src/lib/constants.ts`, `src/lib/dates.ts`, `src/lib/tax.ts`, `src/lib/telegram-messages.ts`.

```
src/components/admin/BookingDetail.astro:21:const kalisiUrl = `${env('KALISI_BASE_URL').replace(/\/$/, '')}/admin/orders/${booking.kalisi_id}`;
src/components/admin/BookingDetail.astro:99:    <a class="panel-btn secondary" href={kalisiUrl} target="_blank" rel="noopener">Apri su Kalisi</a>
src/components/admin/AdminTopbar.astro:5:  /** ISO timestamp of the last successful Kalisi sync, if any. */
src/lib/telegram-messages.ts:94:    'Errore sync Kalisi, 2 tentativi falliti',
src/lib/dates.ts:58:/** DD/MM/YYYY of a date-only Date (Kalisi query format). */
src/lib/constants.ts:3:/** Kalisi apartment_id -> display label + metadata. */
src/lib/constants.ts:61:  kalisi_id: number;
src/lib/tax.ts:108: * Match tollerante: Kalisi a volte accoda un suffisso al nominativo
src/lib/kalisi-client.ts:5:export interface KalisiConfig {
src/lib/kalisi-client.ts:18:  kalisi_id: number;
src/lib/kalisi-client.ts:38:export class KalisiClient {
src/lib/kalisi-client.ts:39:  private cfg: KalisiConfig;
src/lib/kalisi-client.ts:45:  constructor(cfg: KalisiConfig) {
src/lib/kalisi-client.ts:72:   * Authenticate against the Kalisi/Italianway admin. Scrapes the CSRF token
src/lib/kalisi-client.ts:80-81:   log e throw "Kalisi login skipped: recent attempt (<30s)"
src/lib/kalisi-client.ts:88-104:  login step 1: GET pagina sign_in, estrazione authenticity_token e cookie
src/lib/kalisi-client.ts:107-155:  login step 2: POST sign_in con staff[organization_code], gestione cookie di sessione, errori "Locked"/"Invalid"
src/lib/kalisi-client.ts:187-228:  fetchOrders: log URL/status/content-type, parse JSON, ispezione record
src/lib/kalisi-client.ts:241-274:  normalizzazione ordine (kalisi_id, date, ota_booking_code…)
src/lib/kalisi-client.ts:283-290:  createKalisiClient() da env KALISI_BASE_URL/EMAIL/PASSWORD/ORG_CODE/LOGIN_PATH
src/lib/kalisi-client.ts:418-432:  loginKalisi(), kalisiBase() con default https://napartments.italianway.house
src/lib/kalisi-client.ts:460-497:  extractOrderKalisiId, mapping guest (kalisi_guest_id, order_kalisi_id)
src/lib/kalisi-client.ts:508-537:  fetchGuestsList (anagrafica DataTables endpoint, retry senza parametri su 500)
src/lib/kalisi-client.ts:555:      fetchGuestDetail → GET {base}/admin/guests/{guestId}
src/lib/kalisi-client.ts:587:      fetchOrderGuests → GET {base}/admin/orders/{orderId}/guests
src/pages/admin/stats.astro:21,30,35,36:  select/join su kalisi_id e order_kalisi_id (dati Supabase)
src/pages/api/kalisi/sync-guests.ts:6,22,29-58:  login Kalisi + sync anagrafica ospiti mancanti → upsert Supabase
src/pages/api/kalisi/backfill-guests.ts:6,22-52:  login Kalisi + backfill completo anagrafica → upsert Supabase
src/pages/api/kalisi/backfill-bookings.ts:6,21-33:  fetchOrders storico → upsert bookings_cache (onConflict kalisi_id)
src/pages/api/kalisi/sync.ts:7-256:  sync periodico: login, fetchOrders, upsert bookings_cache, notifica Telegram
                                     nuove prenotazioni, sync schedine ospiti (booking_guests)
```

*(Le righe di `kalisi-client.ts` e `sync.ts` sono per la quasi totalità log di debug e normalizzazione dati: elenco compresso per intervalli; il conteggio completo è 127 match, nessuno fuori dai file elencati.)*

### smoobu (11 match)

```
src/i18n/it.ts:90:    smoobuNote: 'Verifica disponibilità e prezzi in tempo reale.',
src/i18n/en.ts:92:    smoobuNote: 'Check availability and prices in real time.',
src/data/apartments.json:12:    "smoobuPropertyId": "TBD",
src/data/apartments.json:65:    "smoobuPropertyId": "TBD",
src/data/apartments.json:124:    "smoobuPropertyId": "TBD",
src/data/apartments.json:183:    "smoobuPropertyId": "TBD",
src/data/apartments.json:231:    "smoobuPropertyId": "TBD",
CONTEXT.md:35:- **Booking**: Smoobu (TODO — placeholder in `BookingWidget.astro`)
CONTEXT.md:41:- [ ] Integrare widget Smoobu in `src/components/BookingWidget.astro`
README.md:29:│   ├── BookingWidget.astro   ← TODO: embed Smoobu
README.md:89:- [ ] Integrare Smoobu in `src/components/BookingWidget.astro`
```

→ Smoobu è un progetto abbandonato/mai partito: solo chiavi "TBD" e TODO nei doc. Nessuno script, widget o API Smoobu nel codice.

### italianway.house (2 match)

```
src/components/BookingWidget.astro:15:const baseUrl = `https://napartments.italianway.house/apartments/${italianwayId}-${slug}`;
src/lib/kalisi-client.ts:432:  return (env('KALISI_BASE_URL') || 'https://napartments.italianway.house').replace(/\/$/, '');
```

### booking.com (3 match)

```
src/components/admin/BookingDetail.astro:54:      {booking.commission != null ? `, commissione ${formatEuro(booking.commission)}` : ''}   ← falso positivo ("booking.com" matcha "booking.comm…")
src/lib/tax.ts:109: * ("Boundless Travel srl - Booking.com"), quindi basta che il nome escluso
src/data/schema.ts:57:  'https://www.booking.com/hotel/it/santopaolo-boutique-apartment.html',
```

→ Il link Booking.com in `schema.ts` è solo un `sameAs` del JSON-LD (SEO), non un canale di prenotazione dal sito.

### airbnb (2 match)

```
src/lib/constants.ts:35:export const CHANNELS = ['Booking', 'Airbnb', 'Vrbo', 'Diretto'] as const;
src/lib/kalisi-client.ts:362:  if (s.includes('airbnb')) return 'Airbnb';
```

### expedia (1 match)

```
src/lib/kalisi-client.ts:363:  if (s.includes('vrbo') || s.includes('homeaway') || s.includes('expedia')) return 'Vrbo';
```

### agoda (1 match)

```
src/data/schema.ts:58:  'https://www.agoda.com/santopaolo-boutique-apartment/hotel/naples-it.html',
```

→ Anche questo solo `sameAs` JSON-LD. In `schema.ts` c'è pure `https://www.hotels.com/ho4084786496` (stesso blocco SAME_AS, riga 59).

### marriott (0 match)

Nessuna occorrenza.

### iframe (0 match)

Nessuna occorrenza. **Non esiste nessun iframe nel sito.**

### widget (17 match)

```
src/components/BookingWidget.astro:45:  data-booking-widget
src/components/BookingWidget.astro:113:    // Scoped per-instance: find this widget's own root via currentScript so
src/components/BookingWidget.astro:114:    // multiple BookingWidgets on one page (e.g. /book) never collide.
src/components/BookingWidget.astro:116:      const root = document.currentScript.closest('[data-booking-widget]');
src/pages/apartments/[slug].astro:3:import BookingWidget from '../../components/BookingWidget.astro';
src/pages/apartments/[slug].astro:167:          <BookingWidget italianwayId={italianwayId} maxGuests={apartment.max_guests} lang={lang} />
src/pages/en/apartments/[slug].astro:3:import BookingWidget from '../../../components/BookingWidget.astro';
src/pages/en/apartments/[slug].astro:167:          <BookingWidget italianwayId={italianwayId} maxGuests={apartment.max_guests} lang={lang} />
src/pages/book.astro:3:import BookingWidget from '../components/BookingWidget.astro';
src/pages/book.astro:56:      <!-- Widget panels -->
src/pages/book.astro:79:          <BookingWidget italianwayId={italianwayIds[apt.id]} maxGuests={apt.max_guests} lang={lang} />
src/pages/en/book.astro:3:import BookingWidget from '../../components/BookingWidget.astro';
src/pages/en/book.astro:66:          <BookingWidget italianwayId={italianwayIds[apt.id]} maxGuests={apt.max_guests} lang={lang} />
CONTEXT.md:35:- **Booking**: Smoobu (TODO — placeholder in `BookingWidget.astro`)
CONTEXT.md:41:- [ ] Integrare widget Smoobu in `src/components/BookingWidget.astro`
README.md:29:│   ├── BookingWidget.astro   ← TODO: embed Smoobu
README.md:89:- [ ] Integrare Smoobu in `src/components/BookingWidget.astro`
```

→ "Widget" si riferisce sempre al componente interno `BookingWidget.astro`: **nessun widget di terze parti caricato**.

### prenota (50 match)

Match sul front-end pubblico (CTA e testi):

```
src/components/BookingWidget.astro:27:    cta: 'Verifica e prenota',
src/components/BookingWidget.astro:28:    whatsapp: 'Prenota via WhatsApp',
src/i18n/it.ts:7:    book: 'Prenota',
src/i18n/it.ts:25:      body: '…dalle prenotazioni nei migliori ristoranti al noleggio auto…',
src/i18n/it.ts:29:      title: 'Pronti a prenotare?',
src/i18n/it.ts:31:      cta: 'Prenota ora',
src/i18n/it.ts:48:    book: 'Prenota',
src/i18n/it.ts:87:    title: 'Prenota',
src/i18n/it.ts:121:      book: 'Prenota',
src/data/schema.ts:414:  book: { it: 'Prenota', en: 'Book' },
src/data/services.json:28:    "name": { "it": "Prenotazioni Ristoranti", "en": "Restaurant Reservations" },
src/pages/contact.astro:22:        Prenotazioni, informazioni sugli appartamenti, richieste concierge. Scrivi o chiama, ti rispondo io.
src/pages/privacy.astro:44:            prenotazioni e fornire i servizi concierge richiesti.
src/pages/terms.astro:27:            I presenti Termini regolano l'utilizzo del sito web e dei servizi di prenotazione offerti
src/pages/terms.astro:33:          <h2 …>2. Prenotazioni</h2>
src/pages/terms.astro:35:            Le prenotazioni si perfezionano al momento della conferma scritta da parte di Santopaolo Boutique Apartments
src/pages/terms.astro:51:            La politica di cancellazione specifica per ciascun appartamento è indicata in fase di prenotazione.
src/pages/wellness.astro:81:        …Nessuna prenotazione esterna, nessuna folla.
src/pages/wellness.astro:173:        Prenota una sessione PT
src/pages/wellness.astro:179:        href="https://wa.me/393313225577?text=Ciao!%20Vorrei%20prenotare%20una%20sessione%20di%20personal%20training."
```

Match lato admin/gestionale (etichette UI e commenti — nessun flusso di prenotazione pubblico):

```
src/components/admin/AdminNavFoot.astro:11:  { key: 'bookings', label: 'Prenotazioni', href: '/admin/bookings' },
src/lib/tax-report.ts:9,60:            commenti report Excel/Telegram ("una riga per prenotazione")
src/lib/telegram-messages.ts:17:        `Nuova prenotazione, ${b.apartment_label}`,
src/lib/tax.ts:12,31,37,52,83,110,122,131,144:  commenti calcolo tassa di soggiorno
src/pages/admin/index.astro:142,143:    legenda "Prenotazione OTA" / "Prenotazione diretta"
src/pages/admin/calendar.astro:151,152:  legenda "Prenotazione OTA" / "Prenotazione diretta"
src/pages/admin/bookings.astro:115,118,125,193,208,227:  titoli/etichette pagina Prenotazioni
src/pages/admin/stats.astro:171,224:    "{n} prenotazioni" / "Nessuna prenotazione nel periodo"
src/pages/admin/tax.astro:70,84:        "{n} prenotazioni" / "Nessuna prenotazione con notti in…"
src/pages/api/kalisi/sync.ts:178,180,211:  commenti sync schedine ospiti
```

### booking (257 match)

Il termine è pervasivo perché tutto il gestionale interno ruota attorno alla tabella Supabase `bookings_cache`. Riepilogo completo per file (ogni match è un riferimento a tipi/tabelle/etichette interne, non a servizi esterni, salvo dove già riportato nei termini precedenti):

```
src/components/BookingWidget.astro:40,45,114,116          — id/data-attribute del form interno
src/components/admin/BookingDetail.astro:2-98 (24 match)  — pannello dettaglio prenotazione (dati da Supabase)
src/components/admin/Calendar.astro:2-116 (10 match)      — calendario admin (prop bookings)
src/components/admin/AdminNavFoot.astro:3,11              — voce nav "Prenotazioni"
src/layouts/AdminLayout.astro:8                           — activePage 'bookings'
src/styles/admin.css:141-165 (8 match)                    — classi .cal-booking, .leg-chip.booking
src/lib/constants.ts:35,38,58,59,72,75,89,104             — tipi Booking/BookingStatus, riga bookings_cache
src/lib/queries.ts:2-112 (17 match)                       — query Supabase su bookings_cache
src/lib/ui.ts:1-49 (12 match)                             — bookingDisplayStatus, perNight, guestWithCount
src/lib/tax.ts:26-176 (14 match)                          — calcolo tassa su bookings_cache/booking_guests
src/lib/tax-report.ts (v. termine "prenota")              — report Excel
src/lib/telegram.ts:14,15                                 — commenti (messageType 'new_booking')
src/lib/telegram-messages.ts:4-78 (8 match)               — messaggi Telegram nuova prenotazione/brief
src/lib/kalisi-client.ts:1-465 (10 match)                 — normalizzazione ordini verso bookings_cache
src/data/schema.ts:57,414                                 — sameAs booking.com; label "Prenota/Book"
src/pages/book.astro:3,10,79                              — import/uso BookingWidget
src/pages/en/book.astro:3,10,66                           — idem EN
src/pages/apartments/[slug].astro:3,19,167                — idem
src/pages/en/apartments/[slug].astro:3,19,167             — idem EN
src/pages/admin/index.astro:12-142 (10 match)             — dashboard: check-in/out, calendario 14 gg
src/pages/admin/calendar.astro:6-163 (20 match)           — calendario + pannello dettaglio
src/pages/admin/bookings.astro:6-240 (17 match)           — lista/filtri prenotazioni
src/pages/admin/stats.astro:18-222 (16 match)             — statistiche da bookings_cache
src/pages/admin/tasks.astro:15,160,339,353                — task collegati a booking_id
src/pages/api/kalisi/sync.ts:9-249 (24 match)             — upsert bookings_cache + booking_guests
src/pages/api/kalisi/backfill-bookings.ts:32              — upsert bookings_cache
src/pages/api/notes/index.ts:13-65 (6 match)              — note collegate a booking_id
src/pages/api/tasks/index.ts:68                           — booking_id nel payload task
src/pages/api/telegram/checkin-reminders.ts:9-41 (6)      — promemoria check-in da bookings_cache
src/pages/en/terms.astro:27,33,35                         — testo termini ("booking services", "Bookings")
src/pages/en/privacy.astro:43                             — testo privacy ("manage your booking")
src/pages/en/wellness.astro:81                            — "No outside bookings"
src/pages/en/contact.astro:22                             — "Bookings, apartment enquiries…"
README.md:29,89 / CONTEXT.md:35,41                        — TODO Smoobu su BookingWidget
```

### reserve (4 match)

```
src/components/admin/BookingDetail.astro:11:  /** Href to close the panel (preserves current filters). */   ← falso positivo (preserves)
src/i18n/en.ts:127:    copy: '© {year} Santopaolo Boutique Apartments. All rights reserved.',                ← falso positivo (reserved)
src/pages/admin/calendar.astro:72:// ---- URL building (preserves current filters) ----                     ← falso positivo (preserves)
src/pages/en/wellness.astro:81:        A dedicated wellness floor reserved exclusively for apartment guests…   ← falso positivo (reserved)
```

→ Nessun vero flusso "reserve".

### checkout (81 match)

Tutti riferiti al campo data `checkout_date` / etichette "Check-out" del gestionale interno e del form date del BookingWidget. **Nessun checkout di pagamento.** File coinvolti:

```
src/components/BookingWidget.astro:25,33,68,69,73         — label/campo data "Check-out" del form
src/components/admin/BookingDetail.astro:5,19,41          — dettaglio prenotazione
src/components/admin/Calendar.astro:63                    — piazzamento barre calendario
src/lib/queries.ts:26,46,50,56,62                         — query per data di check-out
src/lib/constants.ts:33,50,69,128                         — DEFAULT_CHECKOUT_HOUR, tipi
src/lib/ui.ts:2,20,33,34                                  — checkoutTimeLabel
src/lib/kalisi-client.ts:26,228,243,255-257,272,488,503   — parsing checkout_date da Kalisi
src/lib/telegram-messages.ts:9,15,21,63,76-78             — messaggi Telegram
src/lib/tax.ts:30,84-92,135,137,161,180                   — notti nel mese per tassa di soggiorno
src/data/schema.ts:330                                    — JSON-LD checkoutTime '10:00'
src/styles/admin.css:183                                  — stile .t-checkout
src/pages/admin/index.astro:12-164 (14 match)             — KPI e timeline check-out del giorno
src/pages/admin/bookings.astro:11,198,204                 — lista prenotazioni
src/pages/admin/stats.astro:21,574                        — select campi
src/pages/admin/tax.astro:109                             — tabella report
src/pages/admin/tasks.astro:200                           — option tipo task "Check-out"
src/pages/api/tasks/[id].ts:9 e index.ts:8                — tipo task 'checkout'
src/pages/api/kalisi/*.ts (7 match)                       — sync date
src/pages/api/telegram/morning-brief.ts:9-31 (5 match)    — brief mattutino
```

### stripe (0 match)

Nessuna occorrenza. **Nessun pagamento online nel sito.**

### formspree (2 match)

```
CONTEXT.md:42:- [ ] Collegare form contatti a servizio email (Resend, Formspree, ecc.)
README.md:90:- [ ] Collegare form contatti (Resend / Formspree)
```

→ Solo TODO mai realizzati. Nessuna integrazione.

### resend (2 match)

```
README.md:90:- [ ] Collegare form contatti (Resend / Formspree)
CONTEXT.md:42:- [ ] Collegare form contatti a servizio email (Resend, Formspree, ecc.)
```

→ Idem: solo TODO. Nessun invio email dal sito.

### mailto (3 match)

```
src/components/Footer.astro:63:            <a href="mailto:gianpiero@santopaoloboutiqueapartments.com" …>
src/pages/contact.astro:49:          href="mailto:gianpiero@santopaoloboutiqueapartments.com"
src/pages/en/contact.astro:49:          href="mailto:gianpiero@santopaoloboutiqueapartments.com"
```

---

## 4. Chiamate di rete

### Chiamate `fetch` verso servizi esterni — tutte LATO SERVER (Vercel serverless, rotte `prerender = false`)

| File:riga | Endpoint | Lato |
|---|---|---|
| `src/lib/kalisi-client.ts:89` | `GET {KALISI_BASE_URL}/admin/sign_in` (default `https://napartments.italianway.house`) — pagina login, scrape CSRF | server |
| `src/lib/kalisi-client.ts:122` | `POST {KALISI_BASE_URL}/admin/sign_in` — login con `KALISI_EMAIL`/`KALISI_PASSWORD`/`KALISI_ORG_CODE` | server |
| `src/lib/kalisi-client.ts:177` | `GET {KALISI_BASE_URL}/admin/orders.json?custom_search[check_out]=…` — elenco ordini (header `X-Requested-With: XMLHttpRequest`, cookie di sessione) | server |
| `src/lib/kalisi-client.ts:515` | `GET {KALISI_BASE_URL}` endpoint anagrafica ospiti (DataTables JSON, con retry senza parametri) | server |
| `src/lib/kalisi-client.ts:556` | `GET {KALISI_BASE_URL}/admin/guests/{guestId}` — dettaglio ospite | server |
| `src/lib/kalisi-client.ts:588` | `GET {KALISI_BASE_URL}/admin/orders/{orderId}/guests` — schedine ospiti di un ordine | server |
| `src/lib/telegram.ts:33` | `POST https://api.telegram.org/bot{TOKEN}/sendMessage` | server |
| `src/pages/api/tax/report.ts:94` | `POST https://api.telegram.org/bot{TOKEN}/sendDocument` (report Excel tassa di soggiorno) | server |
| `src/lib/supabase-client.ts` | Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) via `@supabase/supabase-js` — usato da tutte le pagine admin e API | server |

### Chiamate `fetch` interne — LATO CLIENT (JS nel browser, solo area admin)

| File:riga | Endpoint | Lato |
|---|---|---|
| `src/pages/admin/extra-services.astro:223,254,287,314` | `/api/extra-services`, `/api/extra-services/:id` (GET/POST/PATCH/DELETE) | client |
| `src/pages/admin/tasks.astro:357,376,389` | `/api/tasks`, `/api/tasks/:id` | client |
| `src/pages/admin/tax.astro:143` | `/api/tax/report?month=…` | client |

### Navigazioni esterne generate da JS — LATO CLIENT (pubblico)

| File:riga | Destinazione | Lato |
|---|---|---|
| `src/components/BookingWidget.astro:135` | `window.open` verso `https://napartments.italianway.house/apartments/{italianwayId}-{slug}?locale=…&from_date=…&to_date=…&guests=…` | client |

### `import.meta.env` / `process.env`

Solo in `src/lib/env.ts` (righe 1–8): accessor unico `env()`/`requireEnv()` che legge `process.env` a runtime (Vercel) con fallback `import.meta.env` (dev locale). Tutto il resto del codice passa da lì.

### `<script src>` esterni

| File:riga | Sorgente | Lato |
|---|---|---|
| `src/pages/admin/stats.astro:230` | `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js` (grafici admin) | client |
| `src/layouts/BaseLayout.astro:115-120` | Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) — stylesheet, non script | client |
| `src/layouts/BaseLayout.astro:9,131` | `<Analytics />` di `@vercel/analytics/astro` (carica lo script Vercel Analytics) | client |

### `<form action>`

Tutti interni, solo area admin:

| File:riga | Action |
|---|---|
| `src/pages/admin/login.astro:135` | `POST /api/auth/login` |
| `src/components/admin/AdminTopbar.astro:44` | `POST /api/auth/logout` |
| `src/components/admin/BookingDetail.astro:74` | `POST /api/notes` |
| `src/pages/admin/bookings.astro:144` | `GET /admin/bookings` (filtri) |

Il form del `BookingWidget` (riga 53) **non ha action**: il submit è intercettato da JS e apre l'URL Italianway.

### `<iframe>`

**Nessuno in tutto il progetto.**

---

## 5. Come si prenota oggi

Percorso reale di un visitatore dalla homepage:

**Homepage `/`**
- Hero mobile: «**Scopri appartamenti**» → `/apartments`; «**Servizi concierge**» → `/concierge`
- Hero desktop: «**Scopri gli appartamenti**» → `/apartments`; «**Servizi concierge**» → `/concierge`
- Navbar (fissa su ogni pagina): «**Prenota**» (`btn-solid`) → `/book` — anche nel menu mobile
- CTA finale: «**Prenota ora**» → `/book`; «**Contattaci**» → `/contact`
- Footer (ogni pagina): «**Prenota**» → `/book`; `mailto:gianpiero@santopaoloboutiqueapartments.com`; `tel:+393313225577`
- Bottone flottante WhatsApp (ogni pagina, `WhatsAppFloat`): → `https://wa.me/393313225577?text=Ciao!%20Vorrei%20informazioni%20sugli%20appartamenti%20Santopaolo%20Boutique.`

**Da `/apartments`** → card appartamento «**Dettagli →**» → `/apartments/santopaolo-N`

**Su `/apartments/santopaolo-N` (e su `/book`, che ripete lo stesso widget per i 5 appartamenti in tab)** — il `BookingWidget` in sidebar offre due strade:

1. Form date (Check-in, Check-out, Ospiti) con bottone «**Verifica e prenota**» / «**Check and book**». Il submit NON invia nulla al sito: uno script inline (`BookingWidget.astro:112-136`) fa `window.open` in nuova scheda verso il **booking engine Italianway**:
   ```
   https://napartments.italianway.house/apartments/{ID}-appartamento-napoli?locale=it&from_date=…&to_date=…&guests=…
   ```
   Mapping appartamento → ID Italianway (ripetuto in 4 file): 1→`16799`, 2→`16784`, 3→`16788`, 4→`15813`, 5→`16786`.
2. Link «**Prenota via WhatsApp**» / «**Book via WhatsApp**» → `https://wa.me/393313225577?text=…`

**Da `/contact`**: nessun form (le label form esistono in `i18n` ma non sono usate). Due card:
- WhatsApp «**+39 331 322 5577**» → `https://wa.me/393313225577?text=…`
- Email → `mailto:gianpiero@santopaoloboutiqueapartments.com`

**Da `/wellness`**: «**Prenota una sessione PT**» → `https://wa.me/393313225577?text=Ciao!%20Vorrei%20prenotare%20una%20sessione%20di%20personal%20training.`

**Dove finisce il percorso**: sempre in uno di questi tre punti — **link esterno al booking engine Italianway** (napartments.italianway.house), **WhatsApp** (wa.me), o **mailto/tel**. Non esiste alcun form interno di prenotazione, nessun iframe, nessun checkout.

---

## 6. Componenti coinvolti

### `src/components/BookingWidget.astro` (150 righe — sopra la soglia delle 100, contenuto riassunto)

L'unico componente di prenotazione pubblico. Riceve `italianwayId`, `maxGuests`, `lang`. Renderizza un box con: titolo «Verifica disponibilità e prezzi in tempo reale», form con `input date` check-in/check-out e `select` ospiti, bottone «Verifica e prenota», link secondario «Prenota via WhatsApp». Lo script inline intercetta il submit e apre `https://napartments.italianway.house/apartments/{italianwayId}-{slug}?locale=…&from_date=…&to_date=…&guests=…` in nuova scheda (riga 15 la baseUrl, riga 135 il `window.open`). Nessuna chiamata di rete propria, nessuna verifica reale di disponibilità nel sito: la "verifica" avviene sul sito Italianway.

Importato in: `src/pages/apartments/[slug].astro`, `src/pages/en/apartments/[slug].astro`, `src/pages/book.astro`, `src/pages/en/book.astro`.

### `src/components/admin/Calendar.astro` (128 righe — riassunto)

Calendario Gantt dell'area admin: riceve `bookings` (righe di `bookings_cache` da Supabase), le posiziona su una griglia giorni×appartamenti, distingue OTA/diretto/cancellato, linka ogni barra a `/admin/calendar?booking={id}`. Nessuna dipendenza esterna. Importato in `src/pages/admin/index.astro` e `src/pages/admin/calendar.astro`.

### `src/components/admin/BookingDetail.astro` (101 righe — riassunto)

Pannello dettaglio prenotazione admin: ospite, appartamento, date, importo, canale OTA, contatti; form note (`POST /api/notes`); bottoni «Genera task» e «**Apri su Kalisi**» (riga 99) che linka `{KALISI_BASE_URL}/admin/orders/{kalisi_id}` (riga 21). Importato in `src/pages/admin/calendar.astro`.

### `src/components/admin/AdminTopbar.astro` (48 righe — contenuto completo)

```astro
---
import { today, formatWeekdayDayMonth } from '../../lib/dates';

interface Props {
  /** ISO timestamp of the last successful Kalisi sync, if any. */
  lastSync?: string | null;
}

const { lastSync = null } = Astro.props;

const todayLabel = (() => {
  const t = formatWeekdayDayMonth(today());
  return t.charAt(0).toUpperCase() + t.slice(1);
})();

// Relative "Sync Xm fa" label.
let syncLabel = 'Mai sincronizzato';
let stale = true;
if (lastSync) {
  const diffMs = Date.now() - new Date(lastSync).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  stale = mins > 45; // sync runs every 15 min; flag if well overdue
  if (mins < 1) syncLabel = 'Sync ora';
  else if (mins < 60) syncLabel = `Sync ${mins}m fa`;
  else {
    const hours = Math.floor(mins / 60);
    syncLabel = `Sync ${hours}h fa`;
  }
}
---

<div class="topbar">
  <a class="brand" href="/admin" style="text-decoration:none;">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L22 20 L2 20 Z" stroke="#6B1F1F" stroke-width="1.5" fill="none"/>
      <path d="M12 6 L18 18 L6 18 Z" stroke="#6B1F1F" stroke-width="1.5" fill="none"/>
      <path d="M12 10 L15 16 L9 16 Z" stroke="#6B1F1F" stroke-width="1.5" fill="none"/>
    </svg>
    <span class="brand-title">Cockpit</span>
  </a>
  <div class="meta">
    <span class="meta-date">{todayLabel}</span>
    <span><span class={`sync-dot${stale ? ' stale' : ''}`}></span>{syncLabel}</span>
    <form class="logout-form" method="POST" action="/api/auth/logout">
      <button type="submit" class="logout-btn">Esci</button>
    </form>
  </div>
</div>
```

Importato in `src/layouts/AdminLayout.astro`. Il commento «sync runs every 15 min» indica che il sync Kalisi è pensato per girare ogni 15 minuti (v. DUBBI: il cron non è definito nel repo).

Componenti marginali: `ApartmentCard.astro` (link «Dettagli →» alla scheda, nessuna logica di prezzo/prenotazione — non mostra prezzi), `WhatsAppFloat.astro` (bottone wa.me, riportato in §5). Nessun altro componente tratta disponibilità, prezzi o calendario lato pubblico. **Nessun componente del sito pubblico mostra prezzi.**

---

## 7. Dati statici

`src/data/` contiene tre file.

### `apartments.json`

Array di 5 appartamenti. Chiavi per elemento:

```
id, slug, name, size_sqm, bedrooms, bathrooms, max_guests,
cin, cir, smoobuPropertyId, description_it, description_en,
hero_image, gallery[]
```

Ogni elemento di `gallery`: `{ src, src_sm, alt_it, alt_en }`.

- **Nessun URL esterno**: tutte le immagini sono path locali (`/apartments/santopaolo-N/….webp`, servite da `public/`). Nessun dominio terzo.
- `smoobuPropertyId` vale `"TBD"` per tutti e 5 gli appartamenti (residuo di un'integrazione Smoobu mai fatta).
- **Nessun campo prezzo o disponibilità.**

### `services.json`

Array di 8 servizi concierge, chiavi `{ id, name: {it,en}, description: {it,en} }`. Nessun URL esterno.

### `schema.ts`

Builder del JSON-LD (@graph) per SEO. Contiene gli unici link OTA del sito, come `sameAs` dell'organizzazione (righe 55–59):

```
https://www.instagram.com/santopaoloboutiqueapartments
https://www.booking.com/hotel/it/santopaolo-boutique-apartment.html
https://www.agoda.com/santopaolo-boutique-apartment/hotel/naples-it.html
https://www.hotels.com/ho4084786496
```

Più telefono `+393313225577`, email `gianpiero@santopaoloboutiqueapartments.com`, `checkoutTime: '10:00'` (riga 330).

---

## 8. Configurazione

### `package.json` — dependencies e devDependencies

```json
"dependencies": {
  "@astrojs/sitemap": "^3.7.3",
  "@astrojs/vercel": "^10.0.8",
  "@supabase/supabase-js": "^2.108.2",
  "@tailwindcss/vite": "^4.3.1",
  "@vercel/analytics": "^2.0.1",
  "astro": "^6.4.7",
  "cookie": "^1.1.1",
  "exceljs": "^4.4.0",
  "photoswipe": "^5.4.4",
  "tailwindcss": "^4.3.1"
},
"devDependencies": {
  "@astrojs/check": "^0.9.9",
  "@types/cookie": "^0.6.0",
  "tslib": "^2.8.1",
  "typescript": "^6.0.3"
}
```

Nessuna dipendenza Italianway, Smoobu, Stripe, Resend o simili.

### `astro.config.mjs`

- `site: 'https://www.santopaoloapartments.com'`
- `output: 'static'` con adapter `@astrojs/vercel` — il pubblico è statico; `/admin/*`, `/api/*` e la 404 optano per SSR con `export const prerender = false`
- i18n: `defaultLocale 'it'`, locales `['it','en']`, senza prefisso per l'italiano
- Integrazione `sitemap` con alternate it/en; esclude `/404` e `/admin/*`
- Vite: plugin Tailwind, `allowedHosts: true`

`vercel.json` esiste ma è **vuoto** (`{}`): nessun cron, header o rewrite definito nel repo.

### Variabili d'ambiente (nomi, senza valori)

Identiche in `.env.example` e `.env.local`:

```
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
KALISI_BASE_URL
KALISI_EMAIL
KALISI_PASSWORD
KALISI_ORG_CODE
KALISI_LOGIN_PATH
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
CRON_SECRET
```

(Uso effettivo nel codice verificato via `env()`/`requireEnv()`: tutte tranne `SUPABASE_ANON_KEY`, che è dichiarata ma non risulta letta da `src/`.)

---

## 9. Verdetto

**Esiste un'API collegata a Italianway, Boundless o Kalisi dentro questo sito?**
**SÌ, verso Kalisi/Italianway — ma solo in lettura, per il gestionale interno.** Prova: `src/lib/kalisi-client.ts` (659 righe) fa login con credenziali (`KALISI_EMAIL`/`KALISI_PASSWORD`/`KALISI_ORG_CODE`) su `{KALISI_BASE_URL}/admin/sign_in` — default `https://napartments.italianway.house` (riga 432) — e scarica ordini (`/admin/orders.json`, riga 175-177), anagrafica ospiti e schedine. Non è un'API ufficiale: è **scraping autenticato dell'admin Kalisi** (estrae il token CSRF dalla pagina di login, riga 72). È usata solo dalle 4 rotte `src/pages/api/kalisi/*` che sincronizzano i dati dentro Supabase (`bookings_cache`, `booking_guests`, `guests`) per la dashboard `/admin`. **Non influenza in alcun modo il flusso di prenotazione del visitatore.** Boundless: **NO** — compare solo come nominativo escluso dal calcolo della tassa di soggiorno (`src/lib/tax.ts:13`).

**Esiste un widget o iframe di terzi per la prenotazione?**
**NO.** Zero iframe in tutto il progetto, zero script di booking di terze parti. Il `BookingWidget.astro` è un form interno, costruito in casa, che al submit apre un **link esterno** al booking engine Italianway (`window.open`, riga 135). Smoobu non è mai stato integrato: solo `smoobuPropertyId: "TBD"` in `apartments.json` e TODO in README/CONTEXT.md.

**Il sito oggi può ricevere una richiesta di prenotazione in autonomia?**
**NO.** Non esiste alcun form che invii dati di prenotazione al sito, nessun endpoint API pubblico per richieste, nessun invio email dal sito (Resend/Formspree sono TODO mai fatti), nessun pagamento (Stripe assente). Ogni prenotazione finisce su Italianway, su WhatsApp o via email/telefono del proprietario. Le prenotazioni entrano nel sistema solo tramite il sync da Kalisi verso Supabase.

**Cosa va rimosso per staccare il sito da Italianway** (due blocchi distinti):

*Blocco A — flusso di prenotazione pubblico (indispensabile):*
- `src/components/BookingWidget.astro:5,10,15,40` — prop `italianwayId` e `baseUrl` verso `napartments.italianway.house` (riga 15 è il punto chiave); da sostituire con la nuova destinazione
- `src/pages/book.astro:10-17,79` — mapping `italianwayIds` e passaggio prop
- `src/pages/en/book.astro:10-17,66` — idem
- `src/pages/apartments/[slug].astro:19-27,167` — idem
- `src/pages/en/apartments/[slug].astro:19-27,167` — idem

*Blocco B — gestionale/sync (solo se si abbandona anche Kalisi come PMS; oggi alimenta la dashboard admin):*
- `src/lib/kalisi-client.ts` — intero file
- `src/pages/api/kalisi/` — intera directory (sync.ts, sync-guests.ts, backfill-bookings.ts, backfill-guests.ts)
- `src/components/admin/BookingDetail.astro:21,99` — link «Apri su Kalisi»
- `src/components/admin/AdminTopbar.astro:5,16-29` — indicatore ultimo sync (o riadattarlo alla nuova fonte)
- `src/lib/telegram-messages.ts:94` — messaggio «Errore sync Kalisi»
- `src/lib/dates.ts:58` e `src/lib/constants.ts:3` — commenti/formato date Kalisi
- Variabili `KALISI_*` in `.env.local`, `.env.example` e nell'ambiente Vercel
- L'eventuale cron esterno che chiama `/api/kalisi/sync` (non definito nel repo — v. DUBBI)
- Colonne `kalisi_id`/`kalisi_guest_id`/`order_kalisi_id` in `supabase/migrations/*` e nei loro usi (`src/lib/constants.ts:61`, `src/pages/admin/stats.astro:21,30,35,36`, query varie): rinominabili come "id esterno" storico, non serve cancellarle
- I `sameAs` OTA in `src/data/schema.ts:57-59` (Booking.com/Agoda/Hotels.com) non sono Italianway, ma se si esce dalle OTA sono da rivedere

**Cosa manca per avere richieste di prenotazione dirette:**
1. Un form di richiesta (nome, email/telefono, appartamento, date, ospiti, messaggio) su `/book` e/o sulla scheda appartamento — oggi il form date esiste già nel `BookingWidget` ma butta tutto su Italianway
2. Un endpoint server per riceverlo (es. `POST /api/booking-request`), sul modello delle API già esistenti (`/api/notes`, `/api/tasks`), con salvataggio in Supabase (nuova tabella o `bookings_cache` con canale "Diretto")
3. Notifica al proprietario: l'infrastruttura Telegram c'è già (`src/lib/telegram.ts`) ed è riusabile subito; in alternativa/aggiunta un servizio email transazionale (Resend/Formspree, i TODO storici di README:90 e CONTEXT.md:42)
4. Email di conferma al cliente (oggi impossibile: il sito non sa inviare email)
5. Un calendario disponibilità proprio: `bookings_cache` su Supabase contiene già le occupazioni sincronizzate e potrebbe alimentare un check di disponibilità lato server, ma oggi nessuna pagina pubblica lo interroga
6. Prezzi: da nessuna parte nel sito esistono tariffe (`apartments.json` non ha campi prezzo); serve un listino, anche statico
7. Opzionale: pagamento/caparra (Stripe assente) — non indispensabile nel modello "richiesta + conferma scritta" già previsto da `terms.astro:35`
8. Anti-spam sul form (rate-limit/honeypot) e adeguamento privacy policy alla raccolta dati del form

---

## DUBBI

Cose che non ho potuto determinare con certezza:

1. **Chi chiama `/api/kalisi/sync` ogni 15 minuti.** `vercel.json` è vuoto (nessun cron nel repo); `src/lib/cron.ts` accetta sia l'header cron di Vercel sia `?secret=` «external cron such as cron-job.org». Il commento in `AdminTopbar.astro` («sync runs every 15 min») conferma che un cron esiste, ma è configurato fuori dal repo (dashboard Vercel o servizio esterno): non verificabile da qui.
2. **Valori reali delle variabili d'ambiente su Vercel.** Ho letto solo i nomi. In locale `KALISI_BASE_URL` contiene `italianway.house` (verificato senza esporre il valore completo), coerente con il default nel codice.
3. **Se gli ID Italianway (16799, 16784, 16788, 15813, 16786) e gli URL `napartments.italianway.house/apartments/…` sono ancora attivi/validi.** Richiede un test live che non ho eseguito (audit solo sul codice).
4. **Se i link OTA in `schema.ts` (Booking.com, Agoda, Hotels.com) puntano a schede ancora esistenti.** Stesso motivo.
5. **`SUPABASE_ANON_KEY`** è dichiarata in `.env` ma non ho trovato codice che la legga: probabilmente residuo inutilizzato, ma non posso escludere usi indiretti.
6. **Contenuto completo delle migrations Supabase** (`supabase/migrations/001-004`): ho verificato l'esistenza di `bookings_cache`, `guests`, `booking_guests`, `extra_services` dagli usi nel codice, ma non ho ispezionato colonna per colonna gli schemi SQL.
7. **`dist/` e `outputs/`** nella root non sono stati analizzati (build artifact e output vari; `dist` era escluso per istruzione).
8. **Perché `404.astro` è SSR** (`prerender = false`): probabile scelta per servire la 404 su rotte dinamiche, irrilevante per la prenotazione ma non ne ho conferma.
9. **Numeri di riga del blocco `sameAs` in `schema.ts`**: il blocco inizia intorno alla riga 55; i match grep esatti sono alle righe 57 (booking.com) e 58 (agoda). La riga hotels.com è quella immediatamente successiva (59), dedotta dal contesto letto.
