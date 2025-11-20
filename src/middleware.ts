import { defineMiddleware } from 'astro:middleware'
import { getSupabaseClient } from './lib/supabase-client';
import { initI18n } from './i18n/client';

export const onRequest = defineMiddleware(async ({ request, cookies, locals, url, redirect }, next) => {
  const supabase = getSupabaseClient(request, cookies);
  const { data: { user }, error } = await supabase.auth.getUser();

  locals.supabase = supabase;
  locals.user = user;
  
  const pathname = url.pathname;
  const isAppRoute = pathname.startsWith('/admin');

  let lang = 'en';
  let preferences = { theme: 'system', language: 'en' };
  let profile = null;

  if (user && isAppRoute) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    profile = data;

    if (data?.preferences) {
      preferences = {
        theme: data.preferences.theme || 'system',
        language: data.preferences.language || 'en'
      };
      lang = preferences.language;
    }
  }

  locals.profile = profile;
  locals.preferences = preferences;
  
  locals.t = await initI18n(lang);

  const isLoggedIn = !!user && !error;

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