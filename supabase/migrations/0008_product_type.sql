-- Product type within its category (e.g. "koljena", "razdjelnici"), for the
-- type filter on the products pages. Filled from data/product-types.json by
-- scripts/apply-product-types.ts; the SAP import never touches it.

alter table products
  add column if not exists product_type text;

create index if not exists products_category_type_idx on products(category_id, product_type);
