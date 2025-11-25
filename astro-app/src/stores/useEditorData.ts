import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Data } from "@measured/puck";
import { shouldFetch, fetchData } from "./utils/fetchHelpers";

interface EditorState {
  pages: Record<string, Data>;
  isLoading: boolean;
  fetchingPageKey: string | null; // Track which page is being fetched
  fetchEditorData: (
    websiteId: string,
    pagePath: string,
    force?: boolean,
  ) => Promise<Data | null>;
  setPageData: (key: string, data: Data) => void;
  getPageData: (key: string) => Data | null;
  clearPageData: (key: string) => void;
}

export const useEditorData = create<EditorState>()(
  persist(
    (set, get) => ({
      pages: {},
      isLoading: false,
      fetchingPageKey: null,

      fetchEditorData: async (
        websiteId: string,
        pageId: string,
        force: boolean = false,
      ) => {
        const pageKey = `${websiteId}-${pageId}`;
        const { fetchingPageKey, pages } = get();

        // Smart caching: skip if already have data for this page
        const hasDataForPage = !!pages[pageKey];
        if (!shouldFetch(fetchingPageKey, pageKey, hasDataForPage, force)) {
          return pages[pageKey] || null;
        }

        set({ isLoading: true, fetchingPageKey: pageKey });

        let result: Data | null = null;
        await fetchData<any>(
          `/api/websites/${websiteId}/pages/${pageId}/editor-data`,
          (dbPage) => {
            const dbData = dbPage.data || {
              root: { props: { title: dbPage.title || "New Page" } },
              content: [],
              zones: {},
            };
            // Store in cache
            set((state) => ({
              pages: { ...state.pages, [pageKey]: dbData },
            }));
            result = dbData;
          },
          (err) => console.error("Failed to fetch editor data", err),
        );

        set({ isLoading: false, fetchingPageKey: null });
        return result;
      },

      setPageData: (key, data) =>
        set((state) => ({
          pages: { ...state.pages, [key]: data },
        })),

      getPageData: (key) => {
        return get().pages[key] || null;
      },

      clearPageData: (key) =>
        set((state) => {
          const newPages = { ...state.pages };
          delete newPages[key];
          return { pages: newPages };
        }),
    }),
    {
      name: "editor-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
