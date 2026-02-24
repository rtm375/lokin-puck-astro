import { apiHandler, requireWebsite, requireAuth } from "@/lib/server";

export const prerender = false;

// GET: List domains
export const GET = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;

  await requireWebsite(supabase, id);

  // 2. Get Domains
  const { data: domains, error } = await supabase
    .from("domains")
    .select("*")
    .eq("website_id", id);

  if (error) throw error;

  return domains || [];
});

// POST: Add Custom Domain
export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const request = ctx.request;

  requireAuth(ctx.locals);
  await requireWebsite(supabase, id);

  const body = await request.json();

  // Add to DB
  const { data, error } = await supabase
    .from("domains")
    .insert({
      domain: body.domain,
      website_id: id,
      type: "custom",
      status: "pending", // In real app, trigger Cloudflare Custom Hostname API here
    })
    .select()
    .single();

  if (error) throw error;

  // TODO: Call Cloudflare API to register Custom Hostname for SSL

  return data;
});
