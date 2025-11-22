import { create } from "zustand";

export enum Status {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  MAINTENANCE = "MAINTENANCE",
}

export interface Website {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: Status;
  created_at: string;
}

interface WebsitesState {
  websites: Website[];
  fetchWebsites: () => Promise<void>;
  setWebsites: (websites: Website[]) => void;
}

export const useWebsitesStore = create<WebsitesState>()((set, get) => ({
  websites: [],
  setWebsites: (websites) => set({ websites }),
  fetchWebsites: async () => {
    try {
      const response = await fetch("/api/websites");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          set({ websites: data });
        }
      }
    } catch (err) {
      console.error("Failed to load websites", err);
    }
  },
}));
