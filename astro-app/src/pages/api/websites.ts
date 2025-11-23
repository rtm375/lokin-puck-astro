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

  if (profile?.tier === "free") {
    const { count, error: countError } = await supabase
      .from("websites")
      .select("*", { count: "exact", head: true })
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

  const body = await request.json();
  const { name, slug, description } = body;

  if (!name || !slug) {
    return new Response(
      JSON.stringify({ error: "Name and slug are required" }),
      {
        status: 400,
      },
    );
  }

  const { data: website, error: websiteError } = await supabase
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

  if (websiteError) {
    return new Response(JSON.stringify({ error: websiteError.message }), {
      status: 400,
    });
  }

  const defaultDomain = `${slug}.lokin.cloud`;

  const { error: domainError } = await supabase.from("domains").insert({
    domain: defaultDomain,
    website_id: website.id,
    type: "subdomain",
    status: "active", // Subdomains are active immediately
    is_primary: true,
  });

  if (domainError) {
    console.error("Failed to create default domain:", domainError);
  }

  return new Response(JSON.stringify(website), { status: 201 });
};
