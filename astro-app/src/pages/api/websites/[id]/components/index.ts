import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Website ID is required" }), {
      status: 400,
    });
  }

  const { data, error } = await supabase
    .from("components")
    .select("*")
    .eq("website_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
};

export const POST: APIRoute = async ({ request, params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Website ID is required" }), {
      status: 400,
    });
  }

  const body = await request.json();
  const { name, data } = body;

  if (!name || !data) {
    return new Response(
      JSON.stringify({ error: "Name and Data are required" }),
      {
        status: 400,
      },
    );
  }

  const { data: newComponent, error } = await supabase
    .from("components")
    .insert({ website_id: id, name, data })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(newComponent), { status: 201 });
};
