-- Create variables and style_classes tables for flex class system
-- Requirements: 1.5, 2.5, 20.4

-- 1. Create Tables

-- Variables table (scoped to website, not user)
create table public.variables (
  id uuid default gen_random_uuid() primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null,
  key text not null,
  category text not null check (category in ('color', 'spacing', 'sizing', 'typography')),
  type text not null check (type in ('color', 'dimension', 'fontFamily', 'fontSize', 'fontWeight')),
  value_light text not null,
  value_dark text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(website_id, key)
);

-- Style classes table (scoped to website, not user)
create table public.style_classes (
  id uuid default gen_random_uuid() primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null,
  description text,
  type text not null check (type in ('layout', 'utility', 'utility-sub', 'custom')),
  properties jsonb not null default '{}'::jsonb,
  is_system boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(website_id, name)
);

-- 2. Create Indexes for Performance
create index idx_variables_website_category on public.variables(website_id, category);
create index idx_variables_website_key on public.variables(website_id, key);
create index idx_style_classes_website_type on public.style_classes(website_id, type);
create index idx_style_classes_system on public.style_classes(is_system) where is_system = true;
create index idx_style_classes_website_name on public.style_classes(website_id, name);

-- 3. Enable RLS
alter table public.variables enable row level security;
alter table public.style_classes enable row level security;

-- 4. RLS Policies for Variables

-- Users can view variables for their websites
create policy "Users can view variables for their websites"
  on public.variables
  for select
  to authenticated
  using (check_website_access(website_id));

-- Owners and editors can insert variables
create policy "Owners and editors can insert variables"
  on public.variables
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.websites
      where id = variables.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = variables.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

-- Owners and editors can update variables
create policy "Owners and editors can update variables"
  on public.variables
  for update
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = variables.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = variables.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

-- Owners and editors can delete variables
create policy "Owners and editors can delete variables"
  on public.variables
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = variables.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = variables.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

-- 5. RLS Policies for Style Classes

-- Users can view style classes for their websites
create policy "Users can view style classes for their websites"
  on public.style_classes
  for select
  to authenticated
  using (check_website_access(website_id));

-- Owners and editors can insert style classes
create policy "Owners and editors can insert style classes"
  on public.style_classes
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.websites
      where id = style_classes.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = style_classes.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

-- Owners and editors can update style classes
create policy "Owners and editors can update style classes"
  on public.style_classes
  for update
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = style_classes.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = style_classes.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );

-- Owners and editors can delete style classes
create policy "Owners and editors can delete style classes"
  on public.style_classes
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = style_classes.website_id
      and user_uid = (select auth.uid())
    )
    or exists (
      select 1 from public.website_collaborators
      where website_id = style_classes.website_id
      and user_uid = (select auth.uid())
      and role = 'editor'
    )
  );
