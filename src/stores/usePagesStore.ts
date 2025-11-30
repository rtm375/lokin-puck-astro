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
  fetchPages: (websiteId: string, force?: boolean) => Promise<void>;
  setPages: (pages: Page[]) => void;
  addPage: (page: Page) => void;
  updatePage: (page: Page) => void;
  deletePage: (pageId: string) => void;
}

export const usePagesStore = create<PagesState>()(
  persist(
    (set, get) => ({
      pages: [],
      isLoading: false,
      fetchingWebsiteId: null,
      currentWebsiteId: null,
      setPages: (pages) => set({ pages }),
      fetchPages: async (websiteId: string, force: boolean = false) => {
        const { fetchingWebsiteId, currentWebsiteId, pages } = get();

        // Smart caching: skip if already have data for this website
        const hasDataForWebsite =
          currentWebsiteId === websiteId && pages.length > 0;
        if (
          !shouldFetch(fetchingWebsiteId, websiteId, hasDataForWebsite, force)
        ) {
          return;
        }

        set({ isLoading: true, fetchingWebsiteId: websiteId });
        await fetchData<Page[]>(
          `/api/websites/${websiteId}/pages`,
          (data) => set({ pages: data, currentWebsiteId: websiteId }),
          (err) => console.error("Failed to fetch pages", err),
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
    }),
    {
      name: "pages",
      storage: createJSONStorage(() => {
        return localStorage;
      }),
    },
  ),
);
