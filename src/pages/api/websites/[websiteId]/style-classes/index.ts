import type { APIRoute } from "astro";
import { handleSupabaseError } from "@/lib/server/db";
export const prerender = false;

// GET /api/websites/:websiteId/style-classes - List all style classes for a website
export const GET: APIRoute = async ({ locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 }
    );
  }

  if (!websiteId) {
    return new Response(
      JSON.stringify({ error: "Website ID is required" }),
      { status: 400 }
    );
  }

  const { data: styleClasses, error } = await supabase
    .from("style_classes")
    .select("*")
    .eq("website_id", websiteId)
    .order("is_system", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  return new Response(JSON.stringify(styleClasses), { status: 200 });
};

// POST /api/websites/:websiteId/style-classes - Create a new style class
export const POST: APIRoute = async ({ request, locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 }
    );
  }

  if (!websiteId) {
    return new Response(
      JSON.stringify({ error: "Website ID is required" }),
      { status: 400 }
    );
  }

  const body = await request.json();
  const { name, description, type, properties, is_system } = body as any;

  // Validation
  if (!name || !type) {
    return new Response(
      JSON.stringify({ error: "Name and type are required" }),
      { status: 400 }
    );
  }

  // Validate type
  const validTypes = ['layout', 'utility', 'utility-sub', 'custom'];
  if (!validTypes.includes(type)) {
    return new Response(
      JSON.stringify({ error: "Invalid type" }),
      { status: 400 }
    );
  }

  // Validate properties is an object
  if (properties && typeof properties !== 'object') {
    return new Response(
      JSON.stringify({ error: "Properties must be an object" }),
      { status: 400 }
    );
  }

  const { data: styleClass, error } = await supabase
    .from("style_classes")
    .insert({
      website_id: websiteId,
      name,
      description: description || null,
      type,
      properties: properties || {},
      is_system: is_system || false,
    })
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  return new Response(JSON.stringify(styleClass), { status: 201 });
};
