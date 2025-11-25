import type { APIRoute } from "astro";
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(
      JSON.stringify({ error: locals.t("api.unauthorized") }),
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { full_name, bio, theme, language } = body;

    // 2. Prepare Update Payload
    // Note: We do NOT need 'id' in the payload for a simple update
    const updates = {
      full_name,
      bio,
      preferences: {
        theme,
        language,
      },
      updated_at: new Date().toISOString(),
    };

    // 3. Perform UPDATE (Since profile exists)
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id) // Target the specific user
      .select()
      .single();

    if (error) throw new Error(locals.t("user_profile.error_message"));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Set-Cookie": `lang=${language}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
};
