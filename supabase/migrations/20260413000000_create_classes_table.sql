-- 1. Create Tables
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  name text not null,
  parent_id uuid references public.classes(id) on delete cascade,
  styles jsonb default '{}'::jsonb,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Indexes
create index classes_website_id_idx on public.classes(website_id);
create index classes_parent_id_idx on public.classes(parent_id);

-- 3. Enable RLS
alter table public.classes enable row level security;

-- 4. Policies
create policy "Users can view classes"
  on public.classes
  for select
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = classes.website_id
      and (
        user_uid = (select auth.uid())
        or exists (
          select 1 from public.website_collaborators
          where website_id = websites.id
          and user_uid = (select auth.uid())
        )
      )
    )
  );

create policy "Users can insert classes"
  on public.classes
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.websites
      where id = website_id
      and (
        user_uid = (select auth.uid())
        or exists (
          select 1 from public.website_collaborators
          where website_id = websites.id
          and user_uid = (select auth.uid())
          and role = 'editor'
        )
      )
    )
  );

create policy "Users can update classes"
  on public.classes
  for update
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = classes.website_id
      and (
        user_uid = (select auth.uid())
        or exists (
          select 1 from public.website_collaborators
          where website_id = websites.id
          and user_uid = (select auth.uid())
          and role = 'editor'
        )
      )
    )
  );

create policy "Users can delete classes"
  on public.classes
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = classes.website_id
      and (
        user_uid = (select auth.uid())
        or exists (
          select 1 from public.website_collaborators
          where website_id = websites.id
          and user_uid = (select auth.uid())
          and role = 'editor'
        )
      )
    )
  );