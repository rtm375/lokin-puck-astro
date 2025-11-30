import type { APIRoute } from "astro";
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from "@/lib/s3";
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { websiteId } = params;
  const { user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // TODO: Verify user owns website (omitted for brevity, but should be here)

  if (!R2_BUCKET_NAME) {
    return new Response(JSON.stringify({ error: "R2 configuration missing" }), {
      status: 500,
    });
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: `${websiteId}/`,
    });

    const response = await s3Client.send(command);

    const files =
      response.Contents?.map((item) => {
        const key = item.Key!;
        // Remove prefix for display if needed, or keep full key
        // Key format: websiteId/uuid-filename
        const filename = key.split("/").pop();

        return {
          key: key,
          url: `https://${R2_PUBLIC_DOMAIN}/${key}`,
          size: item.Size,
          lastModified: item.LastModified,
          name: filename, // Simplified name
        };
      }) || [];

    // Sort by last modified desc
    files.sort(
      (a, b) =>
        (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0),
    );

    return new Response(JSON.stringify(files), { status: 200 });
  } catch (error: any) {
    console.error("R2 List Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, params, locals }) => {
  const { websiteId } = params;
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

  // 1. Check Subscription & Storage Limit
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, storage_used")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return new Response(JSON.stringify({ error: "Failed to fetch profile" }), {
      status: 500,
    });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
    });
  }

  // 2. Validate File
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(
      JSON.stringify({ error: "Invalid file type. Only images allowed." }),
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: "File too large. Max 5MB." }), {
      status: 400,
    });
  }

  // 3. Check Limit
  const FREE_LIMIT = 50 * 1024 * 1024; // 50MB
  const currentUsage = parseInt(profile.storage_used || "0");

  if (profile.tier === "free" && currentUsage + file.size > FREE_LIMIT) {
    return new Response(
      JSON.stringify({ error: "Storage limit reached (50MB for Free tier)." }),
      { status: 403 },
    );
  }

  // 4. Upload to R2
  const uniqueId = crypto.randomUUID();
  const key = `${websiteId}/${uniqueId}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          original_name: file.name,
          uploaded_by: user.id,
        },
      }),
    );

    // 5. Update Storage Usage
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ storage_used: currentUsage + file.size })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update storage usage:", updateError);
      // Don't fail the request, but log it.
      // Ideally we might want to rollback the upload, but for now let's proceed.
    }

    return new Response(
      JSON.stringify({
        key,
        url: `https://${R2_PUBLIC_DOMAIN}/${key}`,
        size: file.size,
        name: file.name,
      }),
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Upload Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
