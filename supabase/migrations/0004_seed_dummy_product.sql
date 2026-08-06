-- Dummy product for design preview: mirrors pe-line.hr/product/rubna-traka-150x10-mm-50-m-kolut/
insert into products (name_hr, name_sl, name_en, slug, description_hr, images, price_range, featured, specs, category_id)
values (
  'Rubna traka 150x10 mm, 50 m kolut',
  'Robni trak 150x10 mm, 50 m kolut',
  'Edge tape 150x10 mm, 50 m roll',
  'rubna-traka-150x10-mm-50-m-kolut',
  'Rubna dilatacijska traka za sustave podnog grijanja. Postavlja se uz rubove prostorije i sve fiksne elemente kako bi kompenzirala toplinsko širenje estriha.',
  array['https://pe-line.hr/wp-content/uploads/2022/06/PE-LINE-PODNO-RUBNA-TRAKA-150mm-X-10mm-X-50m-KOLUT.jpg'],
  null,
  false,
  '[
    {"key": "Širina", "value": "150 mm"},
    {"key": "Debljina", "value": "10 mm"},
    {"key": "Duljina koluta", "value": "50 m"},
    {"key": "Materijal", "value": "Ekspandirani polietilen (PE)"},
    {"key": "Namjena", "value": "Dilatacija ruba estriha kod podnog grijanja"}
  ]'::jsonb,
  (select id from categories where slug = 'podno-grijanje')
)
on conflict (slug) do nothing;
