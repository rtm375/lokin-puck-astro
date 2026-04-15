import { api } from "@/lib/client";

export async function publishPage({ data, websiteId, pageId, _savedAt }: any) {
  return api.post(
    `/api/websites/${websiteId}/pages/${pageId}/editor-save`,
    { data, _savedAt }
  );
}