-- Add pre-generated CSS column to pages table.
--
-- CSS is now generated at publish time (editor-save.ts) using UnoCSS on the
-- Node.js side, then stored here. The Cloudflare Worker page renderer reads
-- this column directly, avoiding the need to run UnoCSS (which uses native
-- @oxc-parser bindings incompatible with the workerd runtime) at request time.

alter table public.pages
  add column if not exists css text default '';
