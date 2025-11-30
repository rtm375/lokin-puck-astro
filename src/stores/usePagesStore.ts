import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shouldFetch, fetchData } from "./utils/fetchHelpers";
import type { Website } from "./useWebsitesStore";

export interface Page {
  id: string;
  title: string;
  path: string;
  status: "draft" | "published";
  updated_at: string;
  image_url?: string;
  description?: string;
  head_code?: string;
  is_front_page?: boolean;
  website_id: string;
}

interface PagesState {
  pages: Page[];
  isLoading: boolean;
  fetchingWebsiteId: string | null; // Track which website is currently being fetched
  currentWebsiteId: string | null; // Track which website the cache belongs to
  currentPage: number;
  totalPages: number;
  total: number;
  fetchPages: (
    websiteId: string,
    page?: number,
    force?: boolean,
  ) => Promise<void>;
  setPages: (pages: Page[]) => void;
  addPage: (page: Page) => void;
  updatePage: (page: Page) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

export const usePagesStore = create<PagesState>()(
  persist(
    (set, get) => ({
      pages: [],
      isLoading: false,
      fetchingWebsiteId: null,
      currentWebsiteId: null,
      currentPage: 1,
      totalPages: 1,
      total: 0,
      setPages: (pages) => set({ pages }),
      setCurrentPage: (page) => set({ currentPage: page }),
      fetchPages: async (
        websiteId: string,
        page: number = 1,
        force: boolean = false,
      ) => {
        const { fetchingWebsiteId, currentWebsiteId, pages } = get();

        // Smart caching: skip if already have data for this website and page
        const hasDataForWebsite =
          currentWebsiteId === websiteId &&
          pages.length > 0 &&
          page === get().currentPage;
        if (
          !shouldFetch(fetchingWebsiteId, websiteId, hasDataForWebsite, force)
        ) {
          return;
        }

        set({ isLoading: true, fetchingWebsiteId: websiteId });
        await fetchData<{
          pages: Page[];
          total: number;
          page: number;
          totalPages: number;
        }>(
          `/api/websites/${websiteId}/pages?page=${page}&limit=20`,
          (data) =>
            set({
              pages: data.pages || [],
              currentWebsiteId: websiteId,
              currentPage: data.page || 1,
              totalPages: data.totalPages || 1,
              total: data.total || 0,
            }),
          (err) => {
            console.error("Failed to fetch pages", err);
            window.dispatchEvent(new CustomEvent("app:reset"));
          },
        );
        set({ isLoading: false, fetchingWebsiteId: null });
      },
      addPage: (page) => set((state) => ({ pages: [page, ...state.pages] })),
      updatePage: (page) =>
        set((state) => ({
          pages: state.pages.map((p) => (p.id === page.id ? page : p)),
        })),
      deletePage: (pageId) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== pageId),
        })),
      reset: () => {
        set({
          pages: [],
          isLoading: false,
          fetchingWebsiteId: null,
          currentWebsiteId: null,
          currentPage: 1,
          totalPages: 1,
          total: 0,
        });
      },
    }),
    {
      name: "pages",
      storage: createJSONStorage(() => {
        return localStorage;
      }),
    },
  ),
);
