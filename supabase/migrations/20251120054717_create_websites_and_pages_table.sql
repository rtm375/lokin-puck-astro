-- Enable the "pg_hashids" extension
create extension pg_hashids with schema extensions;

-- Disable the "pg_hashids" extension
drop extension if exists pg_hashids;

-- 1. Create Tables
create table public.websites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  domain text unique,
  name text,
  description text,
  user_uid uuid not null references auth.users(id) on delete cascade,
  settings jsonb default '{}'::jsonb,
  status text not null default 'OFFLINE'
    check (status in ('MAINTENANCE', 'OFFLINE', 'ONLINE'))
);

create table public.website_collaborators (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  website_id uuid not null references public.websites(id) on delete cascade,
  user_uid uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  unique(website_id, user_uid)
);

create table public.pages (
  id uuid default gen_random_uuid() primary key,
  title text,
  status text default 'draft' check (status in ('draft', 'published')),
  description text,
  image_url text,
  head_code text,
  website_id uuid not null references public.websites(id) on delete cascade,
  path text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(website_id, path)
);

-- 2. Create Indexes
create index websites_user_uid_idx on public.websites(user_uid);
create index collaborators_website_user_idx on public.website_collaborators(website_id, user_uid);
create index pages_website_id_idx on public.pages(website_id);

-- 3. Enable RLS
alter table public.websites enable row level security;
alter table public.website_collaborators enable row level security;
alter table public.pages enable row level security;

-- 4. Helper Function (Fixes Infinite Recursion)
create or replace function public.check_website_access(target_website_id uuid)
returns boolean
language sql
security definer -- Runs as admin to bypass RLS recursion
set search_path = public
as $$
  select exists (
    select 1 from websites
    where id = target_website_id
    and user_uid = (select auth.uid()) -- Optimized select
  )
  or exists (
    select 1 from website_collaborators
    where website_id = target_website_id
    and user_uid = (select auth.uid())
  );
$$;

-- 5. Policies (Optimized & Scoped to Authenticated)

-- WEBSITES
create policy "Users can view websites"
  on public.websites
  for select
  to authenticated
  using (
    user_uid = (select auth.uid())
    or exists (
      select 1 from public.website_collaborators
      where website_id = websites.id
      and user_uid = (select auth.uid())
    )
  );

create policy "Users can insert websites"
  on public.websites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_uid);

create policy "Owners and editors can update websites"
  on public.websites
  for update
  to authenticated
  using (
    user_uid = (select auth.uid())
    or exists (
      select 1 from public.website_collaborators
      where website_id = websites.id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

create policy "Only owners can delete websites"
  on public.websites
  for delete
  to authenticated
  using (user_uid = (select auth.uid()));

-- COLLABORATORS
create policy "Users can view collaborators"
  on public.website_collaborators
  for select
  to authenticated
  using ( check_website_access(website_id) );

create policy "Owners can insert collaborators"
  on public.website_collaborators
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.websites
      where id = website_collaborators.website_id
      and user_uid = (select auth.uid())
    )
  );

create policy "Owners can update collaborators"
  on public.website_collaborators
  for update
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = website_collaborators.website_id
      and user_uid = (select auth.uid())
    )
  );

create policy "Owners can delete collaborators"
  on public.website_collaborators
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = website_collaborators.website_id
      and user_uid = (select auth.uid())
    )
  );

-- PAGES
create policy "Users can view pages"
  on public.pages
  for select
  to authenticated
  using ( check_website_access(website_id) );

create policy "Owners and editors can insert pages"
  on public.pages
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.websites
      where id = pages.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = pages.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

create policy "Owners and editors can update pages"
  on public.pages
  for update
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = pages.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = pages.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

create policy "Owners and editors can delete pages"
  on public.pages
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = pages.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = pages.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );