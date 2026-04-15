import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Class } from "@/types";
import { generateCSSClassName } from "@/components/client/website/pages/editor/core/css-engine";

export const classKeys = {
  all: (websiteId: string) => ["classes", websiteId] as const,
};

export function useClassesQuery(websiteId: string | undefined) {
  return useQuery({
    queryKey: classKeys.all(websiteId!),
    queryFn: async () => {
      const classes = await api.get<Class[]>(`/api/websites/${websiteId}/classes`);
      // Ensure all classes have CSS class names
      return classes
        .map((cls) => ({
          ...cls,
          css_class_name: cls.css_class_name || generateCSSClassName(),
        }))
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    enabled: !!websiteId,
  });
}

interface SaveClassesPayload {
  classes: Class[];
  _savedAt: string | null;
}

interface SaveClassesResponse {
  success: boolean;
  updatedAt: string;
}

export function useSaveClassesMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveClassesPayload) =>
      api.post<SaveClassesResponse>(`/api/websites/${websiteId}/classes/bulk`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all(websiteId!) });
    },
  });
}
