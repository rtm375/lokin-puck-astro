import { create } from "zustand";
import { api } from "@/lib/client/api";
import type { VariableCollection, Variable } from "@/types";

interface VariablesState {
  collections: VariableCollection[];
  variables: Variable[];
  activeCollection: string | null;
  activeMode: string;
  activeSkin: string;
  isLoading: boolean;
  error: string | null;

  // Syncing queue
  isSyncing: boolean;

  // Actions
  setActiveCollection: (id: string | null) => void;
  setActiveMode: (mode: string) => void;
  setActiveSkin: (skin: string) => void;
  fetchVariablesData: (websiteId: string) => Promise<void>;

  // Collections
  addCollection: (websiteId: string, name: string) => Promise<void>;
  updateCollection: (websiteId: string, id: string, data: Partial<VariableCollection>) => Promise<void>;
  deleteCollection: (websiteId: string, id: string) => Promise<void>;

  // Variables
  addVariable: (websiteId: string, data: Partial<Variable>) => Promise<void>;
  updateVariable: (websiteId: string, id: string, data: Partial<Variable>) => Promise<void>;
  deleteVariable: (websiteId: string, id: string) => Promise<void>;
  reorderVariables: (websiteId: string, newOrder: Variable[]) => Promise<void>;
}

export const useVariablesStore = create<VariablesState>()((set, get) => ({
  collections: [],
  variables: [],
  activeCollection: null,
  activeMode: "Light",
  activeSkin: "Default",
  isLoading: false,
  error: null,
  isSyncing: false,

  setActiveCollection: (id) => {
    const col = get().collections.find(c => c.id === id);
    set({
      activeCollection: id,
      activeMode: col?.modes[0] || "Light",
      activeSkin: col?.skins[0] || "Default"
    });
  },
  setActiveMode: (mode) => set({ activeMode: mode }),
  setActiveSkin: (skin) => set({ activeSkin: skin }),

  fetchVariablesData: async (websiteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [collections, variables] = await Promise.all([
        api.get<VariableCollection[]>(`/api/websites/${websiteId}/variables-collections`),
        api.get<Variable[]>(`/api/websites/${websiteId}/variables`)
      ]);
      set({
        collections,
        variables: variables.sort((a, b) => {
          if (a.is_group !== b.is_group) return a.is_group ? 1 : -1;
          return a.sort_order - b.sort_order;
        }),
        isLoading: false
      });
      if (collections.length > 0 && !get().activeCollection) {
        set({ activeCollection: collections[0].id });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addCollection: async (websiteId, name) => {
    try {
      const newCol = await api.post<VariableCollection>(`/api/websites/${websiteId}/variables-collections`, { name });
      set((state) => ({
        collections: [...state.collections, newCol],
        activeCollection: newCol.id
      }));
    } catch (error: any) {
      console.error(error);
    }
  },

  updateCollection: async (websiteId, id, data) => {
    // Optimistic update
    set((state) => ({
      collections: state.collections.map(c => c.id === id ? { ...c, ...data } : c)
    }));
    try {
      await api.patch(`/api/websites/${websiteId}/variables-collections/${id}`, data);
    } catch (error: any) {
      console.error(error);
      // Revert logic should go here on fail
    }
  },

  deleteCollection: async (websiteId, id) => {
    const prevCollections = get().collections;
    const prevVars = get().variables;

    set((state) => ({
      collections: state.collections.filter(c => c.id !== id),
      variables: state.variables.filter(v => v.variables_collection_id !== id),
      activeCollection: state.activeCollection === id ? (state.collections[0]?.id || null) : state.activeCollection
    }));

    try {
      await api.delete(`/api/websites/${websiteId}/variables-collections/${id}`);
    } catch (error: any) {
      console.error(error);
      set({ collections: prevCollections, variables: prevVars }); // revert
    }
  },

  addVariable: async (websiteId, data) => {
    // Optimistic assignment with temporary id
    const tempId = crypto.randomUUID();
    const newVar = {
      ...data,
      id: tempId,
      website_id: websiteId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mode: data.mode || get().activeMode,
      skin: data.skin || get().activeSkin,
      variables_collection_id: data.variables_collection_id || get().activeCollection,
      is_group: data.is_group || false,
      group_id: data.group_id || null,
      sort_order: data.sort_order || get().variables.length,
    } as Variable;

    set((state) => ({
      variables: [...state.variables, newVar]
    }));

    try {
      // Send completed data to API
      const { id: _, created_at: __, updated_at: ___, ...payload } = newVar;
      const savedVar = await api.post<Variable>(`/api/websites/${websiteId}/variables`, payload);
      set((state) => ({
        variables: state.variables.map(v => v.id === tempId ? savedVar : v)
      }));
    } catch (error) {
      set((state) => ({
        variables: state.variables.filter(v => v.id !== tempId)
      }));
    }
  },

  updateVariable: async (websiteId, id, data) => {
    const prevVars = get().variables;
    set((state) => ({
      variables: state.variables.map(v => v.id === id ? { ...v, ...data } : v)
    }));
    try {
      await api.patch(`/api/websites/${websiteId}/variables/${id}`, data);
    } catch (error) {
      set({ variables: prevVars });
    }
  },

  deleteVariable: async (websiteId, id) => {
    const prevVars = get().variables;
    // Also delete children if this is a group
    set((state) => ({
      variables: state.variables.filter(v => v.id !== id && v.group_id !== id)
    }));
    try {
      await api.delete(`/api/websites/${websiteId}/variables/${id}`);
    } catch (error) {
      set({ variables: prevVars });
    }
  },

  reorderVariables: async (websiteId, newOrder) => {
    const enforcedOrder = [...newOrder].sort((a, b) => {
      if (a.is_group !== b.is_group) return a.is_group ? 1 : -1;
      return 0;
    });

    set({ variables: enforcedOrder });

    try {
      const payload = enforcedOrder.map((v, i) => ({
        id: v.id,
        sort_order: i,
        group_id: v.group_id
      }));

      await api.post(`/api/websites/${websiteId}/variables/reorder`, { variables: payload });
    } catch (error) {
      set({ variables: get().variables });
    }
  }

}));
