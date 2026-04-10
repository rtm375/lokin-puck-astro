import { apiHandler, requirePage, requireAuth } from "@/lib/server";

export const prerender = false;

export const GET = apiHandler(async () => {
  return { message: "nothings here friends" };
});

// PATCH: Update Page Settings (Title, SEO, Path, Status)
export const PATCH = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { pageId } = ctx.params;
  const request = ctx.request;

  requireAuth(ctx.locals);
  await requirePage(supabase, pageId);

  const body = await request.json();

  // Sync title changes to Puck Data if it exists in the body
  // Note: Deep merging logic might be needed in a real app,
  // but here we assume the editor handles the content 'data' updates separately.
  // This endpoint is strictly for metadata settings.

  const { error } = await supabase
    .from("pages")
    .update({
      title: body.title,
      path: body.path,
      status: body.status,
      description: body.description,
      image_url: body.image_url,
      head_code: body.head_code,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (error) throw error;

  return { success: true };
});

// DELETE: Delete Page
export const DELETE = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { pageId } = ctx.params;

  requireAuth(ctx.locals);
  await requirePage(supabase, pageId);

  const { error } = await supabase.from("pages").delete().eq("id", pageId);

  if (error) throw error;

  return { success: true };
});
