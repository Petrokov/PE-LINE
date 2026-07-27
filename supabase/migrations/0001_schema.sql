create extension if not exists pgcrypto;

create function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── categories ────────────────────────────────────────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  name_hr text not null,
  name_sl text,
  name_en text,
  slug text not null,
  description_hr text,
  description_sl text,
  description_en text,
  icon text,
  hero_image_url text,
  parent_id uuid references categories(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index categories_slug_key on categories(slug);
create index categories_parent_id_idx on categories(parent_id);
create trigger categories_set_updated_at before update on categories
  for each row execute function set_updated_at();

-- ── products ──────────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  name_hr text not null,
  name_sl text,
  name_en text,
  slug text not null,
  description_hr text,
  description_sl text,
  description_en text,
  images text[] not null default '{}',
  price_range text,
  featured boolean not null default false,
  specs jsonb not null default '[]',
  category_id uuid not null references categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index products_slug_key on products(slug);
create index products_category_id_idx on products(category_id);
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

-- ── team_members ──────────────────────────────────────────────
create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_hr text,
  role_sl text,
  role_en text,
  photo_url text,
  bio_hr text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger team_members_set_updated_at before update on team_members
  for each row execute function set_updated_at();

-- ── downloads ─────────────────────────────────────────────────
create table downloads (
  id uuid primary key default gen_random_uuid(),
  name_hr text not null,
  name_sl text,
  name_en text,
  file_url text not null,
  language text not null default 'all' check (language in ('hr','sl','en','all')),
  category_id uuid references categories(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index downloads_category_id_idx on downloads(category_id);
create trigger downloads_set_updated_at before update on downloads
  for each row execute function set_updated_at();

-- ── gallery_images ────────────────────────────────────────────
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_hr text,
  caption_hr text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger gallery_images_set_updated_at before update on gallery_images
  for each row execute function set_updated_at();

-- ── settings (singleton) ─────────────────────────────────────
create table settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid
    check (id = '00000000-0000-0000-0000-000000000001'::uuid),
  site_name text,
  logo_url text,
  hero_image_url text,
  phone text,
  email text,
  address text,
  map_url text,
  facebook text,
  instagram text,
  linkedin text,
  youtube text,
  footer_text_hr text,
  footer_text_sl text,
  footer_text_en text,
  updated_at timestamptz not null default now()
);
create trigger settings_set_updated_at before update on settings
  for each row execute function set_updated_at();

insert into settings (id) values ('00000000-0000-0000-0000-000000000001')
  on conflict (id) do nothing;
