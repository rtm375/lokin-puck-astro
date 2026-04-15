/**
 * @deprecated Use useDomainsQuery() from @/hooks/queries/useDomainsQuery instead.
 * This store is kept as a minimal backward-compat layer.
 */
import { create } from "zustand";
import type { Domain } from "@/types";

export type { Domain } from "@/types";

interface DomainsState {
  domains: Domain[];
  setDomains: (domains: Domain[]) => void;
  reset: () => void;
}

export const useDomainsStore = create<DomainsState>()((set) => ({
  domains: [],
  setDomains: (domains) => set({ domains }),
  reset: () => set({ domains: [] }),
}));
