import type { APIRoute, APIContext } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleSupabaseError } from "@/pages/api/utils";

export class APIError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

type HandlerFunction = (
  context: APIContext,
) => Promise<Response | Record<string, any> | null | void>;

export function apiHandler(handler: HandlerFunction): APIRoute {
  return async (context) => {
    try {
      const result = await handler(context);

      // If result is already a Response, return it
      if (result instanceof Response) {
        return result;
      }

      // If result is null/void, return 204 No Content
      if (result === null || result === undefined) {
        return new Response(null, { status: 204 });
      }

      // Otherwise, return JSON response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err: any) {
      console.error("API Error:", err);

      // Handle custom APIError
      if (err instanceof APIError) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle Supabase Errors (reuse existing logic if possible, or adapt)
      if (err.code || err.message?.includes("row-level security")) {
        return handleSupabaseError(err, (key) => key); // Simple fallback for t function
      }

      // Fallback 500
      return new Response(
        JSON.stringify({ error: err.message || "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}

// --- Validators ---

export async function requireWebsite(
  supabase: SupabaseClient,
  websiteId: string | undefined,
) {
  if (!websiteId) {
    throw new APIError("Website ID is required", 400);
  }

  const { count, error } = await supabase
    .from("websites")
    .select("id", { count: "exact", head: true })
    .eq("id", websiteId);

  if (error) {
    throw error; // Let apiHandler handle DB errors
  }

  if (count === 0) {
    throw new APIError("Website not found", 404);
  }

  return websiteId;
}

export async function requirePage(
  supabase: SupabaseClient,
  pageId: string | undefined,
) {
  if (!pageId) {
    throw new APIError("Page ID is required", 400);
  }

  const { count, error } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("id", pageId);

  if (error) {
    throw error;
  }

  if (count === 0) {
    throw new APIError("Page not found", 404);
  }

  return pageId;
}

export function requireAuth(locals: App.Locals) {
  if (!locals.user) {
    throw new APIError("Unauthorized", 401);
  }
  return locals.user;
}
