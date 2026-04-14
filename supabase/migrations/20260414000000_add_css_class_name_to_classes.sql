-- Add css_class_name column to classes table
-- This column stores the generated CSS class name (e.g., LCLS_WFxqwc)
-- for reusable class styling

alter table public.classes
add column css_class_name text;

-- Create index for faster lookups
create index classes_css_class_name_idx on public.classes(css_class_name);

-- Add comment for documentation
comment on column public.classes.css_class_name is 'Generated CSS class name with LCLS_ prefix for reusable styling';
