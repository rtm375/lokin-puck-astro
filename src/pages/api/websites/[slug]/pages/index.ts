import { getSupabaseClient } from "@/lib/supabase-client";
import type { APIRoute } from "astro";

export const prerender = false;

// GET: List all pages for a website
export const GET: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug } = params;

  // 1. Get Website ID from Slug
  const { data: website, error: siteError } = await supabase
    .from("websites")
    .select("id")
    .eq("slug", slug)
    .single();

  if (siteError || !website) {
    return new Response(JSON.stringify({ error: "Website not found" }), {
      status: 404,
    });
  }

  // 2. Fetch Pages
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, title, path, status, updated_at, image_url")
    .eq("website_id", website.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(pages), { status: 200 });
};

// POST: Create a new page
export const POST: APIRoute = async ({ request, params, cookies }) => {
  const supabase = getSupabaseClient(request, cookies);
  const { slug } = params;
  const body = await request.json();

  // 1. Get Website ID
  const { data: website } = await supabase
    .from("websites")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!website) return new Response("Website not found", { status: 404 });

  // 2. Initialize Puck Data
  const initialPuckData = {
    root: { props: { title: body.title } },
    content: [],
    zones: {},
  };

  // 3. Insert Page
  const { data, error } = await supabase
    .from("pages")
    .insert({
      website_id: website.id,
      title: body.title,
      path: body.path, // slug
      status: "draft",
      data: initialPuckData,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 201 });
};
