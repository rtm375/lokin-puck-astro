import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { VariableCollection, Variable } from "@/types";

export const variableKeys = {
  all: (websiteId: string) => ["variables", websiteId] as const,
  collections: (websiteId: string) => ["variables", websiteId, "collections"] as const,
  list: (websiteId: string) => ["variables", websiteId, "list"] as const,
};

interface VariablesData {
  collections: VariableCollection[];
  variables: Variable[];
}

export function useVariablesQuery(websiteId: string | undefined) {
  return useQuery({
    queryKey: variableKeys.all(websiteId!),
    queryFn: async (): Promise<VariablesData> => {
      const [collections, variables] = await Promise.all([
        api.get<VariableCollection[]>(`/api/websites/${websiteId}/variables-collections`),
        api.get<Variable[]>(`/api/websites/${websiteId}/variables`),
      ]);
      return {
        collections,
        variables: variables.sort((a, b) => {
          if (a.is_group !== b.is_group) return a.is_group ? 1 : -1;
          return a.sort_order - b.sort_order;
        }),
      };
    },
    enabled: !!websiteId,
  });
}

interface SaveVariablesPayload {
  collections: VariableCollection[];
  variables: Variable[];
  _savedAt: string | null;
}

interface SaveVariablesResponse {
  success: boolean;
  updatedAt: string;
}

export function useSaveVariablesMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveVariablesPayload) =>
      api.post<SaveVariablesResponse>(`/api/websites/${websiteId}/variables/bulk`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variableKeys.all(websiteId!) });
    },
  });
}
