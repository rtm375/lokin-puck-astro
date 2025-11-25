import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  // 1. Initialize Supabase with the user's cookies
  const { supabase, user } = locals;

  // 2. Check who is making the request

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      {
        status: 401,
      },
    );
  }

  // 3. Fetch the profile securely on the server
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: locals.t("api.profile.fetch_error") }),
      {
        status: 500,
      },
    );
  }

  // 4. Return JSON to the client
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
