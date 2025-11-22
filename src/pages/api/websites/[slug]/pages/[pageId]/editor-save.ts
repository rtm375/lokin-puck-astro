import { getSupabaseClient } from "@/lib/supabase-client";
import type { APIRoute } from "astro";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug, pageId } = params;
  const body = await request.json();

  // 1. We still need the ID first to ensure we are updating the right page
  // We reuse the optimized get query
  const { data: page, error: fetchError } = await supabase
    .from("pages")
    .select(`id, websites!inner(slug)`)
    .eq("websites.slug", slug)
    .eq("path", pageId)
    .single();

  if (fetchError || !page) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
    });
  }

  // 2. Update
  const { error } = await supabase
    .from("pages")
    .update({
      data: body.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", page.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
