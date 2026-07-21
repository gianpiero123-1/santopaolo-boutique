-- Ospiti registrati per prenotazione (schedine alloggiati da Kalisi).
-- Alimentata da /api/kalisi/sync, usata da /admin/tax e /api/tax/report
-- per calcolare la tassa di soggiorno.

create table if not exists booking_guests (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings_cache(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  birthdate date,
  created_at timestamptz default now(),
  constraint booking_guests_unique unique (booking_id, first_name, last_name, birthdate)
);

create index if not exists booking_guests_booking_idx on booking_guests(booking_id);
create index if not exists booking_guests_birthdate_idx on booking_guests(birthdate);
