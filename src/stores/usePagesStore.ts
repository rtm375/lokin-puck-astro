/**
 * @deprecated Use usePagesQuery() from @/hooks/queries/usePagesQuery instead.
 * This store is kept as a minimal backward-compat layer.
 */
import { create } from "zustand";
import type { Page } from "@/types";

export type { Page } from "@/types";

interface PagesState {
  pages: Page[];
  currentPage: number;
  totalPages: number;
  total: number;
  setPages: (pages: Page[]) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

export const usePagesStore = create<PagesState>()((set) => ({
  pages: [],
  currentPage: 1,
  totalPages: 1,
  total: 0,
  setPages: (pages) => set({ pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  reset: () =>
    set({
      pages: [],
      currentPage: 1,
      totalPages: 1,
      total: 0,
    }),
}));
