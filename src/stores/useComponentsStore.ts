/**
 * @deprecated Use useComponentsQuery() from @/hooks/queries/useComponentsQuery instead.
 * This store is kept as a minimal backward-compat layer.
 */
import { create } from "zustand";
import type { Component } from "@/types";

export type { Component } from "@/types";

interface ComponentsState {
  components: Component[];
  setComponents: (components: Component[]) => void;
  reset: () => void;
}

export const useComponentsStore = create<ComponentsState>()((set) => ({
  components: [],
  setComponents: (components) => set({ components }),
  reset: () => set({ components: [] }),
}));
