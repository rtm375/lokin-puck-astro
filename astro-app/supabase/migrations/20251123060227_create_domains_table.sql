-- 1. Create Domains Table
create table public.domains (
  domain text primary key, -- e.g., "mypizza.com" or "user.lokin.cloud"
  website_id uuid not null references public.websites(id) on delete cascade,
  
  -- Verification status for custom domains
  status text not null default 'pending' 
    check (status in ('pending', 'active', 'invalid')),
    
  -- To distinguish between your subdomain and user custom domain
  type text not null default 'custom' 
    check (type in ('subdomain', 'custom')),

  -- Ensure one primary domain per site if needed, or just use this list
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.domains enable row level security;

-- 3. Policies
-- Allow users to view domains for websites they own/edit
create policy "Users can view domains"
  on public.domains
  for select
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = domains.website_id
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

-- Allow owners/editors to insert domains
create policy "Owners can insert domains"
  on public.domains
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.websites
      where id = domains.website_id
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

-- Allow owners to delete domains
create policy "Owners can delete domains"
  on public.domains
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.websites
      where id = domains.website_id
      and user_uid = (select auth.uid())
    )
  );