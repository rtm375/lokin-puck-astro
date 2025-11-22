import type { APIRoute } from "astro";
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data: websites, error } = await supabase
    .from("websites")
    .select("*")
    .eq("user_uid", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching websites:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch websites" }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(websites), { status: 200 });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Fetch profile from supabase
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return new Response(JSON.stringify({ error: "Could not fetch profile" }), {
      status: 500,
    });
  }

  // 2. Enforce Limits
  if (profile?.tier === "free") {
    const { count, error: countError } = await supabase
      .from("websites")
      .select("*", { count: "exact", head: true }) // Head true means we only get the count, not data
      .eq("user_uid", user.id);

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 500,
      });
    }

    if (count !== null && count >= 1) {
      return new Response(
        JSON.stringify({
          error:
            "Free Plan Limit Reached. Please upgrade to Pro to create more websites.",
        }),
        { status: 403 },
      );
    }
  }

  // 3. Proceed with Creation
  const body = await request.json();
  const { name, slug, description } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name are required" }), {
      status: 400,
    });
  }

  const { data, error } = await supabase
    .from("websites")
    .insert({
      name,
      slug,
      description,
      user_uid: user.id,
      settings: {},
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify(data), { status: 201 });
};
