-- Retail prices from SAP Business One (price list 1, "Cijena VP"), used only to
-- build the indicative offer mailed after a product inquiry (src/lib/offer.ts).
-- Filled by scripts/sap-prices.ts (npm run sap:prices).
--
-- Prices live in their own table on purpose: products is publicly readable
-- ("public read products") and the site shows no prices. This table has row
-- level security on and no policy, so only the service role (server code,
-- import script) can read or write it.

create table if not exists product_prices (
  sap_item_code text primary key
    references products(sap_item_code) on delete cascade,

  price_net numeric(12, 2) not null,      -- SAP cjenik 1 "Cijena VP", bez PDV-a
  vat_rate numeric(5, 2) not null,        -- PDV u postocima, npr. 25.00
  -- price that goes into the offer: net + VAT, rounded to 2 decimals
  price_gross numeric(12, 2)
    generated always as (round(price_net * (1 + vat_rate / 100), 2)) stored,
  currency text not null default 'EUR',
  price_list_no integer not null default 1,

  synced_at timestamptz not null default now()
);

alter table product_prices enable row level security;
