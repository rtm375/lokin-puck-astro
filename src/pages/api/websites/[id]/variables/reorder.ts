import { apiHandler, requireWebsite } from "@/lib/server";

export const prerender = false;

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  const items = body.variables || [];
  
  await Promise.all(
    items.map((item: any) =>
      supabase
        .from("variables")
        .update({ sort_order: item.sort_order, group_id: item.group_id })
        .eq("website_id", id)
        .eq("id", item.id)
    )
  );

  return { success: true };
});
