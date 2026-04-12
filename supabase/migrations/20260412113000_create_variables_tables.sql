create table public.variables_collections (
  id uuid default gen_random_uuid() primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null,
  is_system boolean default false,
  modes text[] not null default '{"Light", "Dark"}',
  skins text[] not null default '{"Default", "Modern"}',
  variable_types text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(website_id, name)
);

create table public.variables (
  id uuid default gen_random_uuid() primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  variables_collection_id uuid not null references public.variables_collections(id) on delete cascade,
  name text not null,
  value text,
  mode text not null default 'Light',
  is_group boolean default false,
  group_id uuid references public.variables(id) on delete cascade,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index variables_collections_website_id_idx on public.variables_collections(website_id);
create index variables_website_id_idx on public.variables(website_id);
create index variables_collection_id_idx on public.variables(variables_collection_id);

-- RLS
alter table public.variables_collections enable row level security;
alter table public.variables enable row level security;

-- Policies for variables_collections
create policy "Users can view variables_collections"
  on public.variables_collections for select to authenticated
  using ( check_website_access(website_id) );

create policy "Owners and editors can insert variables_collections"
  on public.variables_collections for insert to authenticated
  with check (
    exists (select 1 from public.websites where id = variables_collections.website_id and user_uid = (select auth.uid()))
    or exists (select 1 from public.website_collaborators where website_id = variables_collections.website_id and user_uid = (select auth.uid()) and role = 'editor')
  );

create policy "Owners and editors can update variables_collections"
  on public.variables_collections for update to authenticated
  using (
    exists (select 1 from public.websites where id = variables_collections.website_id and user_uid = (select auth.uid()))
    or exists (select 1 from public.website_collaborators where website_id = variables_collections.website_id and user_uid = (select auth.uid()) and role = 'editor')
  );

create policy "Owners and editors can delete variables_collections"
  on public.variables_collections for delete to authenticated
  using (
    exists (select 1 from public.websites where id = variables_collections.website_id and user_uid = (select auth.uid()))
    or exists (select 1 from public.website_collaborators where website_id = variables_collections.website_id and user_uid = (select auth.uid()) and role = 'editor')
  );


-- Policies for variables
create policy "Users can view variables"
  on public.variables for select to authenticated
  using ( check_website_access(website_id) );

create policy "Owners and editors can insert variables"
  on public.variables for insert to authenticated
  with check (
    exists (select 1 from public.websites where id = variables.website_id and user_uid = (select auth.uid()))
    or exists (select 1 from public.website_collaborators where website_id = variables.website_id and user_uid = (select auth.uid()) and role = 'editor')
  );

create policy "Owners and editors can update variables"
  on public.variables for update to authenticated
  using (
    exists (select 1 from public.websites where id = variables.website_id and user_uid = (select auth.uid()))
    or exists (select 1 from public.website_collaborators where website_id = variables.website_id and user_uid = (select auth.uid()) and role = 'editor')
  );

create policy "Owners and editors can delete variables"
  on public.variables for delete to authenticated
  using (
    exists (select 1 from public.websites where id = variables.website_id and user_uid = (select auth.uid()))
    or exists (select 1 from public.website_collaborators where website_id = variables.website_id and user_uid = (select auth.uid()) and role = 'editor')
  );
