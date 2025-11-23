import { getSupabaseClient } from "@/lib/supabase-client";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, params, cookies }) => {
  return new Response(JSON.stringify({ message: "nothings here friends" }), {
    status: 200,
  });
};

// PATCH: Update Page Settings (Title, SEO, Path, Status)
export const PATCH: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { pageId } = params;
  const body = await request.json();

  // Sync title changes to Puck Data if it exists in the body
  // Note: Deep merging logic might be needed in a real app,
  // but here we assume the editor handles the content 'data' updates separately.
  // This endpoint is strictly for metadata settings.

  const { error } = await supabase
    .from("pages")
    .update({
      title: body.title,
      path: body.path,
      status: body.status,
      description: body.description,
      image_url: body.image_url,
      head_code: body.head_code,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

// DELETE: Delete Page
export const DELETE: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { pageId } = params;

  const { error } = await supabase.from("pages").delete().eq("id", pageId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
