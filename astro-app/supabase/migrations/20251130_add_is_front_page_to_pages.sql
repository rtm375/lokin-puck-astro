-- Add is_front_page column to pages table
ALTER TABLE public.pages 
ADD COLUMN is_front_page boolean DEFAULT false;

-- Create a partial unique index to ensure only one front page per website
CREATE UNIQUE INDEX pages_website_front_page_idx 
ON public.pages (website_id) 
WHERE is_front_page = true;
