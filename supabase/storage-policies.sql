-- Create buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('cover-photos-high-res', 'cover-photos-high-res', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cover-photos-preview', 'cover-photos-preview', true)
on conflict (id) do nothing;

-- Policy for cover-photos-high-res bucket
create policy "Enable read access for all users"
on storage.objects for select
using ( bucket_id = 'cover-photos-high-res' );

create policy "Enable insert for authenticated users"
on storage.objects for insert
with check (
    bucket_id = 'cover-photos-high-res'
    and auth.role() = 'authenticated'
);

-- Policy for cover-photos-preview bucket
create policy "Enable read access for all users preview"
on storage.objects for select
using ( bucket_id = 'cover-photos-preview' );

create policy "Enable insert for authenticated users preview"
on storage.objects for insert
with check (
    bucket_id = 'cover-photos-preview'
    and auth.role() = 'authenticated'
);

-- Enable delete for authenticated users (optional)
create policy "Enable delete for authenticated users"
on storage.objects for delete
using (
    auth.role() = 'authenticated'
); 