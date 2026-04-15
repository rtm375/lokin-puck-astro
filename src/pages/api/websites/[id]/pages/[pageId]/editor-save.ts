import type { APIRoute } from "astro";
import { type Data } from "@puckeditor/core";

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    const { supabase } = locals;
    const { id, pageId } = params;
    const body = (await request.json()) as { data: Data; css?: string; _savedAt?: string };
    const puckData: Data = body.data;
    const generatedCss: string = body.css ?? "";
    const clientSavedAt = body._savedAt;

    if (!puckData) return new Response("Missing Data", { status: 400 });

    const websiteId = id;

    // Conflict detection
    if (clientSavedAt) {
      const { data: currentPage } = await supabase
        .from("pages")
        .select("updated_at")
        .eq("id", pageId)
        .eq("website_id", websiteId)
        .single();

      if (currentPage) {
        const serverTime = new Date(currentPage.updated_at).getTime();
        const clientTime = new Date(clientSavedAt).getTime();
        if (serverTime > clientTime) {
          return new Response(
            JSON.stringify({
              error: "CONFLICT",
              message: "Page was modified on another device",
              serverUpdatedAt: currentPage.updated_at,
            }),
            { status: 409 }
          );
        }
      }
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("pages")
      .update({
        data: body.data,
        css: generatedCss,
        updated_at: now,
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
      JSON.stringify({ success: true, url, updatedAt: now }),
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Publish Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
