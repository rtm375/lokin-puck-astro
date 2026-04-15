import { apiHandler, requireWebsite, APIError } from "@/lib/server";

export const prerender = false;

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const body = (await ctx.request.json()) as any;
  await requireWebsite(supabase, id);

  const { classes, _savedAt } = body;

  if (!Array.isArray(classes)) {
    throw new APIError("Invalid payload", 400);
  }

  // Conflict detection: check if server data was modified since client last fetched
  if (_savedAt) {
    const { data: latestRows } = await supabase
      .from("classes")
      .select("updated_at")
      .eq("website_id", id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (latestRows && latestRows.length > 0) {
      const serverUpdatedAt = new Date(latestRows[0].updated_at).getTime();
      const clientSavedAt = new Date(_savedAt).getTime();
      if (serverUpdatedAt > clientSavedAt) {
        return {
          error: "CONFLICT",
          message: "Data was modified on another device",
          serverUpdatedAt: latestRows[0].updated_at,
          _status: 409,
        };
      }
    }
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

  const now = new Date().toISOString();

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
          updated_at: now,
        })),
        { onConflict: "id" }
      );
    if (classesError) throw classesError;
  }

  return { success: true, updatedAt: now };
});
