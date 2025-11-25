import type { APIRoute } from "astro";

export const prerender = false;

// GET: Load Page Data
export const GET: APIRoute = async ({ request, params, locals }) => {
  const { supabase } = locals;
  const { id, pageId } = params;

  console.log(pageId);

  // Optimization: Single Query - use id not path
  const { data: page, error } = await supabase
    .from("pages")
    .select(
      `
      id, 
      data,
      title, 
      path,
      status
    `,
    )
    .eq("website_id", id)
    .eq("id", pageId)
    .single();

  if (error || !page) {
    return new Response(
      JSON.stringify({ error: "Page not found", details: error?.message }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(page), { status: 200 });
};

// PATCH: Save Page Data (kept for backwards compatibility, but not used)
export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const { supabase } = locals;
  const { id, pageId } = params;
  const body = await request.json();

  // Update using pageId (which is now the actual ID)
  const { error } = await supabase
    .from("pages")
    .update({
      data: body.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .eq("website_id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
