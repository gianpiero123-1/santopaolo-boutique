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
