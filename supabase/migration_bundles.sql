-- Run this in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- This adds support for "bundle" purchases: multiple parts bought together
-- for one combined price (e.g. a $90 eBay lot containing a CPU + Motherboard + RAM),
-- plus a Watching/Bought status for tracking listings you're still deciding on.

create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  label text,
  total_price numeric(10, 2) not null default 0,
  marketplace text not null default 'eBay',
  link text,
  status text not null default 'Watching', -- 'Watching' or 'Bought'
  image_url text,
  created_at timestamptz not null default now()
);

-- Each part can optionally belong to a bundle. When it does, its `price`
-- column holds an even split of the bundle's total_price (so build cost
-- totals keep working exactly like before), while the bundle row keeps
-- the original combined price, listing link, and status.
alter table parts add column if not exists bundle_id uuid references bundles(id) on delete set null;

create index if not exists parts_bundle_id_idx on parts (bundle_id);

alter table bundles enable row level security;

drop policy if exists "public can do everything on bundles" on bundles;
create policy "public can do everything on bundles"
  on bundles for all
  using (true)
  with check (true);
