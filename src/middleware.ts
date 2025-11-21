import { defineMiddleware } from 'astro:middleware'
import { getSupabaseClient } from './lib/supabase-client';
import { initI18n } from './i18n/client';
import { jwtVerify } from 'jose';
import type { User } from '@supabase/supabase-js';

export const onRequest = defineMiddleware(async ({ request, cookies, locals, url, redirect }, next) => {
  const supabase = getSupabaseClient(request, cookies);
  
  let user: User | null = null;  
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const secret = new TextEncoder().encode(import.meta.env.SUPABASE_JWT_SECRET);

  if (accessToken && secret) {
    try {
      const { payload } = await jwtVerify(accessToken, secret);
      user = {
        id: payload.sub as string,
        email: payload.email as string,
        user_metadata: payload.user_metadata as any
      } as User;
    } catch (e) {
      const { data, error } = await supabase.auth.getUser();      
      if (!error) user = data.user;
    }
  } else {
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  }

  locals.supabase = supabase;
  locals.user = user;
  
  const pathname = url.pathname;
  const isAppRoute = pathname.startsWith('/admin');

  let lang = 'en';
  let preferences = { theme: 'system', language: 'en' };
  locals.preferences = preferences;
  locals.t = await initI18n(lang);

  const isLoggedIn = !!user;

  if (isAppRoute) {
    if (!isLoggedIn) {
      return redirect('/login', 302);
    }
  }

  const guestRoutes = ['/login', '/register'];
  if (isLoggedIn && guestRoutes.includes(pathname)) {
    return redirect('/admin/dashboard', 302);
  }

  return next();
})