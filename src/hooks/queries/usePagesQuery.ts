import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/client/api";
import type { Page } from "@/types";

export const pageKeys = {
  all: (websiteId: string) => ["pages", websiteId] as const,
  list: (websiteId: string, page: number) => ["pages", websiteId, page] as const,
  byPath: (subdomain: string, path: string) => ["pages", "byPath", subdomain, path] as const,
};

export function usePagesQuery(websiteId: string | undefined, page: number = 1) {
  return useQuery({
    queryKey: pageKeys.list(websiteId!, page),
    queryFn: () =>
      api.get<{ pages: Page[]; total: number; page: number; totalPages: number }>(
        `/api/websites/${websiteId}/pages?page=${page}&limit=20`
      ),
    enabled: !!websiteId,
  });
}

export function usePageByPathQuery(subdomain: string | undefined, pagePath: string | undefined) {
  return useQuery({
    queryKey: pageKeys.byPath(subdomain!, pagePath!),
    queryFn: async () => {
      const res = await fetch(
        `/api/websites/by-subdomain/${subdomain}/pages/by-path?path=${pagePath}`
      );
      if (!res.ok) return null;
      return (await res.json()) as Page;
    },
    enabled: !!subdomain && !!pagePath,
  });
}

export function useCreatePageMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Page> & { websiteId?: string }) =>
      api.post<Page>(`/api/websites/${websiteId}/pages`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all(websiteId!) });
    },
  });
}

export function useUpdatePageMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Page) =>
      api.patch<Page>(`/api/websites/${websiteId}/pages/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all(websiteId!) });
    },
  });
}

export function useDeletePageMutation(websiteId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) =>
      api.delete(`/api/websites/${websiteId}/pages/${pageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all(websiteId!) });
    },
  });
}
