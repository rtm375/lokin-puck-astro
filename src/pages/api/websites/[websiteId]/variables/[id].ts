import type { APIRoute } from "astro";
import { handleSupabaseError } from "@/lib/server/db";

export const prerender = false;

// PATCH /api/websites/:websiteId/variables/:id - Update a variable
export const PATCH: APIRoute = async ({ request, locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId, id } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 },
    );
  }

  if (!websiteId || !id) {
    return new Response(
      JSON.stringify({ error: "Website ID and Variable ID are required" }),
      { status: 400 },
    );
  }

  // Verify user has access to this website
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("id")
    .eq("id", websiteId)
    .eq("user_uid", user.id)
    .single();

  if (websiteError || !website) {
    return new Response(
      JSON.stringify({ error: "Website not found or access denied" }),
      { status: 403 },
    );
  }

  const body = await request.json() as {
    name?: string;
    key?: string;
    category?: string;
    type?: string;
    value?: {
      light?: string;
      dark?: string;
    };
  };
  const updates: any = {};

  // Build update object with only provided fields
  if (body.name !== undefined) updates.name = body.name;
  if (body.key !== undefined) updates.key = body.key;
  if (body.category !== undefined) updates.category = body.category;
  if (body.type !== undefined) updates.type = body.type;
  
  // Handle value updates
  if (body.value !== undefined) {
    if (body.value.light !== undefined) updates.value_light = body.value.light;
    if (body.value.dark !== undefined) updates.value_dark = body.value.dark;
  }

  // Add updated_at timestamp
  updates.updated_at = new Date().toISOString();

  // Update the variable
  const { data: updatedVariable, error } = await supabase
    .from("variables")
    .update(updates)
    .eq("id", id)
    .eq("website_id", websiteId)
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  if (!updatedVariable) {
    return new Response(
      JSON.stringify({ error: "Variable not found" }),
      { status: 404 },
    );
  }

  // Transform database format to API format
  const variable = {
    ...updatedVariable,
    value: {
      light: updatedVariable.value_light,
      dark: updatedVariable.value_dark,
    },
  };

  return new Response(JSON.stringify(variable), { status: 200 });
};

// DELETE /api/websites/:websiteId/variables/:id - Delete a variable
export const DELETE: APIRoute = async ({ locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId, id } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 },
    );
  }

  if (!websiteId || !id) {
    return new Response(
      JSON.stringify({ error: "Website ID and Variable ID are required" }),
      { status: 400 },
    );
  }

  // Verify user has access to this website
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("id")
    .eq("id", websiteId)
    .eq("user_uid", user.id)
    .single();

  if (websiteError || !website) {
    return new Response(
      JSON.stringify({ error: "Website not found or access denied" }),
      { status: 403 },
    );
  }

  // Delete the variable
  const { error } = await supabase
    .from("variables")
    .delete()
    .eq("id", id)
    .eq("website_id", websiteId);

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
