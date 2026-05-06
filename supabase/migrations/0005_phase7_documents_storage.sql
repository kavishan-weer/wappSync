-- Phase 7 fix: storage bucket and policies for uploaded PDF documents

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners can upload documents" on storage.objects;
create policy "Owners can upload documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can read documents" on storage.objects;
create policy "Owners can read documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update documents" on storage.objects;
create policy "Owners can update documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete documents" on storage.objects;
create policy "Owners can delete documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.shops
      where shops.id = ((storage.foldername(name))[1])::uuid
        and shops.owner_id = auth.uid()
    )
  );
