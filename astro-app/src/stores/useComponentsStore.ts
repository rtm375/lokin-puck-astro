import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shouldFetch, fetchData } from "./utils/fetchHelpers";
import type { Data } from "@measured/puck";

export interface Component {
  id: string;
  website_id: string;
  name: string;
  data: Data;
  created_at: string;
  updated_at: string;
}

interface ComponentsState {
  components: Component[];
  isLoading: boolean;
  fetchingWebsiteId: string | null;
  currentWebsiteId: string | null;
  fetchComponents: (websiteId: string, force?: boolean) => Promise<void>;
  setComponents: (components: Component[]) => void;
  addComponent: (component: Component) => void;
  updateComponent: (component: Component) => void;
  deleteComponent: (componentId: string) => void;
}

export const useComponentsStore = create<ComponentsState>()(
  persist(
    (set, get) => ({
      components: [],
      isLoading: false,
      fetchingWebsiteId: null,
      currentWebsiteId: null,
      setComponents: (components) => set({ components }),
      fetchComponents: async (websiteId: string, force: boolean = false) => {
        const { fetchingWebsiteId, currentWebsiteId, components } = get();

        const hasDataForWebsite =
          currentWebsiteId === websiteId && components.length > 0;
        if (
          !shouldFetch(fetchingWebsiteId, websiteId, hasDataForWebsite, force)
        ) {
          return;
        }

        set({ isLoading: true, fetchingWebsiteId: websiteId });
        await fetchData<Component[]>(
          `/api/websites/${websiteId}/components`,
          (data) => set({ components: data, currentWebsiteId: websiteId }),
          (err) => console.error("Failed to fetch components", err),
        );
        set({ isLoading: false, fetchingWebsiteId: null });
      },
      addComponent: (component) =>
        set((state) => ({ components: [component, ...state.components] })),
      updateComponent: (component) =>
        set((state) => ({
          components: state.components.map((c) =>
            c.id === component.id ? component : c,
          ),
        })),
      deleteComponent: (componentId) =>
        set((state) => ({
          components: state.components.filter((c) => c.id !== componentId),
        })),
    }),
    {
      name: "components",
      storage: createJSONStorage(() => {
        return localStorage;
      }),
    },
  ),
);
