import { create } from "zustand";
import { shouldFetch, fetchData } from "./utils/fetchHelpers";

export interface Domain {
  domain: string;
  status: "pending" | "active" | "invalid";
  type: "subdomain" | "custom";
  is_primary: boolean;
}

interface DomainsState {
  domains: Domain[];
  isLoading: boolean;
  fetchingWebsiteId: string | null; // Track which website is currently being fetched
  currentWebsiteId: string | null; // Track which website the cache belongs to
  fetchDomains: (websiteId: string, force?: boolean) => Promise<void>;
  setDomains: (domains: Domain[]) => void;
  addDomain: (domain: Domain) => void;
  updateDomain: (domain: Domain) => void;
  deleteDomain: (domainName: string) => void;
  reset: () => void;
}

export const useDomainsStore = create<DomainsState>()((set, get) => ({
  domains: [],
  isLoading: false,
  fetchingWebsiteId: null,
  currentWebsiteId: null,
  setDomains: (domains) => set({ domains }),
  fetchDomains: async (websiteId: string, force: boolean = false) => {
    const { fetchingWebsiteId, currentWebsiteId, domains } = get();

    // Smart caching: skip if already have data for this website
    const hasDataForWebsite =
      currentWebsiteId === websiteId && domains.length > 0;
    if (!shouldFetch(fetchingWebsiteId, websiteId, hasDataForWebsite, force)) {
      return;
    }

    set({ isLoading: true, fetchingWebsiteId: websiteId });
    await fetchData<Domain[]>(
      `/api/websites/${websiteId}/domains`,
      (data) => set({ domains: data, currentWebsiteId: websiteId }),
      (err) => console.error("Failed to fetch domains", err),
    );
    set({ isLoading: false, fetchingWebsiteId: null });
  },
  addDomain: (domain) =>
    set((state) => ({ domains: [...state.domains, domain] })),
  updateDomain: (domain) =>
    set((state) => ({
      domains: state.domains.map((d) =>
        d.domain === domain.domain ? domain : d,
      ),
    })),
  deleteDomain: (domainName) =>
    set((state) => ({
      domains: state.domains.filter((d) => d.domain !== domainName),
    })),
  reset: () => {
    set({
      domains: [],
      isLoading: false,
      fetchingWebsiteId: null,
      currentWebsiteId: null,
    });
  },
}));
