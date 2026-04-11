import type { APIRoute } from "astro";
import { handleSupabaseError } from "@/lib/server/db";

export const prerender = false;

// GET /api/websites/:websiteId/variables - List all variables for a website
export const GET: APIRoute = async ({ locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 },
    );
  }

  if (!websiteId) {
    return new Response(
      JSON.stringify({ error: "Website ID is required" }),
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

  // Fetch variables for this website
  const { data: variables, error } = await supabase
    .from("variables")
    .select("*")
    .eq("website_id", websiteId)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  return new Response(JSON.stringify(variables || []), { status: 200 });
};

// POST /api/websites/:websiteId/variables - Create a new variable
export const POST: APIRoute = async ({ request, locals, params }) => {
  const { supabase, user } = locals;
  const { websiteId } = params;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 },
    );
  }

  if (!websiteId) {
    return new Response(
      JSON.stringify({ error: "Website ID is required" }),
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
    name: string;
    key: string;
    category: string;
    type: string;
    value: {
      light: string;
      dark: string;
    };
  };
  const { name, key, category, type, value } = body;

  // Validate required fields
  if (!name || !key || !category || !type || !value) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields: name, key, category, type, value",
      }),
      { status: 400 },
    );
  }

  // Validate value structure
  if (!value.light || !value.dark) {
    return new Response(
      JSON.stringify({
        error: "Value must contain both 'light' and 'dark' theme values",
      }),
      { status: 400 },
    );
  }

  // Create the variable
  const { data: newVariable, error } = await supabase
    .from("variables")
    .insert({
      website_id: websiteId,
      name,
      key,
      category,
      type,
      value_light: value.light,
      value_dark: value.dark,
    })
    .select()
    .single();

  if (error) {
    return handleSupabaseError(error, locals.t);
  }

  // Transform database format to API format
  const variable = {
    ...newVariable,
    value: {
      light: newVariable.value_light,
      dark: newVariable.value_dark,
    },
  };

  return new Response(JSON.stringify(variable), { status: 201 });
};
