import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, bio, theme, language } = body;

    // 1. Fetch existing profile preferences to merge them
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);

    const existingPreferences = currentProfile?.preferences || {};

    // 2. Prepare Update Payload
    // Note: We do NOT need 'id' in the payload for a simple update
    const updates = {
      full_name,
      bio,
      preferences: {
        ...existingPreferences,
        theme,
        language
      },
      updated_at: new Date().toISOString(),
    };

    // 3. Perform UPDATE (Since profile exists)
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id) // Target the specific user
      .select()
      .single();

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify(data), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
};