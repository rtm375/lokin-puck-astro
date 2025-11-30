-- Enable moddatetime extension
create extension if not exists moddatetime schema extensions;

-- Create components table
create table components (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references websites(id) on delete cascade not null,
  name text not null,
  data jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table components enable row level security;

-- Policies
create policy "Users can view components of their websites"
  on components for select
  using (
    exists (
      select 1 from websites
      where websites.id = components.website_id
      and websites.user_uid = (select auth.uid())
    )
  );

create policy "Users can insert components to their websites"
  on components for insert
  with check (
    exists (
      select 1 from websites
      where websites.id = components.website_id
      and websites.user_uid = (select auth.uid())
    )
  );

create policy "Users can update components of their websites"
  on components for update
  using (
    exists (
      select 1 from websites
      where websites.id = components.website_id
      and websites.user_uid = (select auth.uid())
    )
  );

create policy "Users can delete components of their websites"
  on components for delete
  using (
    exists (
      select 1 from websites
      where websites.id = components.website_id
      and websites.user_uid = (select auth.uid())
    )
  );

-- Create updated_at trigger
create trigger handle_updated_at before update on components
  for each row execute procedure moddatetime (updated_at);
