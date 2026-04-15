import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Component } from "@/types";

export const componentKeys = {
  all: (websiteId: string) => ["components", websiteId] as const,
};

export function useComponentsQuery(websiteId: string | undefined) {
  return useQuery({
    queryKey: componentKeys.all(websiteId!),
    queryFn: () => api.get<Component[]>(`/api/websites/${websiteId}/components`),
    enabled: !!websiteId,
  });
}
