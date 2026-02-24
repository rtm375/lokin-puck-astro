import type { APIRoute } from "astro";
import { syncToKV } from "@/lib/server/cloudflare";
import { handleSupabaseError } from "@/lib/server/db";
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      {
        status: 401,
      },
    );
  }

  const { data: websites, error } = await supabase
    .from("websites")
    .select("*")
    .eq("user_uid", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return handleSupabaseError(error, locals.t);
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
    return handleSupabaseError(profileError, locals.t);
  }

  if (profile?.tier === "free") {
    const { count, error: countError } = await supabase
      .from("websites")
      .select("*", { count: "exact", head: true })
      .eq("user_uid", user.id);

    if (countError) {
      return handleSupabaseError(countError, locals.t);
    }

    if (count !== null && count >= 1) {
      return new Response(
        JSON.stringify({
          error: locals.t("api.websites.limit_reached"),
        }),
        { status: 403 },
      );
    }
  }

  const body = await request.json();
  const { name, subdomain, description } = body;

  if (!name || !subdomain) {
    return new Response(
      JSON.stringify({ error: locals.t("api.websites.validation_required") }),
      {
        status: 400,
      },
    );
  }

  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .insert({
      name,
      subdomain,
      description,
      user_uid: user.id,
      settings: {},
    })
    .select()
    .single();

  if (websiteError) {
    return handleSupabaseError(websiteError, locals.t);
  }

  const defaultDomain = `${subdomain}.lokin.id`;

  const { error: domainError } = await supabase.from("domains").insert({
    domain: defaultDomain,
    website_id: website.id,
    type: "subdomain",
    status: "active",
    is_primary: true,
  });

  if (domainError) {
    console.error("Failed to create default domain:", domainError);
  }

  if (website?.id) {
    await syncToKV(defaultDomain, website.id);
  }

  return new Response(JSON.stringify(website), { status: 201 });
};
