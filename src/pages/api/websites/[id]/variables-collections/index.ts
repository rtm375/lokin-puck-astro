import { apiHandler, requireWebsite } from "@/lib/server";

export const prerender = false;

export const GET = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  await requireWebsite(supabase, id);

  const { data, error } = await supabase
    .from("variables_collections")
    .select("*")
    .eq("website_id", id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
});

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  const { data, error } = await supabase
    .from("variables_collections")
    .insert({
      website_id: id,
      name: body.name,
      is_system: body.is_system || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
});
