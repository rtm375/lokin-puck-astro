import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from "@/lib/server/s3";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import {
  apiHandler,
  requireWebsite,
  requireAuth,
  APIError,
} from "@/lib/server";

export const prerender = false;

// Helper: Convert numeric ID to sharded path
function getShardedPath(id: number): string {
  const padded = String(id).padStart(12, "0");
  const part1 = padded.slice(0, 4);
  const part2 = padded.slice(4, 8);
  const part3 = padded.slice(8, 12);
  return `${part1}/${part2}/${part3}`;
}

// Helper: Sanitize filename (replace spaces with underscores, remove special chars)
function sanitizeFilename(filename: string): string {
  return filename.replace(/\s+/g, "_").replace(/[^\w\-_.]/g, "");
}

export const GET = apiHandler(async (ctx) => {
  const { websiteId } = ctx.params;
  const { supabase } = ctx.locals;
  const url = ctx.url;

  requireAuth(ctx.locals);
  await requireWebsite(supabase, websiteId);

  // Pagination parameters
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from("files")
    .select("*", { count: "exact", head: true })
    .eq("website_id", websiteId);

  if (countError) console.error("Failed to count files:", countError);

  // Get total storage usage across all files
  const { data: allFiles, error: storageError } = await supabase
    .from("files")
    .select("size")
    .eq("website_id", websiteId);

  const totalStorage =
    allFiles?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;

  if (storageError) console.error("Failed to get storage:", storageError);

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    files: files || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    totalStorage,
  };
});

export const POST = apiHandler(async (ctx) => {
  const { websiteId } = ctx.params;
  const { supabase } = ctx.locals;
  const request = ctx.request;

  const user = requireAuth(ctx.locals);
  await requireWebsite(supabase, websiteId);

  if (!R2_BUCKET_NAME) {
    throw new APIError("R2 configuration missing", 500);
  }

  // 1. Check Subscription & Storage Limit
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, storage_used")
    .eq("id", user.id)
    .single();

  if (profileError) throw new APIError("Failed to fetch profile", 500);

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) throw new APIError("No file provided", 400);

  // 2. Validate File
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new APIError("Invalid file type. Only images allowed.", 400);
  }

  if (file.size > MAX_SIZE) {
    throw new APIError("File too large. Max 5MB.", 400);
  }

  // 3. Check Limit
  const FREE_LIMIT = 50 * 1024 * 1024; // 50MB
  const currentUsage = parseInt(profile.storage_used || "0");

  if (profile.tier === "free" && currentUsage + file.size > FREE_LIMIT) {
    throw new APIError("Storage limit reached (50MB for Free tier).", 403);
  }

  // 4. Get Website Short ID
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("short_id")
    .eq("id", websiteId)
    .single();

  if (websiteError || !website?.short_id) {
    throw new APIError("Website not found", 404);
  }

  // 5. Handle Filename Collisions
  let finalFilename = sanitizeFilename(file.name);
  const { data: existingFile } = await supabase
    .from("files")
    .select("id")
    .eq("website_id", websiteId)
    .eq("name", finalFilename)
    .single();

  if (existingFile) {
    // Collision detected: Append UID suffix (first 8 chars of a UUID)
    const suffix = crypto.randomUUID().split("-")[0];
    const ext = finalFilename.split(".").pop();
    const nameWithoutExt = finalFilename.replace(`.${ext}`, "");
    finalFilename = `${nameWithoutExt}-${suffix}.${ext}`;
  }

  // 6. Insert into DB
  const { data: fileRecord, error: insertError } = await supabase
    .from("files")
    .insert({
      website_id: websiteId,
      user_id: user.id,
      name: finalFilename,
      size: file.size,
      type: file.type,
      key: "", // Will update after upload
      url: "", // Will update after upload
    })
    .select()
    .single();

  if (insertError || !fileRecord) {
    console.error("Failed to insert file record:", insertError);
    throw new APIError("Failed to create file record", 500);
  }

  // 7. Generate path using Website Short ID
  const shardedPath = getShardedPath(website.short_id);
  const key = `w/${shardedPath}/${finalFilename}`;
  const url = `https://${R2_PUBLIC_DOMAIN}/${key}`;

  // 8. Upload to R2
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    // 9. Update file record with key and URL
    const { error: updateFileError } = await supabase
      .from("files")
      .update({ key, url })
      .eq("id", fileRecord.id);

    if (updateFileError) {
      console.error("Failed to update file record:", updateFileError);
    }

    // 10. Update Storage Usage
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ storage_used: currentUsage + file.size })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update storage usage:", updateError);
    }

    return {
      id: fileRecord.id,
      key,
      url,
      size: file.size,
      name: finalFilename,
      type: file.type,
      created_at: fileRecord.created_at,
    };
  } catch (error: any) {
    console.error("Upload Error:", error);
    // Rollback: Delete the DB record
    await supabase.from("files").delete().eq("id", fileRecord.id);
    throw new APIError(error.message, 500);
  }
});

export const DELETE = apiHandler(async (ctx) => {
  const { websiteId } = ctx.params;
  const { supabase } = ctx.locals;
  const request = ctx.request;

  const user = requireAuth(ctx.locals);
  await requireWebsite(supabase, websiteId);

  if (!R2_BUCKET_NAME) {
    throw new APIError("R2 configuration missing", 500);
  }

  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new APIError("No files selected", 400);
  }

  // 1. Get file records from DB
  const { data: files, error: fetchError } = await supabase
    .from("files")
    .select("*")
    .in("id", ids)
    .eq("website_id", websiteId)
    .eq("user_id", user.id);

  if (fetchError || !files || files.length === 0) {
    throw new APIError("Files not found or unauthorized", 404);
  }

  // 2. Delete from R2
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: R2_BUCKET_NAME,
    Delete: {
      Objects: files.map((f) => ({ Key: f.key })),
      Quiet: true,
    },
  });

  await s3Client.send(deleteCommand);

  // 3. Delete from DB
  const { error: deleteError } = await supabase
    .from("files")
    .delete()
    .in("id", ids);

  if (deleteError) {
    console.error("Failed to delete files from DB:", deleteError);
    throw new APIError(deleteError.message, 500);
  }

  // 4. Update Storage Usage
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const { data: profile } = await supabase
    .from("profiles")
    .select("storage_used")
    .eq("id", user.id)
    .single();

  if (profile) {
    const currentUsage = parseInt(profile.storage_used || "0");
    const newUsage = Math.max(0, currentUsage - totalSize);

    await supabase
      .from("profiles")
      .update({ storage_used: newUsage })
      .eq("id", user.id);
  }

  return null; // 204 No Content
});
