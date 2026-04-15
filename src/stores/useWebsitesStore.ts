/**
 * @deprecated Use useWebsitesQuery() from @/hooks/queries/useWebsitesQuery instead.
 * This store is kept as a minimal backward-compat layer.
 */
import { create } from "zustand";
import type { Website } from "@/types";

export type { Website } from "@/types";

interface WebsitesState {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  reset: () => void;
}

export const useWebsitesStore = create<WebsitesState>()((set) => ({
  websites: [],
  setWebsites: (websites) => set({ websites }),
  reset: () => set({ websites: [] }),
}));
