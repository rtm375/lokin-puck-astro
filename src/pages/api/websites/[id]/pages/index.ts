import {
  apiHandler,
  requireWebsite,
  requireAuth,
} from "@/lib/server/api-handler";

export const prerender = false;

// GET: List all pages for a website
export const GET = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const url = ctx.url;

  await requireWebsite(supabase, id);

  // Pagination parameters
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from("pages")
    .select("id, title, path, status, updated_at, image_url", {
      count: "exact",
      head: true,
    })
    .eq("website_id", id);

  if (countError) throw countError;

  // 2. Fetch Pages with pagination
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, title, path, status, updated_at, image_url")
    .eq("website_id", id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    pages: pages || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
});

// POST: Create a new page
export const POST = apiHandler(async (ctx) => {
  const { supabase } = ctx.locals;
  const { id } = ctx.params;
  const request = ctx.request;

  requireAuth(ctx.locals);
  await requireWebsite(supabase, id);

  const body = await request.json();

  // 2. Initialize Puck Data
  const initialPuckData = {
    root: { props: { title: body.title } },
    content: [],
    zones: {},
  };

  // 3. Insert Page
  const { data, error } = await supabase
    .from("pages")
    .insert({
      website_id: id,
      title: body.title,
      path: body.path,
      status: body.status || "draft",
      description: body.description,
      image_url: body.image_url,
      head_code: body.head_code,
      data: initialPuckData,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
});
