# CLAUDE CODE PROMPT, paste-ready

Da lanciare in `/Users/gianpierosantopaolo/chiaia-boutique` per generare la dashboard admin Cockpit completa.

Copia tutto il blocco sotto in Claude Code, lui esegue in sequenza. Se incontra un errore bloccante a metà, ferma e chiedimi.

---

```
Contesto

Devi costruire la dashboard admin `admin.santopaoloapartments.com` per Santopaolo Boutique Apartments, MVP B. Lavori nel monorepo Astro v6 + Tailwind + TypeScript già esistente in questa cartella. Le specs complete sono in `outputs/dashboard_specs.md` (leggile prima di iniziare). I mockup HTML sono in `outputs/admin_*_mockup.html` (sono la fonte di verità visiva, replica fedelmente).

Boundaries, non toccare

- Tutto sotto `src/pages/` che NON inizia con `admin/` o `api/` (sito pubblico esistente)
- `src/components/` esistenti (Navbar, Hero, BookingWidget, etc.) salvo per estrarre il path del logo
- `src/data/apartments.json`
- `src/i18n/`
- `astro.config.mjs` (a meno che serva aggiungere `output: 'server'` o adapter Vercel, in tal caso chiedi prima)
- `package.json` salvo per aggiungere dipendenze nuove

Stack da usare

- Astro server-rendered per pagine `/admin/*` e `/api/*`
- Tailwind classes esistenti, ma per la dashboard usa CSS in `src/styles/admin.css` con CSS variables (vedi sezione design system in specs)
- `@supabase/supabase-js` per DB
- `cookie` e `crypto` (node built-in) per session
- Font Google: Fraunces + Inter (importali in admin.css)

Env vars (già su Vercel, da aggiungere ad eventuale `.env.local` per dev)

ADMIN_PASSWORD
ADMIN_SESSION_SECRET (nuovo, genera tu un secret 32 char e segnalalo a fine task)
KALISI_BASE_URL = https://napartments.italianway.house
KALISI_EMAIL
KALISI_PASSWORD
KALISI_ORG_CODE = PT0159
KALISI_LOGIN_PATH = /admin/sign_in
SUPABASE_URL = https://xwbkwaapgosfogprjdew.supabase.co
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY (nuovo, da prendere su Supabase dashboard, l'utente lo aggiungerà a Vercel)
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID = 850394176

Mapping apartment_id → label

16799 → "Santopaolo 1" (90mq, 6 ospiti)
16784 → "Santopaolo 2" (60mq, 2 ospiti)
16788 → "Santopaolo 3" (70mq, 4 ospiti)
15813 → "Santopaolo 4" (60mq, 4 ospiti)
16786 → "Santopaolo 5" (45mq, 2 ospiti)

Esegui in sequenza le fasi sotto. Dopo ogni fase fai `npm run build` per verificare che non rompa nulla. Se rompe, ferma e segnala.

---

FASE 1, Dipendenze e cartelle

1.1 Installa: `@supabase/supabase-js cookie node-html-parser`. Verifica che `tslib` e `@types/cookie` siano installati come dev.

1.2 Crea cartelle:
- `src/pages/admin/`
- `src/pages/api/auth/`
- `src/pages/api/kalisi/`
- `src/pages/api/tasks/`
- `src/pages/api/notes/`
- `src/pages/api/telegram/`
- `src/components/admin/`
- `src/lib/`
- `src/styles/`
- `supabase/migrations/`
- `public/admin/`

1.3 Copia il file SQL da `outputs/dashboard_specs.md` sezione "Schema Supabase" in `supabase/migrations/001_init.sql`. Eseguire questo SQL su Supabase è responsabilità dell'utente (gli lascerai istruzioni in fondo).

---

FASE 2, Lib clients

2.1 `src/lib/supabase-client.ts`
Esporta `createServerSupabase()` che usa `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (server-side, full access). Bypass RLS per ora.

2.2 `src/lib/kalisi-client.ts`
Implementa la classe `KalisiClient` con metodi:
- `login()`: GET `/admin/sign_in`, parse HTML con node-html-parser, estrai `authenticity_token` da input hidden `[name="authenticity_token"]`. Poi POST `/admin/sign_in` form-urlencoded con tutti i field richiesti (vedi `outputs/dashboard_specs.md` sezione 4). Salva il cookie set-cookie nella property `sessionCookie`. Errore se status ≠ 302 o cookie mancante.
- `fetchOrders(fromDate: Date, toDate: Date)`: GET `/admin/orders.json?custom_search[check_out]=DD/MM/YYYY%20-%20DD/MM/YYYY` con header `Cookie: <sessionCookie>`. Parse risposta DataTables (array `data`). Restituisci array di oggetti normalizzati.
- `normalizeOrder(raw)`: mappa raw → schema bookings_cache. Campi: kalisi_id (raw.id), apartment_id, apartment_label (via mapping), guest_name (raw.client_full_name), guest_count, guest_phone (raw.customer_phone), checkin_date (parse DD/MM/YYYY), checkout_date, ota, ota_booking_code, total_amount (parse numerico, rimuovi €), status (mappa raw.status → 'confirmed'/'cancelled'/etc).

Costruttore prende env vars come parametri. Auto-login se sessionCookie è null o vecchio di >18h.

2.3 `src/lib/telegram.ts`
Esporta `sendTelegramMessage(text: string, messageType: string, referenceId?: string)` che:
- POST `https://api.telegram.org/bot{TOKEN}/sendMessage` con `{chat_id, text, parse_mode: 'HTML', disable_web_page_preview: false}`
- Logga su `telegram_log` (success o failure)
- Ritorna `{success, response}`

I formati messaggi sono in `outputs/dashboard_specs.md` sezione 3. NIENTE emoji, NIENTE markdown speciali, virgole come separatori. NIENTE trattini come separatori, riformula.

2.4 `src/lib/auth.ts`
Esporta:
- `signSession(data, secret)`: HMAC-SHA256 sign
- `verifySession(token, secret)`: verifica firma
- `createSessionCookie(remember: boolean)`: ritorna cookie string con `Max-Age` 30gg se remember, altrimenti session
- `clearSessionCookie()`: ritorna cookie string Max-Age=0
- Constant `SESSION_COOKIE_NAME = 'cockpit_session'`

---

FASE 3, Auth + Login

3.1 `src/middleware.ts`
Intercetta tutte le request a `/admin/*` (escluso `/admin/login`).
Legge cookie `cockpit_session`, verifica con `verifySession()`.
Se invalido, redirect 302 a `/admin/login`.

3.2 `src/pages/admin/login.astro`
Page server-rendered. NO AdminLayout (login è standalone).
Replica esattamente `outputs/admin_login_mockup.html`.
Form POST a `/api/auth/login` con campo `password` e checkbox `remember_me`.
Se query `?error=1` mostra messaggio errore sotto il form.

3.3 `src/pages/api/auth/login.ts`
POST. Legge body (form-urlencoded). Confronta `password` con `ADMIN_PASSWORD`. Se ok set cookie e redirect 302 a `/admin`. Se ko redirect a `/admin/login?error=1`.

3.4 `src/pages/api/auth/logout.ts`
POST. Cancella cookie, redirect a `/admin/login`.

---

FASE 4, Layout e Components

4.1 `src/styles/admin.css`
Import Google Fonts Fraunces + Inter.
Definisci CSS variables (vedi specs sezione 10).
Reset minimo + global styles per la dashboard.
Riusa stili dai mockup HTML (estrai e centralizza).

4.2 `src/layouts/AdminLayout.astro`
Wrapper standard per tutte le pagine `/admin/*` (eccetto login).
Include: `<AdminTopbar />`, slot, `<AdminNavFoot activePage={prop} />`.
Importa `admin.css`.

4.3 `src/components/admin/AdminTopbar.astro`
Replica il blocco topbar dai mockup. Logo SVG inline (Borromean Valknut bordeaux, vedi mockup), titolo "Cockpit" Fraunces, data oggi (calcola server-side), indicator sync, bottone Logout (POST a /api/auth/logout).

4.4 `src/components/admin/AdminNavFoot.astro`
Prop `activePage: 'home' | 'calendar' | 'bookings' | 'tasks'`. Replica nav-foot dai mockup.

---

FASE 5, Pagine UI

Per ogni pagina, replica fedelmente il mockup HTML correspondente. Sostituisci i dati di esempio con query reali a Supabase.

5.1 `src/pages/admin/index.astro` (Home)
Riferimento: `outputs/admin_home_mockup.html`
Query Supabase:
- KPI check-in oggi: COUNT bookings_cache WHERE checkin_date = today
- KPI check-out oggi: COUNT WHERE checkout_date = today
- KPI occupate ora: COUNT WHERE today BETWEEN checkin AND checkout
- KPI task aperti: COUNT tasks WHERE status='pending' AND due_at >= now()
- Calendar 14gg: SELECT * FROM bookings_cache WHERE checkout_date >= today AND checkin_date <= today + 14
- Timeline oggi: UNION di bookings (checkin OR checkout = today) + tasks (DATE(due_at) = today)

Last sync time: SELECT completed_at FROM sync_log WHERE status='success' ORDER BY started_at DESC LIMIT 1.

5.2 `src/pages/admin/calendar.astro`
Riferimento: `outputs/admin_calendar_mockup.html`
Query param `?range=14|30|60|90` (default 30), `?unit=1,2,3,4,5` (default all), `?channel=Booking,Airbnb,Vrbo,Direct`.
Carica bookings nel range. Side panel detail per `?booking={id}`.
Per il detail panel mostra anche le notes (SELECT FROM notes WHERE booking_id = id) e tasks (SELECT FROM tasks WHERE booking_id = id).

5.3 `src/pages/admin/bookings.astro`
Riferimento: `outputs/admin_bookings_mockup.html`
Query Supabase con filtri: search (ILIKE su guest_name, ota_booking_code, guest_phone), status, channel, unit, periodo.
Pagination 12 per pagina.
KPI mese in corso: revenue (SUM total_amount), nights (SUM nights), ADR, occupancy (nights / (5*days_in_month) * 100).

5.4 `src/pages/admin/tasks.astro`
Riferimento: `outputs/admin_tasks_mockup.html`
Tabs: oggi, domani, settimana, aperti, completati.
Group by data per la lista a sinistra.
Form a destra: gestione lato client con `<script>` Astro (no React), POST a `/api/tasks` quando salva.
Dopo save, redirect alla stessa page per refresh dati.

---

FASE 6, API routes (REST CRUD)

6.1 `src/pages/api/kalisi/sync.ts`
GET (chiamato da cron Vercel).
- Inserisci sync_log (status='running')
- `new KalisiClient(...).login()` poi `fetchOrders(today, today+90d)`
- Per ogni order normalizzato, UPSERT su bookings_cache by `kalisi_id`. Se INSERT (nuovo): collect per Telegram new-booking alert.
- Aggiorna sync_log (status='success', records_synced, records_new, records_updated)
- Se nuovi booking, chiama `sendTelegramMessage` per ognuno con format "Nuova prenotazione" (vedi specs)
- Se errore: sync_log status='failed', error_message. Se ultimi 2 sync_log status='failed' → invia Telegram "Errore sync Kalisi"

6.2 `src/pages/api/tasks/index.ts`
- GET: lista task con filtri (status, due_at range). Ordina per due_at ASC.
- POST: crea task. Body JSON {title, description, due_at, apartment_ids, task_type, telegram_reminder_minutes, recurring}. Calcola `telegram_reminder_at = due_at - reminder_minutes`.

6.3 `src/pages/api/tasks/[id].ts`
- GET: singolo task
- PATCH: aggiorna (es. marca completato → set status='completed', completed_at=now())
- DELETE: cancella

6.4 `src/pages/api/notes/index.ts` e `[id].ts`
- POST/PATCH/DELETE su notes table

---

FASE 7, Telegram cron

7.1 `src/pages/api/telegram/morning-brief.ts`
GET (cron daily 06:00 UTC = 08:00 IT).
Calcola today (IT timezone).
Query check-in/check-out oggi + task del giorno.
Componi messaggio formato `outputs/dashboard_specs.md` "Brief mattutino".
Invia con `sendTelegramMessage(text, 'morning_brief')`.

7.2 `src/pages/api/telegram/task-reminders.ts`
GET (cron */5 min).
Query tasks WHERE telegram_reminder_at <= now() AND telegram_sent = false AND status='pending'.
Per ognuno: invia messaggio (formato "Task reminder"), poi UPDATE telegram_sent=true, telegram_sent_at=now().

7.3 `src/pages/api/telegram/checkin-reminders.ts`
GET (cron */5 min).
Query bookings WHERE checkin_date = today AND status='confirmed'.
Per ognuno verifica se ora attuale + 1h >= ora di check-in di default (15:00 IT). Se sì e non già notificato (verifica telegram_log per messageType='checkin_reminder', referenceId=booking.id), invia e logga.

---

FASE 8, PWA e Vercel cron

8.1 `public/admin/manifest.webmanifest` (copia dal JSON in specs sezione 6).

8.2 `public/admin/icon-192.png` e `icon-512.png`: per ora placeholder (file vuoti). L'utente li sostituirà con le icone vere generate dal logo. Lascia istruzione in fondo.

8.3 In `src/layouts/AdminLayout.astro` aggiungi `<link rel="manifest" href="/admin/manifest.webmanifest">` e meta theme-color `#0E0E0E` nell'head.

8.4 `vercel.json` (nella root, da creare se non esiste, altrimenti merge):
```
{
  "crons": [
    { "path": "/api/kalisi/sync", "schedule": "*/15 * * * *" },
    { "path": "/api/telegram/morning-brief", "schedule": "0 6 * * *" },
    { "path": "/api/telegram/task-reminders", "schedule": "*/5 * * * *" },
    { "path": "/api/telegram/checkin-reminders", "schedule": "*/5 * * * *" }
  ]
}
```
Se `vercel.json` già esiste e ha altre chiavi, mergea con `crons` array.

---

FASE 9, Verifica e commit

9.1 `npm install` per le dipendenze
9.2 `npm run build` per verificare che tutto compila
9.3 Se ci sono errori TypeScript, fixali (no `any` se possibile, usa interface)
9.4 `git add . && git commit -m "feat: admin dashboard MVP B, cockpit con sync Kalisi, telegram, task"` (non pushare, l'utente lo farà dopo aver verificato in locale)

---

OUTPUT FINALE, riepilogo per l'utente

A fine task scrivimi un riepilogo con:
1. Cosa è stato creato (lista file principali)
2. Comandi da lanciare in locale per testare (`npm run dev` etc)
3. Cosa devo fare io manualmente prima del deploy:
   - Eseguire SQL `supabase/migrations/001_init.sql` su Supabase
   - Aggiungere env vars mancanti su Vercel (`ADMIN_SESSION_SECRET`, `SUPABASE_SERVICE_KEY`)
   - Generare icone PWA dal logo
   - Configurare DNS sottodominio `admin.santopaoloapartments.com` su Vercel
4. Eventuali punti incerti o decisioni che hai preso che mi vuoi segnalare
5. Il valore di `ADMIN_SESSION_SECRET` che hai generato (così lo metto su Vercel)

Inizia.
```

---

## Note operative

- Il prompt sopra è progettato per essere lanciato in **un colpo solo** in Claude Code
- Tempo stimato di esecuzione: 30-60 minuti
- Se CC si ferma a metà (es. errore TypeScript), riprendi dalla fase successiva specificando "Continua da FASE X"
- Dopo `git commit` locale, fai `git push` solo dopo aver testato in dev con `npm run dev` su `localhost:4321/admin/login`
- Per testare il sync Kalisi in dev, chiama manualmente `curl http://localhost:4321/api/kalisi/sync`

## Sequenza deploy finale

1. Esegui prompt Claude Code → genera codice
2. `npm run dev` e verifica login + navigazione (no dati reali ancora)
3. Esegui `001_init.sql` su Supabase via SQL editor
4. Aggiungi `ADMIN_SESSION_SECRET` e `SUPABASE_SERVICE_KEY` su Vercel
5. `git push` → Vercel deploya automaticamente
6. Una volta deployato, chiama `https://santopaolo-boutique.vercel.app/api/kalisi/sync` per primo sync manuale
7. Verifica dati su `/admin`
8. Aggiungi sottodominio `admin.santopaoloapartments.com` su Vercel + Cloudflare DNS
9. Genera icone PWA dal logo, sostituiscile in `public/admin/`
10. Installa PWA su iPhone, verifica funzionamento standalone

