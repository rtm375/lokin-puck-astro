import type { APIRoute } from "astro";

export const prerender = false;

// GET: List all pages for a website
export const GET: APIRoute = async ({ request, params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

  // 2. Fetch Pages
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, title, path, status, updated_at, image_url")
    .eq("website_id", id)
    .order("updated_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(pages), { status: 200 });
};

// POST: Create a new page
export const POST: APIRoute = async ({ request, params, locals }) => {
  const { supabase } = locals;
  const { id } = params;
  const body = await request.json();

  // 2. Initialize Puck Data
  const initialPuckData = {
    root: { props: { title: body.title } },
    content: [],
    zones: {},
  };

  console.log(id);

  // 3. Insert Page
  const { data, error } = await supabase
    .from("pages")
    .insert({
      website_id: id,
      title: body.title,
      path: body.path,
      status: body.status || "draft",
      description: body.description,
      image_url: body.image_url,
      head_code: body.head_code,
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
