interface Env {
  R2_BUCKET: R2Bucket;
  KV: KVNamespace;
  BASE_DOMAIN: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (!env.R2_BUCKET || !env.KV) {
      return new Response(
        `Configuration Error: Bindings missing. R2=${!!env.R2_BUCKET}, KV=${!!env.KV}`,
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);

    // 1. Check Cache
    let response = await cache.match(cacheKey);
    if (response) return response;

    // 2. Identify Site
    const hostname = request.headers.get("X-Forwarded-Host") || url.hostname;
    let siteId: string | null = null;

    const lastDotIndex = hostname.lastIndexOf(".");
    console.log(lastDotIndex);
    if (lastDotIndex !== -1) {
      siteId = await env.KV.get(hostname.substring(0, lastDotIndex));
    } else {
      siteId = hostname;
    }

    if (!siteId) {
      return new Response("Site Not Found (KV Lookup Failed)", { status: 404 });
    }

    let path = url.pathname;

    if (path === "/") {
      path = "index.html";
    } else if (path.endsWith("/")) {
      path += "index.html";
    } else if (!path.match(/\.[a-zA-Z0-9]+$/)) {
      path += "/index.html";
    }

    if (path.startsWith("/")) {
      path = path.substring(1);
    }

    const r2Path = `sites/${siteId}/${path}`;
    console.log(r2Path);

    const object = await env.R2_BUCKET.get(r2Path);

    if (!object) {
      // Try 404 page
      const errorPage = await env.R2_BUCKET.get(`sites/${siteId}/404.html`);
      if (errorPage) {
        return new Response(errorPage.body, {
          headers: { "Content-Type": "text/html" },
          status: 404,
        });
      }
      return new Response("Page Not Found", { status: 404 });
    }

    // 4. Serve & Cache
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=60");

    response = new Response(object.body, { headers });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
