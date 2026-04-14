import { apiHandler, requireWebsite, APIError } from "@/lib/server";

export const prerender = false;

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  const { classes } = body;

  if (!Array.isArray(classes)) {
    throw new APIError("Invalid payload", 400);
  }

  // 1. Delete classes that are not in the payload
  const classIds = classes.map((c: any) => c.id).filter(Boolean);
  if (classIds.length > 0) {
    // Collect child IDs to avoid foreign key violations (though on delete cascade handles this)
    await supabase
      .from("classes")
      .delete()
      .eq("website_id", id)
      .not("id", "in", `(${classIds.join(",")})`);
  } else {
    await supabase
      .from("classes")
      .delete()
      .eq("website_id", id);
  }

  // 2. Upsert classes
  if (classes.length > 0) {
    const { error: classesError } = await supabase
      .from("classes")
      .upsert(
        classes.map((c: any) => ({
          id: c.id,
          website_id: id,
          name: c.name,
          css_class_name: c.css_class_name || null,
          parent_id: c.parent_id,
          styles: c.styles,
          sort_order: c.sort_order,
        })),
        { onConflict: "id" }
      );
    if (classesError) throw classesError;
  }

  return { success: true };
});
