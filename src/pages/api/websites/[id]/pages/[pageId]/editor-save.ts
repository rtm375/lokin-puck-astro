import type { APIRoute } from "astro";
import { type Data } from "@measured/puck";

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    const { supabase } = locals;
    const { id, pageId } = params;
    const body = await request.json();
    const puckData: Data = body.data;

    if (!puckData) return new Response("Missing Data", { status: 400 });

    // Website ID is already in params.id
    const websiteId = id;

    // R2 Upload removed in favor of Astro SSR
    // The page is now rendered on-the-fly by src/pages/[...path].astro

    // Update page data using pageId
    const { error } = await supabase
      .from("pages")
      .update({
        data: body.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId)
      .eq("website_id", websiteId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // Construct URL based on domain logic (simplified for now)
    // We need to fetch the website subdomain to construct the URL
    const { data: website } = await supabase
      .from("websites")
      .select("subdomain")
      .eq("id", websiteId)
      .single();
    const subdomain = website?.subdomain || "";

    // Get page path again if we didn't fetch it above (we removed the fetch block)
    const { data: page } = await supabase
      .from("pages")
      .select("path")
      .eq("id", pageId)
      .single();
    const pagePath = page?.path || "";
    const cleanPath =
      pagePath === "home" || pagePath === "index" ? "" : pagePath;

    const url = `https://${subdomain}.lokin.id/${cleanPath}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: url,
      }),
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Publish Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
