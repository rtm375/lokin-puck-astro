import type { APIRoute } from "astro";
import { s3Client, R2_BUCKET_NAME } from "@/lib/s3";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { websiteId, key } = params; // Note: key might need to be decoded if it contains slashes, but here it's the last segment?
  // Wait, [key] in Astro might not capture slashes correctly if not [...key].
  // But our key structure is `websiteId/filename`.
  // The route is `src/pages/api/websites/[websiteId]/files/[key].ts`.
  // If we pass the full key `websiteId/foo.jpg` in the URL, it might be tricky.
  // Better to pass just the filename part if the prefix is always websiteId.
  // OR pass the full key as a query param or body?
  // RESTful convention: DELETE /files/some-id.
  // Our ID is the key.
  // Let's assume the frontend sends the full key encoded, or we just send the filename part if we know the prefix.
  // Plan said: `src/pages/api/websites/[websiteId]/files/[key].ts`
  // If key is `websiteId/uuid-file.jpg`, then URL is `.../files/websiteId%2Fuuid-file.jpg`.
  // Astro [key] should capture it if encoded.

  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!R2_BUCKET_NAME) {
    return new Response(JSON.stringify({ error: "R2 configuration missing" }), {
      status: 500,
    });
  }

  // Reconstruct key if needed or use as is.
  // If the route is `[websiteId]/files/[key]`, and we request `.../files/foo.jpg`, key is `foo.jpg`.
  // But we stored it as `websiteId/foo.jpg`.
  // So we should reconstruct it: `${websiteId}/${key}` if the client only sends the filename.
  // However, the client might send the full key.
  // Let's assume the client sends the filename part (since websiteId is in the URL).
  // But wait, the key in R2 is `websiteId/uuid-filename`.
  // So `key` param here will be `uuid-filename`.

  const fullKey = `${websiteId}/${key}`;

  try {
    // 1. Get file size to decrement storage
    const headCommand = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fullKey,
    });

    const headResponse = await s3Client.send(headCommand);
    const fileSize = headResponse.ContentLength || 0;

    // 2. Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fullKey,
    });

    await s3Client.send(deleteCommand);

    // 3. Update Storage Usage
    const { data: profile } = await supabase
      .from("profiles")
      .select("storage_used")
      .eq("id", user.id)
      .single();

    if (profile) {
      const currentUsage = parseInt(profile.storage_used || "0");
      const newUsage = Math.max(0, currentUsage - fileSize);

      await supabase
        .from("profiles")
        .update({ storage_used: newUsage })
        .eq("id", user.id);
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
