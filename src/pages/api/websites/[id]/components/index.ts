import {
  apiHandler,
  requireWebsite,
  requireAuth,
  APIError,
} from "@/lib/server";

export const GET = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;

  await requireWebsite(supabase, id);

  const { data, error } = await supabase
    .from("components")
    .select("*")
    .eq("website_id", id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
});

export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const request = ctx.request;

  requireAuth(ctx.locals);
  await requireWebsite(supabase, id);

  const body = await request.json();
  const { name, data } = body;

  if (!name || !data) {
    throw new APIError("Name and Data are required", 400);
  }

  const { data: newComponent, error } = await supabase
    .from("components")
    .insert({ website_id: id, name, data })
    .select()
    .single();

  if (error) throw error;

  return newComponent;
});
