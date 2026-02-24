import {
  apiHandler,
  requireWebsite,
  requireAuth,
  APIError,
} from "@/lib/server";

export const prerender = false;

export const DELETE = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id, domain } = ctx.params;

  requireAuth(ctx.locals);
  await requireWebsite(supabase, id);

  if (!domain) {
    throw new APIError("Domain is required", 400);
  }

  const { error } = await supabase
    .from("domains")
    .delete()
    .eq("domain", domain)
    .eq("website_id", id); // Ensure domain belongs to website

  if (error) throw error;

  return { success: true };
});
