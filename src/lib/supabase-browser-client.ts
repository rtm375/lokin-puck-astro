import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseBrowserClient() {
  const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // We are not throwing error here because this file is used in the browser
    // and we don't want to break the app for users who don't have Supabase configured
    // Also, this allows us to run Storybook without having to set up Supabase
    console.warn("Supabase public environment variables are not set.");
    return null;
  }

  const supabase = createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )

  return supabase;
}
