import { getSupabaseClient } from "@/lib/supabase-client";
import type { APIRoute } from "astro";

export const prerender = false;

// GET: Load Page Data
export const GET: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug, pageId } = params;

  console.log(pageId);

  // Optimization: Single Query with Inner Join
  // We filter pages directly by the joined website's slug
  const { data: page, error } = await supabase
    .from("pages")
    .select(
      `
      id, 
      data,
      title, 
      status,
      websites!inner(slug)
    `,
    )
    .eq("websites.slug", slug)
    .eq("path", pageId)
    .single();

  if (error || !page) {
    return new Response(
      JSON.stringify({ error: "Page not found", data: pageId }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(page), { status: 200 });
};

// PATCH: Save Page Data
export const PATCH: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug, path } = params;
  const body = await request.json();

  // 1. We still need the ID first to ensure we are updating the right page
  // We reuse the optimized get query
  const { data: page, error: fetchError } = await supabase
    .from("pages")
    .select(`id, websites!inner(slug)`)
    .eq("websites.slug", slug)
    .eq("path", path)
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
