import { defineMiddleware } from "astro:middleware";
import { getSupabaseClient } from "./lib/supabase-client";
import { initI18n } from "./i18n/client";
import { jwtVerify } from "jose";
import type { User } from "@supabase/supabase-js";
import { browserLang } from "./utils";
import { LRUCache } from "./lib/cache";

// Initialize LRU Cache for domain resolution
// Max 1000 domains, TTL 60 seconds
const domainCache = new LRUCache<string, string>({ max: 1000, ttl: 60 * 1000 });

export const onRequest = defineMiddleware(
  async ({ request, cookies, locals, url, redirect }, next) => {
    const supabase = getSupabaseClient(request, cookies);
    let user: User | null = null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const secret = new TextEncoder().encode(
      import.meta.env.SUPABASE_JWT_SECRET,
    );

    if (accessToken && secret) {
      try {
        const { payload } = await jwtVerify(accessToken, secret);
        user = {
          id: payload.sub as string,
          email: payload.email as string,
          user_metadata: payload.user_metadata as any,
        } as User;
      } catch (e) {
        const { data, error } = await supabase.auth.getUser();
        if (!error) user = data.user;
      }
    } else {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    }

    locals.supabase = supabase;
    locals.user = user;

    const pathname = url.pathname;
    const isAppRoute = pathname.startsWith("/admin");

    const langCookie = cookies.get("lang")?.value;
    let lang =
      langCookie ||
      browserLang(request.headers.get("accept-language") || "en-EN");

    // if there is a user, and there is no cookie, we should get the profile and set the cookie
    if (user && !langCookie) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single();
      if (profile && profile.preferences?.language) {
        lang = profile.preferences.language;
        cookies.set("lang", lang, {
          path: "/",
          maxAge: 31536000,
          httpOnly: true,
          sameSite: "lax",
        });
      }
    }

    let preferences = { theme: "system", language: lang };
    locals.preferences = preferences;
    locals.t = await initI18n(lang);

    const isLoggedIn = !!user;

    if (isAppRoute) {
      if (!isLoggedIn) {
        return redirect("/login", 302);
      }
    }

    const guestRoutes = ["/login", "/register"];
    if (isLoggedIn && guestRoutes.includes(pathname)) {
      return redirect("/admin/dashboard", 302);
    }

    // Domain Resolution Logic for User Sites
    if (
      !isAppRoute &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_image")
    ) {
      const host = request.headers.get("host") || "";
      let websiteId: string | null = null;

      // Check for subdomain (assuming lokin.id is the base)
      // TODO: Make base domain configurable via env
      const baseDomain = "lokin.id";

      // Check Cache first
      const cachedWebsiteId = domainCache.get(host);
      if (cachedWebsiteId) {
        websiteId = cachedWebsiteId;
      } else {
        if (host.endsWith(`.${baseDomain}`)) {
          const subdomain = host.replace(`.${baseDomain}`, "");
          // Query websites table
          const { data } = await supabase
            .from("websites")
            .select("id")
            .eq("subdomain", subdomain)
            .single();
          console.log("Website ID if subdomain:", data?.id);
          if (data) websiteId = data.id;
        } else if (host !== baseDomain && !host.includes("localhost")) {
          // Custom domain
          const { data } = await supabase
            .from("domains")
            .select("website_id")
            .eq("domain", host)
            .eq("status", "active") // Only active domains
            .single();
          console.log("Website ID if domain:", data?.website_id);
          if (data) websiteId = data.website_id;
        }

        // Set Cache if found
        if (websiteId) {
          domainCache.set(host, websiteId);
        }
      }

      if (websiteId) {
        locals.websiteId = websiteId;
        // Rewrite to _user_site folder to isolate user content
        // This prevents access to SaaS routes like /login, /pricing, etc.
        return next(`/sites${pathname}`);
      }
    }

    return next();
  },
);
