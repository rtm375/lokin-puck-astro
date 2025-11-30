-- 1. Create Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  
  -- Subscription Logic
  tier text not null default 'free' check (tier in ('free', 'pro')),
  storage_used bigint not null default 0,
  
  -- Identity (Columns: Searchable & Publicly viewable potential)
  full_name text,
  bio text,
  avatar_url text,
  
  -- Preferences (JSONB: Private UI/App settings)
  preferences jsonb default '{"theme": "system", "language": "en"}'::jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Optimized policy using (select auth.uid())
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ( id = (select auth.uid()) );

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ( id = (select auth.uid()) );

-- Safety Policy: Allow users to insert their own profile if it's missing
-- create policy "Users can insert own profile"
--   on public.profiles for insert
--   to authenticated
--   with check ( id = (select auth.uid()) );

-- 2. Trigger: Auto-create Profile on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer -- Runs as admin
set search_path = public -- FIX: Locking search path for security
as $$
begin
  insert into public.profiles (id, tier, full_name)
  values (
    new.id, 
    'free', 
    new.raw_user_meta_data->>'full_name' -- Grab name from metadata if available
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Storage Preparation
-- We are intentionally NOT creating a trigger for storage here.
-- Since you will use Cloudflare R2, you must manually update the 
-- 'storage_used' column in your API Routes when a file is uploaded/deleted.