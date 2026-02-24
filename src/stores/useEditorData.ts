import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Data } from "@measured/puck";
import type {
  Props,
  RootProps,
} from "@components/client/website/pages/blocks/types";
import { shouldFetch, fetchData } from "@/utils/fetchHelpers";

interface EditorState {
  pages: Record<string, Data<Props, RootProps>>;
  isLoading: boolean;
  fetchingPageKey: string | null; // Track which page is being fetched
  error: string | null;
  fetchEditorData: (
    websiteId: string,
    pagePath: string,
    force?: boolean,
  ) => Promise<Data<Props, RootProps> | null>;
  setPageData: (key: string, data: Data<Props, RootProps>) => void;
  getPageData: (key: string) => Data<Props, RootProps> | null;
  clearPageData: (key: string) => void;
  reset: () => void;
}

export const useEditorData = create<EditorState>()(
  persist(
    (set, get) => ({
      pages: {},
      isLoading: false,
      fetchingPageKey: null,
      error: null,

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

        let result: Data<Props, RootProps> | null = null;
        await fetchData<any>(
          `/api/websites/${websiteId}/pages/${pageId}/editor-data`,
          (dbPage) => {
            const dbData = dbPage.data || {
              root: {
                props: {
                  title: dbPage.title || "New Page",
                },
              },
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
        set((state) => {
          const newPages = { ...state.pages, [key]: data };

          // Enforce uniqueness: If this page is set as Front Page, unset others
          if (data.root?.props?.isFrontPage) {
            Object.keys(newPages).forEach((k) => {
              if (k !== key && newPages[k]?.root?.props?.isFrontPage) {
                newPages[k] = {
                  ...newPages[k],
                  root: {
                    ...newPages[k].root!,
                    props: {
                      ...newPages[k].root!.props!,
                      isFrontPage: false,
                    },
                  },
                };
              }
            });
          }

          return { pages: newPages };
        }),

      getPageData: (key) => {
        return get().pages[key] || null;
      },

      clearPageData: (key) =>
        set((state) => {
          const newPages = { ...state.pages };
          delete newPages[key];
          return { pages: newPages };
        }),
      reset: () => {
        set({
          pages: {},
          isLoading: false,
          fetchingPageKey: null,
          error: null,
        });
      },
    }),
    {
      name: "editor-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
