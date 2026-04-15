import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Website } from "@/types";

export const websiteKeys = {
  all: ["websites"] as const,
};

export function useWebsitesQuery() {
  return useQuery({
    queryKey: websiteKeys.all,
    queryFn: () => api.get<Website[]>("/api/websites"),
  });
}

export function useCreateWebsiteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; subdomain: string; description: string }) =>
      api.post<Website>("/api/websites", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
    },
  });
}
