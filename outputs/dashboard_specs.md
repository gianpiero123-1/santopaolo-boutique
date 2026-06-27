# Santopaolo Cockpit — Specs tecniche complete

Specifiche operative per la dashboard `admin.santopaoloapartments.com`, MVP B.

---

## 1. Architettura

```
chiaia-boutique/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── index.astro        # Home
│   │   │   ├── login.astro
│   │   │   ├── calendar.astro
│   │   │   ├── bookings.astro
│   │   │   └── tasks.astro
│   │   └── api/
│   │       ├── auth/login.ts
│   │       ├── auth/logout.ts
│   │       ├── kalisi/sync.ts           # Cron 15min
│   │       ├── tasks/index.ts           # GET, POST
│   │       ├── tasks/[id].ts            # GET, PATCH, DELETE
│   │       ├── notes/index.ts
│   │       ├── notes/[id].ts
│   │       ├── telegram/morning-brief.ts # Cron daily 8:00
│   │       ├── telegram/task-reminders.ts # Cron 5min
│   │       └── telegram/checkin-reminders.ts # Cron 5min
│   ├── components/admin/
│   │   ├── AdminTopbar.astro
│   │   ├── AdminNavFoot.astro
│   │   ├── Calendar.astro
│   │   ├── BookingDetail.astro
│   │   ├── TaskForm.astro
│   │   └── TaskList.astro
│   ├── layouts/AdminLayout.astro
│   ├── lib/
│   │   ├── kalisi-client.ts
│   │   ├── supabase-client.ts
│   │   ├── telegram.ts
│   │   └── auth.ts
│   ├── middleware.ts
│   └── styles/admin.css
├── supabase/migrations/001_init.sql
├── public/admin/
│   ├── manifest.webmanifest
│   ├── icon-192.png
│   └── icon-512.png
├── vercel.json
└── astro.config.mjs (esistente, da estendere se serve)
```

---

## 2. Schema Supabase

File `supabase/migrations/001_init.sql`:

```sql
create extension if not exists "uuid-ossp";

-- Prenotazioni (cache da Kalisi)
create table bookings_cache (
  id uuid primary key default uuid_generate_v4(),
  kalisi_id integer not null unique,
  apartment_id integer not null,
  apartment_label text not null,
  guest_name text not null,
  guest_count integer default 1,
  guest_phone text,
  guest_email text,
  checkin_date date not null,
  checkout_date date not null,
  nights integer generated always as (checkout_date - checkin_date) stored,
  ota text,
  ota_booking_code text,
  total_amount numeric(10,2),
  commission numeric(10,2),
  status text default 'confirmed' check (status in ('confirmed','cancelled','checked_in','checked_out','no_show')),
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index bookings_apartment_idx on bookings_cache(apartment_id);
create index bookings_dates_idx on bookings_cache(checkin_date, checkout_date);
create index bookings_status_idx on bookings_cache(status);

-- Note personali
create table notes (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings_cache(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index notes_booking_idx on notes(booking_id);

-- Task manuali
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  due_at timestamptz not null,
  apartment_ids integer[] default '{}',
  task_type text default 'other' check (task_type in ('cleaning','laundry','tax','checkin','checkout','maintenance','other')),
  booking_id uuid references bookings_cache(id) on delete set null,
  status text default 'pending' check (status in ('pending','completed','cancelled')),
  telegram_reminder_at timestamptz,
  telegram_sent boolean default false,
  telegram_sent_at timestamptz,
  recurring text check (recurring in ('daily','weekly','monthly')),
  recurring_end_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index tasks_due_idx on tasks(due_at);
create index tasks_status_idx on tasks(status);
create index tasks_telegram_idx on tasks(telegram_reminder_at) where telegram_sent = false;

-- Log sync Kalisi
create table sync_log (
  id uuid primary key default uuid_generate_v4(),
  source text default 'kalisi',
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'running' check (status in ('running','success','failed')),
  records_synced integer default 0,
  records_new integer default 0,
  records_updated integer default 0,
  error_message text
);
create index sync_log_started_idx on sync_log(started_at desc);

-- Log invii Telegram (audit)
create table telegram_log (
  id uuid primary key default uuid_generate_v4(),
  message_type text not null,
  reference_id uuid,
  content text not null,
  sent_at timestamptz default now(),
  success boolean default true,
  telegram_response jsonb
);
create index telegram_log_sent_idx on telegram_log(sent_at desc);

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated before update on bookings_cache
  for each row execute function set_updated_at();
create trigger notes_updated before update on notes
  for each row execute function set_updated_at();
create trigger tasks_updated before update on tasks
  for each row execute function set_updated_at();
```

Mapping apartment_id → label:
```
16799 → Santopaolo 1
16784 → Santopaolo 2
16788 → Santopaolo 3
15813 → Santopaolo 4
16786 → Santopaolo 5
```

---

## 3. Reminder Telegram

### Cron jobs

| Job | Schedule | Endpoint |
|---|---|---|
| Sync Kalisi | `*/15 * * * *` | `/api/kalisi/sync` |
| Brief mattutino | `0 6 * * *` (UTC = 8:00 IT) | `/api/telegram/morning-brief` |
| Task reminders | `*/5 * * * *` | `/api/telegram/task-reminders` |
| Check-in reminders | `*/5 * * * *` | `/api/telegram/checkin-reminders` |

### Logica reminder

1. **Brief mattutino**: ogni mattina alle 8:00 ora italiana, manda riepilogo del giorno (check-in, check-out, task)
2. **Task reminder**: ogni 5min controlla `tasks` dove `telegram_reminder_at <= now()` AND `telegram_sent = false`, manda e marca `telegram_sent = true`
3. **Check-in reminder**: ogni 5min controlla booking dove `checkin_date = today` e l'ora di check-in (15:00 default) è entro 1h, se non già inviato manda alert
4. **Nuova prenotazione**: durante sync Kalisi, se INSERT (nuovo `kalisi_id`) → invio immediato Telegram
5. **Sync error**: se ultimo `sync_log.status = 'failed'` per 2 volte di fila → alert Telegram

### Formati messaggi (no emoji, no markdown, virgole come separatori)

**Brief mattutino:**
```
Santopaolo Cockpit, mattina di venerdì 26 giugno

Check-in oggi, 2
15:00, App 1, James O'Connor +5, 7 notti, Airbnb
16:00, App 3, Lucas Martin +3, 5 notti, Vrbo

Check-out oggi, 1
11:00, App 5, Anna Schmidt +1, 3 notti, Booking

Task del giorno, 4
09:00, Lavanderia ritiro
11:30, Pulizie App 5
18:00, Tasse soggiorno App 1 e 3
20:00, Cambio codice App 2

admin.santopaoloapartments.com
```

**Check-in imminente (1h prima):**
```
Check-in tra 1 ora

James O'Connor +5 ospiti
Santopaolo 1, alle 15:00
7 notti, 2.450€, Airbnb
Codice OTA, 4892JN

admin.santopaoloapartments.com/calendar
```

**Task reminder:**
```
Promemoria Cockpit

Pulizie post check-out
Santopaolo 5, alle 11:30
Squadra Gaetano, prevista 1h, biancheria fresca

admin.santopaoloapartments.com/tasks
```

**Nuova prenotazione:**
```
Nuova prenotazione, Santopaolo 3

Lucas Martin +3 ospiti
Check-in, 26 giugno ore 16:00
Check-out, 1 luglio ore 11:00
5 notti, 1.180€, Vrbo
Codice OTA, VRB-9921

admin.santopaoloapartments.com/bookings
```

**Sync error:**
```
Errore sync Kalisi, 2 tentativi falliti

Ultimo errore, sessione scaduta
Verificare credenziali su Vercel env

admin.santopaoloapartments.com
```

---

## 4. Kalisi client, flusso auth

Flusso login Kalisi (replica esatto):

1. `GET https://napartments.italianway.house/admin/sign_in` → scrape `authenticity_token` da meta tag `<meta name="csrf-token">` o input hidden
2. `POST https://napartments.italianway.house/admin/sign_in` con form-data:
   - `staff[organization_code]` = `PT0159`
   - `staff[email]` = `KALISI_EMAIL`
   - `staff[password]` = `KALISI_PASSWORD`
   - `staff[remember_me]` = `1`
   - `authenticity_token` = scraped token
   - `commit` = `Log in`
3. Salva cookie session dalla response
4. `GET /admin/orders.json?custom_search[check_out]=DD/MM/YYYY%20-%20DD/MM/YYYY` con cookie
5. Parsa JSON DataTables, mappa su schema Supabase, upsert

Range query default: da `today` a `today + 90 days`.

Caching: sessione cookie valida ~21h, salvata in memoria del serverless function (re-login a ogni cold start, accettabile).

---

## 5. Auth dashboard

Login: POST `/api/auth/login` con `{password}` → confronta con `ADMIN_PASSWORD` env → set cookie httpOnly `cockpit_session` con HMAC firmato (durata 30 giorni se remember_me, altrimenti session).

Middleware (`src/middleware.ts`) intercetta tutto `/admin/*` (escluso `/admin/login`), verifica cookie, se invalido redirect a `/admin/login`.

Cookie payload: `{authenticated: true, issued_at: timestamp}` firmato HMAC-SHA256 con secret in env.

---

## 6. PWA

`public/admin/manifest.webmanifest`:
```json
{
  "name": "Santopaolo Cockpit",
  "short_name": "Cockpit",
  "start_url": "/admin",
  "display": "standalone",
  "background_color": "#0E0E0E",
  "theme_color": "#0E0E0E",
  "icons": [
    {"src": "/admin/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/admin/icon-512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
```

Service worker basic: cache stale-while-revalidate per asset statici. Niente offline reale.

Icone: generate dal logo Valknut bordeaux su sfondo nero `#0E0E0E`.

---

## 7. Environment variables (già su Vercel)

```
ADMIN_PASSWORD
ADMIN_SESSION_SECRET     # da aggiungere, HMAC secret
KALISI_BASE_URL
KALISI_EMAIL
KALISI_PASSWORD
KALISI_ORG_CODE
KALISI_LOGIN_PATH
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY     # da aggiungere, per server-side writes
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

---

## 8. vercel.json

```json
{
  "crons": [
    { "path": "/api/kalisi/sync", "schedule": "*/15 * * * *" },
    { "path": "/api/telegram/morning-brief", "schedule": "0 6 * * *" },
    { "path": "/api/telegram/task-reminders", "schedule": "*/5 * * * *" },
    { "path": "/api/telegram/checkin-reminders", "schedule": "*/5 * * * *" }
  ]
}
```

---

## 9. DNS sottodominio

Dopo primo deploy:
1. Aggiungi dominio `admin.santopaoloapartments.com` nel progetto Vercel
2. Cloudflare DNS, aggiungi record CNAME `admin` → `cname.vercel-dns.com` (proxied)
3. Verifica HTTPS attivo

---

## 10. Design system, recap

- Background nero `#0E0E0E`
- Cards antracite `#1C1C1C`
- Border `#2A2A2A`
- Text off-white `#F5F2EC`
- Subtext grigio marmo `#8A8580`
- Accent bordeaux `#6B1F1F`, hover `#8A2A2A`
- Font Fraunces (titoli) + Inter (body)
- Zero emoji
- Niente trattini come separatori, virgole
- Icone Lucide stroke 1.5px, colore `#8A8580`
- Layout density alta, no decorazioni

I mockup HTML di riferimento sono in `outputs/`:
- `admin_home_mockup.html`
- `admin_calendar_mockup.html`
- `admin_bookings_mockup.html`
- `admin_tasks_mockup.html`
- `admin_login_mockup.html`

I mockup sono la fonte di verità visiva: la dashboard finale deve replicarli pixel-per-pixel in CSS, con i dati reali al posto degli esempi.
