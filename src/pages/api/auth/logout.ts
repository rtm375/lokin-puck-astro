import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, redirect }) => {
  const { session, supabase } = locals;
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    return redirect('/?error=signout_error', 302);
  }

  // The SSR client handles clearing the cookies.
  // Redirect the user to the homepage.
  return redirect('/', 302);
};