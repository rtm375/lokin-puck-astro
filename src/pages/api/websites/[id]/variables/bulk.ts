import { apiHandler, requireWebsite, APIError } from "@/lib/server";

export const prerender = false;

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  const { collections, variables } = body;

  if (!Array.isArray(collections) || !Array.isArray(variables)) {
    throw new APIError("Invalid payload", 400);
  }

  // 1. Delete collections that are not in the payload
  const collectionIds = collections.map((c: any) => c.id).filter(Boolean);
  if (collectionIds.length > 0) {
    await supabase
      .from("variables_collections")
      .delete()
      .eq("website_id", id)
      .not("id", "in", `(${collectionIds.join(",")})`);
  } else {
    // If no collections are provided, delete all for this website
    await supabase
      .from("variables_collections")
      .delete()
      .eq("website_id", id);
  }

  // 2. Upsert collections
  if (collections.length > 0) {
    const { error: collectionsError } = await supabase
      .from("variables_collections")
      .upsert(
        collections.map((c: any) => ({
          id: c.id,
          website_id: id,
          name: c.name,
          modes: c.modes,
          skins: c.skins,
          variable_types: c.variable_types,
        })),
        { onConflict: "id" }
      );
    if (collectionsError) throw collectionsError;
  }

  // 3. Delete variables that are not in the payload
  const variableIds = variables.map((v: any) => v.id).filter(Boolean);
  if (variableIds.length > 0) {
    await supabase
      .from("variables")
      .delete()
      .eq("website_id", id)
      .not("id", "in", `(${variableIds.join(",")})`);
  } else {
    await supabase
      .from("variables")
      .delete()
      .eq("website_id", id);
  }

  // 4. Upsert variables
  if (variables.length > 0) {
    const { error: variablesError } = await supabase
      .from("variables")
      .upsert(
        variables.map((v: any) => ({
          id: v.id,
          website_id: id,
          variables_collection_id: v.variables_collection_id,
          name: v.name,
          value: v.value,
          mode: v.mode,
          skin: v.skin,
          is_group: v.is_group,
          group_id: v.group_id,
          sort_order: v.sort_order,
        })),
        { onConflict: "id" }
      );
    if (variablesError) throw variablesError;
  }

  return { success: true };
});
