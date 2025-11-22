import { getSupabaseClient } from "@lib/supabase-client";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  const formData = await request.formData();
  const provider = formData.get("provider")?.toString();

  const supabase = getSupabaseClient(request, cookies);

  // OAuth
  if (provider === "google") {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session)
      return new Response(JSON.stringify({ redirect: "/admin/dashboard" }), {
        status: 200,
      });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${url.origin}/api/auth/callback` },
    });

    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    return new Response(JSON.stringify({ redirect: data.url }), {
      status: 200,
    });
  }

  // Email/password
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (email && password) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message, error_code: error.code }),
        { status: error.status },
      );
    }

    let lang = "en"; // Default language
    const langCookie = cookies.get("lang")?.value;

    if (langCookie) {
      lang = langCookie;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", authData.user.id)
        .single();

      if (profile && profile.preferences?.language) {
        lang = profile.preferences.language;
      }
      cookies.set("lang", lang, {
        path: "/",
        maxAge: 31536000,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return new Response(JSON.stringify({ redirect: "/admin/dashboard" }), {
      status: 200,
      // headers: {
      //   'Set-Cookie': `lang=${lang}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
      // }
    });
  }

  return new Response(JSON.stringify({ error: "invalid_request" }), {
    status: 400,
  });
};
