import type { APIRoute } from "astro";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Render, type Data } from "@measured/puck";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "@/lib/puck.config";
import { generateCss } from "@/lib/css-engine";
import { scriptRegistry } from "@/lib/script-registry";
import { getSupabaseClient } from "@/lib/supabase-client";

export const prerender = false;

const R2 = new S3Client({
  region: "auto",
  endpoint: import.meta.env.R2_PUBLIC_DOMAIN,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  },
});

export const POST: APIRoute = async ({ request, params, cookies }) => {
  try {
    const supabase = getSupabaseClient(request, cookies);
    const { slug, pageId } = params;
    const body = await request.json();
    const puckData: Data = body.data;

    if (!puckData) return new Response("Missing Data", { status: 400 });

    const { data: website } = await supabase
      .from("websites")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!website) return new Response("Website not found", { status: 404 });

    // 1. Render React to Static HTML
    const contentHtml = renderToStaticMarkup(
      React.createElement(Render, {
        config: config,
        data: puckData as Data,
      }),
    );

    // 2. Generate Minimal CSS
    const generatedCss = await generateCss(contentHtml);

    // 3. Resolve Scripts & External CSS
    const scripts = new Set<string>();
    const styles = new Set<string>();

    const scanData = (items: any[]) => {
      items.forEach((item) => {
        const type = item.type;
        if (scriptRegistry[type]) {
          scriptRegistry[type].forEach((url) => {
            url.endsWith(".css") ? styles.add(url) : scripts.add(url);
          });
        }
        if (item.props?.children && Array.isArray(item.props.children)) {
          // Handle nested children if needed
        }
      });
    };
    if (puckData.content) scanData(puckData.content);

    // 4. Construct Final HTML Document
    const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${puckData.root.props?.title || "My Page"}</title>
            ${Array.from(styles)
              .map((url) => `<link rel="stylesheet" href="${url}">`)
              .join("")}
            <style>${generatedCss}</style>
          </head>
          <body>
            ${contentHtml}
            ${Array.from(scripts)
              .map((url) => `<script src="${url}" defer></script>`)
              .join("")}
          </body>
        </html>
      `;

    // 5. Upload to R2
    // Remove leading slash from path to avoid double slashes
    const cleanPath = pageId === "home" || pageId === "index" ? "" : pageId;
    // e.g., sites/123e4567-e89b.../about/index.html
    const storageKey = cleanPath
      ? `sites/${website.id}/${cleanPath}/index.html`
      : `sites/${website.id}/index.html`;

    await R2.send(
      new PutObjectCommand({
        Bucket: import.meta.env.R2_BUCKET_NAME,
        Key: storageKey,
        Body: fullHtml,
        ContentType: "text/html",
        CacheControl: "public, max-age=0, must-revalidate",
      }),
    );

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

    return new Response(
      JSON.stringify({
        success: true,
        url: `${import.meta.env.PUBLIC_SITES_DOMAIN}/${storageKey.replace("/index.html", "")}`,
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
