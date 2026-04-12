import { apiHandler, requireWebsite, APIError } from "@/lib/server";

export const prerender = false;

export const GET = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  await requireWebsite(supabase, id);

  const { data, error } = await supabase
    .from("variables")
    .select("*")
    .eq("website_id", id)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
});

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  if (!body.variables_collection_id) {
    throw new APIError("variables_collection_id is required", 400);
  }

  if (!body.name) {
    throw new APIError("name is required", 400);
  }

  const { data, error } = await supabase
    .from("variables")
    .insert({
      website_id: id,
      variables_collection_id: body.variables_collection_id,
      name: body.name,
      value: body.value ?? "",
      mode: body.mode || "Light",
      skin: body.skin || "Default",
      is_group: !!body.is_group,
      group_id: body.group_id || null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
});
