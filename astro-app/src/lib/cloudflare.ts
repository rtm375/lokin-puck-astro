export async function syncToKV(key: string, value: string) {
  const accountId = import.meta.env.CF_ACCOUNT_ID;
  const namespaceId = import.meta.env.CF_KV_NAMESPACE_ID;
  const token = import.meta.env.CF_API_TOKEN;

  if (!accountId || !namespaceId || !token) {
    console.warn("Cloudflare credentials missing. Skipping KV sync.");
    return;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;

  try {
    const kv = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: value,
    });

    console.log("kv call", kv);
  } catch (err) {
    console.error("Failed to sync to KV:", err);
  }
}
