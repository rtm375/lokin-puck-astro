import type { APIRoute } from "astro";
import dns from "node:dns/promises";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;
  const body = await request.json();
  const { domain } = body;

  if (!domain)
    return new Response(locals.t("api.domains.missing_domain"), {
      status: 400,
    });

  const { data: domainRecord } = await supabase
    .from("domains")
    .select("*")
    .eq("domain", domain)
    .single();

  if (!domainRecord)
    return new Response(locals.t("api.domains.not_found"), { status: 404 });

  let isVerified = false;
  const targetCNAME = "sites.lokin.id";

  try {
    const resolveCname = await dns.resolveCname(domain);
    if (resolveCname.includes(targetCNAME)) {
      isVerified = true;
    }
  } catch (error: any) {
    console.log(`DNS lookup failed for ${domain}:`, error.code);
  }

  if (isVerified) {
    const { error } = await supabase
      .from("domains")
      .update({ status: "active" })
      .eq("domain", domain);

    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });

    return new Response(JSON.stringify({ status: "active", verified: true }), {
      status: 200,
    });
  } else {
    return new Response(
      JSON.stringify({
        status: "pending",
        verified: false,
        message: locals.t("api.domains.dns_pending"),
      }),
      { status: 200 },
    );
  }
};
