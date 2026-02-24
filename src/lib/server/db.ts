import type { PostgrestError } from "@supabase/supabase-js";

export function handleSupabaseError(
  error: PostgrestError | Error,
  t: (key: string) => string,
) {
  console.error("Supabase API Error:", error);

  // Check for RLS policy violation
  // Postgres code 42501: insufficient_privilege
  if (
    (error as PostgrestError).code === "42501" ||
    error.message.includes("row-level security policy")
  ) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  return new Response(
    JSON.stringify({ error: t("api.generic_error") || error.message }),
    {
      status: 500,
    },
  );
}
