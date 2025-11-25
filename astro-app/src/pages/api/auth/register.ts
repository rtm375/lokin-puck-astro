import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, url, locals }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: locals.t("api.auth.missing_fields") }),
      {
        status: 400,
      },
    );
  }

  const { supabase } = locals;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${url.origin}/admin/dashboard`,
    },
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message, error_code: error.code }),
      { status: error.status },
    );
  }

  return new Response(
    JSON.stringify({
      redirect: "/login?message=check_email_confirmation",
    }),
    { status: 200 },
  );
};
