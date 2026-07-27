insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');

create policy "authenticated insert media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

create policy "authenticated update media" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

create policy "authenticated delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
