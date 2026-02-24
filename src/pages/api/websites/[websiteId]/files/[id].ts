import type { APIRoute } from "astro";
import { s3Client, R2_BUCKET_NAME } from "@/lib/server/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { websiteId, id } = params;
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

  try {
    // 1. Get file record from DB
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("website_id", websiteId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !file) {
      return new Response(
        JSON.stringify({ error: "File not found or unauthorized" }),
        { status: 404 },
      );
    }

    // 2. Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: file.key,
    });

    await s3Client.send(deleteCommand);

    // 3. Delete from DB
    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete file from DB:", deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
      });
    }

    // 4. Update Storage Usage
    const { data: profile } = await supabase
      .from("profiles")
      .select("storage_used")
      .eq("id", user.id)
      .single();

    if (profile) {
      const currentUsage = parseInt(profile.storage_used || "0");
      const newUsage = Math.max(0, currentUsage - file.size);

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
