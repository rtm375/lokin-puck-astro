import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { APIRoute } from 'astro'
export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = createServerClient(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('cookie') ?? '')
              .map(({ name, value }) => ({
                name,
                value: value ?? '', // must always be string
              }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData.user) {
      let lang = 'en';
      const langCookie = cookies.get('lang')?.value;

      if (langCookie) {
        lang = langCookie;
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', sessionData.user.id)
          .single();
        
        if (profile && profile.preferences?.language) {
          lang = profile.preferences.language;
        }
        cookies.set('lang', lang, {
          path: '/',
          maxAge: 31536000,
          httpOnly: true,
          sameSite: 'lax',
        });
      }
      return redirect(next)
    }
  }
  return redirect('/auth/auth-code-error')
}