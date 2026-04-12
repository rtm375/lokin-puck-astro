import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "@/lib/client/api";
import { type VariableCollection, type Variable, VariableMode } from "@/types";

interface VariablesState {
  collections: VariableCollection[];
  variables: Variable[];
  activeCollection: string | null;
  activeMode: VariableMode;
  activeSkin: string;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;

  // Syncing queue
  isSyncing: boolean;

  // Actions
  setActiveCollection: (id: string | null) => void;
  setActiveMode: (mode: VariableMode) => void;
  setActiveSkin: (skin: string) => void;
  fetchVariablesData: (websiteId: string) => Promise<void>;
  saveChanges: (websiteId: string) => Promise<void>;

  // Collections
  addCollection: (websiteId: string, name: string) => void;
  updateCollection: (websiteId: string, id: string, data: Partial<VariableCollection>) => void;
  deleteCollection: (websiteId: string, id: string) => void;

  // Variables
  addVariable: (websiteId: string, data: Partial<Variable>) => void;
  updateVariable: (websiteId: string, id: string, data: Partial<Variable>) => void;
  deleteVariable: (websiteId: string, id: string) => void;
  reorderVariables: (websiteId: string, newOrder: Variable[]) => void;
}

export const useVariablesStore = create<VariablesState>()(
  persist(
    (set, get) => ({
      collections: [],
      variables: [],
      activeCollection: null,
      activeMode: VariableMode.LIGHT,
      activeSkin: "Default",
      isLoading: false,
      error: null,
      isSyncing: false,
      hasUnsavedChanges: false,
      isSaving: false,

      setActiveCollection: (id) => {
        const col = get().collections.find(c => c.id === id);
        set({
          activeCollection: id,
          activeMode: col?.modes[0] || VariableMode.LIGHT,
          activeSkin: col?.skins[0] || "Default"
        });
      },
      setActiveMode: (mode) => set({ activeMode: mode }),
      setActiveSkin: (skin) => set({ activeSkin: skin }),

      fetchVariablesData: async (websiteId: string) => {
        if (get().hasUnsavedChanges) return; // Prevent overwriting local changes

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
            isLoading: false,
            hasUnsavedChanges: false
          });
          if (collections.length > 0 && !get().activeCollection) {
            set({ activeCollection: collections[0].id });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      saveChanges: async (websiteId: string) => {
        const { collections, variables } = get();
        set({ isSaving: true, error: null });
        try {
          await api.post(`/api/websites/${websiteId}/variables/bulk`, {
            collections,
            variables
          });
          set({ isSaving: false, hasUnsavedChanges: false });
        } catch (error: any) {
          set({ error: error.message, isSaving: false });
          throw error;
        }
      },

      addCollection: (websiteId, name) => {
        const tempId = crypto.randomUUID();
        const newCol: VariableCollection = {
          id: tempId,
          website_id: websiteId,
          name,
          is_system: false,
          modes: [VariableMode.LIGHT, VariableMode.DARK],
          skins: ["Default", "Modern"],
          variable_types: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          collections: [...state.collections, newCol],
          activeCollection: newCol.id,
          hasUnsavedChanges: true
        }));
      },

      updateCollection: (_websiteId, id, data) => {
        set((state) => ({
          collections: state.collections.map(c => c.id === id ? { ...c, ...data } : c),
          hasUnsavedChanges: true
        }));
      },

      deleteCollection: (_websiteId, id) => {
        set((state) => ({
          collections: state.collections.filter(c => c.id !== id),
          variables: state.variables.filter(v => v.variables_collection_id !== id),
          activeCollection: state.activeCollection === id ? (state.collections[0]?.id || null) : state.activeCollection,
          hasUnsavedChanges: true
        }));
      },

      addVariable: (websiteId, data) => {
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
          variables: [...state.variables, newVar],
          hasUnsavedChanges: true
        }));
      },

      updateVariable: (_websiteId, id, data) => {
        set((state) => ({
          variables: state.variables.map(v => v.id === id ? { ...v, ...data } : v),
          hasUnsavedChanges: true
        }));
      },

      deleteVariable: (_websiteId, id) => {
        set((state) => ({
          variables: state.variables.filter(v => v.id !== id && v.group_id !== id),
          hasUnsavedChanges: true
        }));
      },

      reorderVariables: (_websiteId, updatedVariables) => {
        set((state) => {
          const newVars = state.variables.map(v => {
            const updated = updatedVariables.find(uv => uv.id === v.id);
            return updated ? { ...v, ...updated } : v;
          });
          return { variables: newVars, hasUnsavedChanges: true };
        });
      }
    }),
    {
      name: "variables-data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
