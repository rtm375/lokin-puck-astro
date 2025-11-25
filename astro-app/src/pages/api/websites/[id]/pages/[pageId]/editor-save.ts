import type { APIRoute } from "astro";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Render, type Data } from "@measured/puck";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "@/lib/puck.config";
import { generateCss } from "@/lib/css-engine";
import { scriptRegistry } from "@/lib/script-registry";

export const prerender = false;

const R2 = new S3Client({
  region: "auto",
  endpoint: import.meta.env.R2_PUBLIC_DOMAIN,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  },
});

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    const { supabase } = locals;
    const { id, pageId } = params;
    const body = await request.json();
    const puckData: Data = body.data;

    if (!puckData) return new Response("Missing Data", { status: 400 });

    // Website ID is already in params.id
    const websiteId = id;

    // 1. Render React to Static HTML
    const contentHtml = renderToStaticMarkup(
      React.createElement(Render as any, {
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

    // 5. Get page data using pageId to retrieve the path for R2 storage
    const { data: page, error: fetchError } = await supabase
      .from("pages")
      .select("id, path")
      .eq("website_id", websiteId)
      .eq("id", pageId)
      .single();

    if (fetchError || !page) {
      return new Response(JSON.stringify({ error: "Page not found" }), {
        status: 404,
      });
    }

    // Use the page's path for R2 storage key
    const pagePath = page.path;
    const cleanPath =
      pagePath === "home" || pagePath === "index" ? "" : pagePath;
    // e.g., sites/123e4567-e89b.../about/index.html
    const storageKey = cleanPath
      ? `sites/${websiteId}/${cleanPath}/index.html`
      : `sites/${websiteId}/index.html`;

    await R2.send(
      new PutObjectCommand({
        Bucket: import.meta.env.R2_BUCKET_NAME,
        Key: storageKey,
        Body: fullHtml,
        ContentType: "text/html",
        CacheControl: "public, max-age=0, must-revalidate",
      }),
    );

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
