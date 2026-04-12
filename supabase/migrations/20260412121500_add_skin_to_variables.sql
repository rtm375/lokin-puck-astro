-- Add skin column to public.variables table
alter table public.variables add column skin text not null default 'Default';

-- Update uniqueness constraint if necessary (optional, but good to keep data consistent)
-- Existing constraints: none on variables (except PK).
-- Usually we might want uniqueness on (collection_id, skin, mode, name, group_id)
-- but for now let's just add the column.
