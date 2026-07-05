-- Run this whole file once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- A "build" is a PC you are assembling out of parts.
create table if not exists builds (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'New Build',
  image_url text,
  created_at timestamptz not null default now()
);

-- A "part" is a single component you bought to flip or to use in a build.
-- build_id is null while the part is sitting unused in inventory, and gets
-- set to a build's id once it is assigned to that build.
create table if not exists parts (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  price numeric(10, 2) not null default 0,
  marketplace text not null default 'eBay',
  link text,
  image_url text,
  build_id uuid references builds(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists parts_build_id_idx on parts (build_id);
create index if not exists parts_category_idx on parts (category);

-- Row Level Security ---------------------------------------------------
-- This app has no login system, and talks to Supabase directly from the
-- browser using the public "anon" key. To let the site read and write
-- data, we enable RLS and then add permissive policies for that anon key.
-- (If you add user accounts later, tighten these policies.)

alter table builds enable row level security;
alter table parts enable row level security;

drop policy if exists "public can do everything on builds" on builds;
create policy "public can do everything on builds"
  on builds for all
  using (true)
  with check (true);

drop policy if exists "public can do everything on parts" on parts;
create policy "public can do everything on parts"
  on parts for all
  using (true)
  with check (true);

-- Storage policies -------------------------------------------------------
-- Run this AFTER you have created a Storage bucket named "images" (Storage
-- tab in the left sidebar -> New bucket -> name it "images" -> toggle
-- "Public bucket" on). These policies let the browser upload part/build
-- photos into that bucket and let anyone view them.

drop policy if exists "public can read images" on storage.objects;
create policy "public can read images"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "public can upload images" on storage.objects;
create policy "public can upload images"
  on storage.objects for insert
  with check (bucket_id = 'images');

drop policy if exists "public can update images" on storage.objects;
create policy "public can update images"
  on storage.objects for update
  using (bucket_id = 'images');

drop policy if exists "public can delete images" on storage.objects;
create policy "public can delete images"
  on storage.objects for delete
  using (bucket_id = 'images');

