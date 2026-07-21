-- Servizi extra venduti agli ospiti (transfer, tour, late check-out...).
-- La tabella è già stata creata a mano su Supabase: questo file la registra
-- nel repo ed è idempotente, quindi rieseguirlo è un no-op.

create table if not exists extra_services (
  id uuid primary key default uuid_generate_v4(),
  service_date date not null,
  client_name text not null,
  apartment integer not null check (apartment between 1 and 5),
  service text not null,
  amount numeric(10,2) not null default 0,
  paid boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists extra_services_date_idx on extra_services(service_date desc);
create index if not exists extra_services_paid_idx on extra_services(paid) where paid = false;
