create table if not exists guests (
  id uuid primary key default uuid_generate_v4(),
  kalisi_guest_id integer not null unique,
  order_kalisi_id integer,
  order_code text,
  apartment_id integer,
  apartment_label text,
  typology text,
  is_head boolean default false,
  first_name text,
  last_name text,
  email text,
  phone text,
  gender text,
  tax_code text,
  birth_place text,
  birth_country text,
  citizenship text,
  residence_country text,
  residence_city text,
  residence_address text,
  residence_postal_code text,
  preferred_language text,
  doc_type text,
  doc_number text,
  doc_issue_place text,
  checkin_date date,
  checkout_date date,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists guests_order_kalisi_idx on guests(order_kalisi_id);
create index if not exists guests_order_code_idx on guests(order_code);
create index if not exists guests_apartment_idx on guests(apartment_id);
create index if not exists guests_citizenship_idx on guests(citizenship);
create index if not exists guests_residence_idx on guests(residence_country);
create index if not exists guests_checkin_idx on guests(checkin_date);
create index if not exists guests_is_head_idx on guests(is_head) where is_head = true;

drop trigger if exists guests_updated on guests;
create trigger guests_updated
  before update on guests
  for each row execute function set_updated_at();
