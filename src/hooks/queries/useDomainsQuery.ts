import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Domain } from "@/types";

export const domainKeys = {
  all: (websiteId: string) => ["domains", websiteId] as const,
};

export function useDomainsQuery(websiteId: string | undefined) {
  return useQuery({
    queryKey: domainKeys.all(websiteId!),
    queryFn: () => api.get<Domain[]>(`/api/websites/${websiteId}/domains`),
    enabled: !!websiteId,
  });
}

export function useAddDomainMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      api.post<Domain>(`/api/websites/${websiteId}/domains`, { domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all(websiteId!) });
    },
  });
}

export function useVerifyDomainMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      api.post<{ verified: boolean }>(`/api/websites/${websiteId}/domains/verify`, { domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all(websiteId!) });
    },
  });
}

export function useDeleteDomainMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      api.delete(`/api/websites/${websiteId}/domains/${domain}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all(websiteId!) });
    },
  });
}
