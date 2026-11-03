-- name_hr becomes the edited web name; the raw SAP article name moves to its
-- own column, which the SAP import keeps up to date and search still matches.

alter table products
  add column if not exists sap_name text;

-- Until web names are applied, the current name is the SAP name.
update products
set sap_name = name_hr
where sap_item_code is not null and sap_name is null;
