alter table categories enable row level security;
alter table products enable row level security;
alter table team_members enable row level security;
alter table downloads enable row level security;
alter table gallery_images enable row level security;
alter table settings enable row level security;

-- categories
create policy "public read categories" on categories for select using (true);
create policy "authenticated insert categories" on categories for insert to authenticated with check (true);
create policy "authenticated update categories" on categories for update to authenticated using (true) with check (true);
create policy "authenticated delete categories" on categories for delete to authenticated using (true);

-- products
create policy "public read products" on products for select using (true);
create policy "authenticated insert products" on products for insert to authenticated with check (true);
create policy "authenticated update products" on products for update to authenticated using (true) with check (true);
create policy "authenticated delete products" on products for delete to authenticated using (true);

-- team_members
create policy "public read team_members" on team_members for select using (true);
create policy "authenticated insert team_members" on team_members for insert to authenticated with check (true);
create policy "authenticated update team_members" on team_members for update to authenticated using (true) with check (true);
create policy "authenticated delete team_members" on team_members for delete to authenticated using (true);

-- downloads
create policy "public read downloads" on downloads for select using (true);
create policy "authenticated insert downloads" on downloads for insert to authenticated with check (true);
create policy "authenticated update downloads" on downloads for update to authenticated using (true) with check (true);
create policy "authenticated delete downloads" on downloads for delete to authenticated using (true);

-- gallery_images
create policy "public read gallery_images" on gallery_images for select using (true);
create policy "authenticated insert gallery_images" on gallery_images for insert to authenticated with check (true);
create policy "authenticated update gallery_images" on gallery_images for update to authenticated using (true) with check (true);
create policy "authenticated delete gallery_images" on gallery_images for delete to authenticated using (true);

-- settings: read is public, write is update-only (no insert/delete policy exists at all,
-- so even the authenticated admin cannot create a 2nd row or delete the seeded row)
create policy "public read settings" on settings for select using (true);
create policy "authenticated update settings" on settings for update to authenticated using (true) with check (true);
