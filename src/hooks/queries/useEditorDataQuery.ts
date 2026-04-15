import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Data } from "@puckeditor/core";

export const editorDataKeys = {
  page: (websiteId: string, pageId: string) => ["editor-data", websiteId, pageId] as const,
};

export function useEditorDataQuery(websiteId: string | undefined, pageId: string | undefined) {
  return useQuery({
    queryKey: editorDataKeys.page(websiteId!, pageId!),
    queryFn: async () => {
      const dbPage = await api.get<any>(
        `/api/websites/${websiteId}/pages/${pageId}/editor-data`
      );
      return (
        dbPage.data || {
          root: { props: { title: dbPage.title || "New Page" } },
          content: [],
          zones: {},
        }
      );
    },
    enabled: !!websiteId && !!pageId,
    // Editor data should be fresh on every load — don't refetch in background while editing
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

interface SaveEditorPayload {
  data: Data;
  css?: string;
  _savedAt: string | null;
}

interface SaveEditorResponse {
  success: boolean;
  url: string;
  updatedAt?: string;
}

export function useSaveEditorMutation(websiteId: string | undefined, pageId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveEditorPayload) =>
      api.post<SaveEditorResponse>(
        `/api/websites/${websiteId}/pages/${pageId}/editor-save`,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: editorDataKeys.page(websiteId!, pageId!),
      });
    },
  });
}
