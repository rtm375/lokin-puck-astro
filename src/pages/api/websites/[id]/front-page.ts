import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals }) => {
  const { supabase } = locals;
  const { id: websiteId } = params;
  const body = await request.json();
  const { pageId } = body; // null means no front page

  try {
    // First, unset all front pages for this website
    await supabase
      .from("pages")
      .update({ is_front_page: false })
      .eq("website_id", websiteId)
      .eq("is_front_page", true);

    // If pageId is provided, set it as front page
    if (pageId) {
      const { error } = await supabase
        .from("pages")
        .update({ is_front_page: true })
        .eq("id", pageId)
        .eq("website_id", websiteId);

      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
