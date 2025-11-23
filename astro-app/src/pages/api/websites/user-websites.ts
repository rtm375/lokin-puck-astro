import { getSupabaseClient } from "@lib/supabase-client";
import type { APIRoute } from "astro";
export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = getSupabaseClient(request, cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { data: websites, error } = await supabase
    .from("websites")
    .select("id, name, slug")
    .eq("user_uid", user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(websites), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
