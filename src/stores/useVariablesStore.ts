import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type VariableCollection, type Variable, VariableMode } from "@/types";

interface VariablesState {
  // UI state
  activeCollection: string | null;
  activeMode: VariableMode;
  activeSkin: string;

  // Draft state — local edits before save
  draftCollections: VariableCollection[] | null; // null = no draft, use server data
  draftVariables: Variable[] | null;
  hasUnsavedChanges: boolean;
  _savedAt: string | null;

  // Actions
  setActiveCollection: (id: string | null) => void;
  setActiveMode: (mode: VariableMode) => void;
  setActiveSkin: (skin: string) => void;
  initDraft: (
    collections: VariableCollection[],
    variables: Variable[],
    savedAt?: string
  ) => void;

  // Collections CRUD
  addCollection: (websiteId: string, name: string) => void;
  updateCollection: (id: string, data: Partial<VariableCollection>) => void;
  deleteCollection: (id: string) => void;

  // Variables CRUD
  addVariable: (websiteId: string, data: Partial<Variable>) => void;
  updateVariable: (id: string, data: Partial<Variable>) => void;
  deleteVariable: (id: string) => void;
  reorderVariables: (updatedVariables: Variable[]) => void;

  // Save lifecycle
  markSaved: (updatedAt: string) => void;
  discardDraft: () => void;
  reset: () => void;
}

export const useVariablesStore = create<VariablesState>()(
  persist(
    (set, get) => ({
      activeCollection: null,
      activeMode: VariableMode.LIGHT,
      activeSkin: "Default",
      draftCollections: null,
      draftVariables: null,
      hasUnsavedChanges: false,
      _savedAt: null,

      setActiveCollection: (id) => {
        const collections = get().draftCollections || [];
        const col = collections.find((c) => c.id === id);
        set({
          activeCollection: id,
          activeMode: col?.modes[0] || VariableMode.LIGHT,
          activeSkin: col?.skins[0] || "Default",
        });
      },
      setActiveMode: (mode) => set({ activeMode: mode }),
      setActiveSkin: (skin) => set({ activeSkin: skin }),

      initDraft: (collections, variables, savedAt) => {
        if (get().hasUnsavedChanges && get().draftCollections) return;
        // Skip if already initialized with same data to prevent render loops
        if (get()._savedAt === savedAt && get().draftCollections) return;

        set({
          draftCollections: collections,
          draftVariables: variables,
          _savedAt: savedAt || new Date().toISOString(),
          hasUnsavedChanges: false,
        });
        if (collections.length > 0 && !get().activeCollection) {
          set({ activeCollection: collections[0].id });
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
          updated_at: new Date().toISOString(),
        };
        set((state) => ({
          draftCollections: [...(state.draftCollections || []), newCol],
          activeCollection: newCol.id,
          hasUnsavedChanges: true,
        }));
      },

      updateCollection: (id, data) => {
        set((state) => ({
          draftCollections: (state.draftCollections || []).map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
          hasUnsavedChanges: true,
        }));
      },

      deleteCollection: (id) => {
        set((state) => ({
          draftCollections: (state.draftCollections || []).filter((c) => c.id !== id),
          draftVariables: (state.draftVariables || []).filter(
            (v) => v.variables_collection_id !== id
          ),
          activeCollection:
            state.activeCollection === id
              ? (state.draftCollections || [])[0]?.id || null
              : state.activeCollection,
          hasUnsavedChanges: true,
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
          variables_collection_id:
            data.variables_collection_id || get().activeCollection,
          is_group: data.is_group || false,
          group_id: data.group_id || null,
          sort_order: data.sort_order || (get().draftVariables || []).length,
        } as Variable;

        set((state) => ({
          draftVariables: [...(state.draftVariables || []), newVar],
          hasUnsavedChanges: true,
        }));
      },

      updateVariable: (id, data) => {
        set((state) => ({
          draftVariables: (state.draftVariables || []).map((v) =>
            v.id === id ? { ...v, ...data } : v
          ),
          hasUnsavedChanges: true,
        }));
      },

      deleteVariable: (id) => {
        set((state) => ({
          draftVariables: (state.draftVariables || []).filter(
            (v) => v.id !== id && v.group_id !== id
          ),
          hasUnsavedChanges: true,
        }));
      },

      reorderVariables: (updatedVariables) => {
        set((state) => {
          const newVars = (state.draftVariables || []).map((v) => {
            const updated = updatedVariables.find((uv) => uv.id === v.id);
            return updated ? { ...v, ...updated } : v;
          });
          return { draftVariables: newVars, hasUnsavedChanges: true };
        });
      },

      markSaved: (updatedAt) => {
        set({ hasUnsavedChanges: false, _savedAt: updatedAt });
      },

      discardDraft: () => {
        set({
          draftCollections: null,
          draftVariables: null,
          hasUnsavedChanges: false,
        });
      },

      reset: () => {
        set({
          activeCollection: null,
          activeMode: VariableMode.LIGHT,
          activeSkin: "Default",
          draftCollections: null,
          draftVariables: null,
          hasUnsavedChanges: false,
          _savedAt: null,
        });
      },
    }),
    {
      name: "variables-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeCollection: state.activeCollection,
        activeMode: state.activeMode,
        activeSkin: state.activeSkin,
        draftCollections: state.draftCollections,
        draftVariables: state.draftVariables,
        hasUnsavedChanges: state.hasUnsavedChanges,
        _savedAt: state._savedAt,
      }),
    }
  )
);
