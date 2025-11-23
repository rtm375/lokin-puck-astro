import type { APIRoute } from "astro";
import { getSupabaseClient } from "@lib/supabase-client";
export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  // 1. Initialize Supabase with the user's cookies
  const supabase = getSupabaseClient(request, cookies);

  // 2. Check who is making the request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // 3. Fetch the profile securely on the server
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  // 4. Return JSON to the client
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
