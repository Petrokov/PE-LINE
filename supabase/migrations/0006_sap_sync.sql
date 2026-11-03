-- Columns for the SAP import (scripts/sap-import.ts).
-- Products are matched to SAP by item code; the slug never changes after the
-- first import, so existing URLs keep working.

alter table products
  add column if not exists sap_item_code text,
  -- Raw B2BOpisProizvoda from SAP. description_hr stays for hand-written text,
  -- which the site prefers when it is set.
  add column if not exists sap_description text,
  add column if not exists unit text,
  -- Withdrawn articles are hidden, never deleted.
  add column if not exists active boolean not null default true,
  add column if not exists sap_updated_at date,
  add column if not exists last_synced_at timestamptz;

-- The 214 products imported in 0005 carry their item code in specs.
update products
set sap_item_code = (
  select s ->> 'value'
  from jsonb_array_elements(specs) as s
  where s ->> 'key' = 'Šifra artikla'
  limit 1
)
where sap_item_code is null;

create unique index if not exists products_sap_item_code_key on products(sap_item_code);
create index if not exists products_active_idx on products(active);
