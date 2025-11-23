import { getSupabaseClient } from "@/lib/supabase-client";
import type { APIRoute } from "astro";

export const prerender = false;

// GET: List domains
export const GET: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug } = params;

  // 1. Get Website ID
  const { data: website } = await supabase
    .from("websites")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!website) return new Response("Not found", { status: 404 });

  // 2. Get Domains
  const { data: domains } = await supabase
    .from("domains")
    .select("*")
    .eq("website_id", website.id);

  return new Response(JSON.stringify([...(domains || [])]), {
    status: 200,
  });
};

// POST: Add Custom Domain
export const POST: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug } = params;
  const body = await request.json();

  const { data: website } = await supabase
    .from("websites")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!website) return new Response("Not found", { status: 404 });

  // Add to DB
  const { data, error } = await supabase
    .from("domains")
    .insert({
      domain: body.domain,
      website_id: website.id,
      type: "custom",
      status: "pending", // In real app, trigger Cloudflare Custom Hostname API here
    })
    .select()
    .single();

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });

  // TODO: Call Cloudflare API to register Custom Hostname for SSL

  return new Response(JSON.stringify(data), { status: 200 });
};

// DELETE
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");

  if (!domain) return new Response("Missing domain", { status: 400 });

  const { error } = await supabase
    .from("domains")
    .delete()
    .eq("domain", domain);

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
