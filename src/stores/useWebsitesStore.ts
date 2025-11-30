import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shouldFetch, fetchData } from "./utils/fetchHelpers";

export enum Status {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  MAINTENANCE = "MAINTENANCE",
}

export interface Website {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  status: Status;
  created_at: string;
}

interface WebsitesState {
  websites: Website[];
  isLoading: boolean;
  fetchingWebsites: boolean; // Track if fetch is in progress
  fetchWebsites: (force?: boolean) => Promise<void>;
  setWebsites: (websites: Website[]) => void;
}

export const useWebsitesStore = create<WebsitesState>()(
  persist(
    (set, get) => ({
      websites: [],
      isLoading: false,
      fetchingWebsites: false,
      setWebsites: (websites) => set({ websites }),
      fetchWebsites: async (force: boolean = false) => {
        const { fetchingWebsites, websites } = get();

        // Smart caching: skip if already have data
        const hasData = websites.length > 0;
        if (
          !shouldFetch(
            fetchingWebsites ? "fetching" : null,
            "fetching",
            hasData,
            force,
          )
        ) {
          return;
        }

        set({ isLoading: true, fetchingWebsites: true });
        await fetchData<Website[]>(
          "/api/websites",
          (data) => set({ websites: data }),
          (err) => console.error("Failed to load websites", err),
        );
        set({ isLoading: false, fetchingWebsites: false });
      },
    }),
    {
      name: "websites",
      storage: createJSONStorage(() => {
        return localStorage;
      }),
    },
  ),
);
