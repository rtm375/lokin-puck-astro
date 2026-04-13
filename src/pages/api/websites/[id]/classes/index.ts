import { apiHandler, requireWebsite, APIError } from "@/lib/server";

export const prerender = false;

export const GET = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  await requireWebsite(supabase, id);

  const { data, error } = await supabase
    .from("classes")
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

  if (!body.name) {
    throw new APIError("name is required", 400);
  }

  const { data, error } = await supabase
    .from("classes")
    .insert({
      website_id: id,
      name: body.name,
      parent_id: body.parent_id || null,
      styles: body.styles || {},
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
});
