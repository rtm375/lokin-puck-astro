-- Create files table
create table public.files (
  id bigint generated always as identity primary key,
  website_id uuid not null references public.websites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  size bigint not null,
  type text not null,
  key text not null unique,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_files_website_id on public.files(website_id);
create index idx_files_user_id on public.files(user_id);
create index idx_files_created_at on public.files(created_at desc);

-- Enable RLS
alter table public.files enable row level security;

-- Policies
create policy "Users can view files for their websites"
  on public.files for select
  to authenticated
  using (
    exists (
      select 1
      from public.websites w
      where w.id = files.website_id
      and w.user_uid = (select auth.uid())
    )
    or
    exists (
      select 1
      from public.website_collaborators wc
      where wc.website_id = files.website_id
      and wc.user_uid = (select auth.uid())
    )
  );

create policy "Users can insert files for their websites"
  on public.files for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.websites w
      where w.id = files.website_id
      and w.user_uid = (select auth.uid())
    )
    or
    exists (
      select 1
      from public.website_collaborators wc
      where wc.website_id = files.website_id
      and wc.user_uid = (select auth.uid())
    )
  );

create policy "Users can update their files"
  on public.files for update
  to authenticated
  using (
    exists (
      select 1
      from public.websites w
      where w.id = files.website_id
      and w.user_uid = (select auth.uid())
    )
    or
    exists (
      select 1
      from public.website_collaborators wc
      where wc.website_id = files.website_id
      and wc.user_uid = (select auth.uid())
    )
  );

create policy "Users can delete their files"
  on public.files for delete
  to authenticated
  using (
    exists (
      select 1
      from public.websites w
      where w.id = files.website_id
      and w.user_uid = (select auth.uid())
    )
    or
    exists (
      select 1
      from public.website_collaborators wc
      where wc.website_id = files.website_id
      and wc.user_uid = (select auth.uid())
    )
  );