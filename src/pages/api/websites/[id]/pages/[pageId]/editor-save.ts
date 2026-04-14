import type { APIRoute } from "astro";
import { type Data } from "@puckeditor/core";

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    const { supabase } = locals;
    const { id, pageId } = params;
    const body = (await request.json()) as { data: Data; css?: string };
    const puckData: Data = body.data;
    const generatedCss: string = body.css ?? "";

    if (!puckData) return new Response("Missing Data", { status: 400 });

    const websiteId = id;

    const { error } = await supabase
      .from("pages")
      .update({
        data: body.data,
        css: generatedCss,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId)
      .eq("website_id", websiteId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    const { data: website } = await supabase
      .from("websites")
      .select("subdomain")
      .eq("id", websiteId)
      .single();
    const subdomain = website?.subdomain || "";

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
      JSON.stringify({ success: true, url }),
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Publish Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
