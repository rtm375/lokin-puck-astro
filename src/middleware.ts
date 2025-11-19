import { defineMiddleware } from 'astro:middleware'
import { getSupabaseClient } from './lib/supabase-client';

export const onRequest = defineMiddleware(async ({ request, cookies, locals, url, redirect }, next) => {
  const supabase = getSupabaseClient(request, cookies);

  const { data: { user }, error } = await supabase.auth.getUser();

  locals.supabase = supabase;
  locals.user = user;

  const isLoggedIn = !!user && !error;
  const pathname = url.pathname;

  if (pathname.startsWith('/admin')) {
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