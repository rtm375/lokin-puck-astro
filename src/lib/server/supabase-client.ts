import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function getSupabaseClient(request: Request, cookies: AstroCookies) {
  const SUPABASE_URL = import.meta.env.SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase public environment variables are not set.");
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('cookie') ?? '').map(({ name, value }) => ({
            name, value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          )
        },
      },
    }
  );

  return supabase;
}