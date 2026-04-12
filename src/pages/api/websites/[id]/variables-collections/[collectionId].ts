import { apiHandler, requireWebsite } from "@/lib/server";

export const prerender = false;

export const PATCH = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id, collectionId } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  const { data, error } = await supabase
    .from("variables_collections")
    .update(body)
    .eq("website_id", id)
    .eq("id", collectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
});

export const DELETE = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id, collectionId } = ctx.params;
  await requireWebsite(supabase, id);

  const { error } = await supabase
    .from("variables_collections")
    .delete()
    .eq("website_id", id)
    .eq("id", collectionId);

  if (error) throw error;
  return { success: true };
});
