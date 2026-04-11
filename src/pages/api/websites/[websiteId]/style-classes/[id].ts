import type { APIRoute } from "astro";
import { handleSupabaseError } from "@/lib/server/db";
export const prerender = false;

// GET /api/websites/:websiteId/style-classes/:id - Get a single style class
export const GET: APIRoute = async ({ locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId, id } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 }
    );
  }

  if (!websiteId || !id) {
    return new Response(
      JSON.stringify({ error: "Website ID and Style Class ID are required" }),
      { status: 400 }
    );
  }

  const { data: styleClass, error } = await supabase
    .from("style_classes")
    .select("*")
    .eq("id", id)
    .eq("website_id", websiteId)
    .single();

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  if (!styleClass) {
    return new Response(
      JSON.stringify({ error: "Style class not found" }),
      { status: 404 }
    );
  }

  return new Response(JSON.stringify(styleClass), { status: 200 });
};

// PATCH /api/websites/:websiteId/style-classes/:id - Update a style class
export const PATCH: APIRoute = async ({ request, locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId, id } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 }
    );
  }

  if (!websiteId || !id) {
    return new Response(
      JSON.stringify({ error: "Website ID and Style Class ID are required" }),
      { status: 400 }
    );
  }

  // Check if this is a system class
  const { data: existingClass, error: fetchError } = await supabase
    .from("style_classes")
    .select("is_system, name")
    .eq("id", id)
    .eq("website_id", websiteId)
    .single();

  if (fetchError) {
    return handleSupabaseError(fetchError, locals.t);
  }

  if (!existingClass) {
    return new Response(
      JSON.stringify({ error: "Style class not found" }),
      { status: 404 }
    );
  }

  const body = await request.json() as {
    name?: string;
    description?: string;
    type?: string;
    properties?: Record<string, any>;
  };
  const { name, description, type, properties } = body;

  // Prevent renaming or deleting system classes
  if (existingClass.is_system && name && name !== existingClass.name) {
    return new Response(
      JSON.stringify({ error: "Cannot rename system classes" }),
      { status: 403 }
    );
  }

  // Build update object with only provided fields
  const updates: any = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (type !== undefined) {
    const validTypes = ['layout', 'utility', 'utility-sub', 'custom'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type" }),
        { status: 400 }
      );
    }
    updates.type = type;
  }
  if (properties !== undefined) {
    if (typeof properties !== 'object') {
      return new Response(
        JSON.stringify({ error: "Properties must be an object" }),
        { status: 400 }
      );
    }
    updates.properties = properties;
  }

  const { data: styleClass, error } = await supabase
    .from("style_classes")
    .update(updates)
    .eq("id", id)
    .eq("website_id", websiteId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  return new Response(JSON.stringify(styleClass), { status: 200 });
};

// DELETE /api/websites/:websiteId/style-classes/:id - Delete a style class
export const DELETE: APIRoute = async ({ locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId, id } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 }
    );
  }

  if (!websiteId || !id) {
    return new Response(
      JSON.stringify({ error: "Website ID and Style Class ID are required" }),
      { status: 400 }
    );
  }

  // Check if this is a system class
  const { data: existingClass, error: fetchError } = await supabase
    .from("style_classes")
    .select("is_system")
    .eq("id", id)
    .eq("website_id", websiteId)
    .single();

  if (fetchError) {
    return handleSupabaseError(fetchError, locals.t);
  }

  if (!existingClass) {
    return new Response(
      JSON.stringify({ error: "Style class not found" }),
      { status: 404 }
    );
  }

  // Prevent deleting system classes
  if (existingClass.is_system) {
    return new Response(
      JSON.stringify({ error: "Cannot delete system classes" }),
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("style_classes")
    .delete()
    .eq("id", id)
    .eq("website_id", websiteId);

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  return new Response(null, { status: 204 });
};
