-- 1. Add slug column (initially nullable for backfilling)
alter table public.websites 
add column slug text;

-- 2. Backfill existing rows
-- We use a random UUID as a temporary slug for existing sites. 
-- Users can change this later in settings if they want a pretty URL.
update public.websites
set slug = gen_random_uuid()::text
where slug is null;

-- 3. Add Constraints
alter table public.websites 
alter column slug set default gen_random_uuid()::text, -- THE FALLBACK (Safety Net)
alter column slug set not null;

-- 4. Enforce Uniqueness
-- This is the only "logic" the DB needs to keep data safe.
create unique index websites_slug_idx on public.websites(slug);