import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Class } from "@/types";
import { generateCSSClassName } from "@/components/client/website/pages/editor/core/css-engine";

interface ClassesState {
  // UI state
  activeClassId: string | null;

  // Draft state — local edits before save
  draftClasses: Class[] | null; // null = no draft, use server data
  hasUnsavedChanges: boolean;
  _savedAt: string | null; // timestamp from last successful save/fetch

  // Actions
  setActiveClassId: (id: string | null) => void;
  initDraft: (serverClasses: Class[], savedAt?: string) => void;

  // Draft CRUD
  addClass: (websiteId: string, data: Partial<Class>) => string;
  updateClass: (id: string, data: Partial<Class>) => void;
  deleteClass: (id: string) => void;
  reorderClasses: (updatedClasses: Class[]) => void;

  // Save lifecycle
  markSaved: (updatedAt: string) => void;
  discardDraft: () => void;
  reset: () => void;
}

export const useClassesStore = create<ClassesState>()(
  persist(
    (set, get) => ({
      activeClassId: null,
      draftClasses: null,
      hasUnsavedChanges: false,
      _savedAt: null,

      setActiveClassId: (id) => set({ activeClassId: id }),

      initDraft: (serverClasses, savedAt) => {
        // Only initialize if no unsaved draft exists
        if (get().hasUnsavedChanges && get().draftClasses) return;
        // Skip if already initialized with same data to prevent render loops
        if (get()._savedAt === savedAt && get().draftClasses) return;

        set({
          draftClasses: serverClasses,
          _savedAt: savedAt || new Date().toISOString(),
          hasUnsavedChanges: false,
        });
      },

      addClass: (websiteId, data) => {
        const tempId = crypto.randomUUID();
        const classes = get().draftClasses || [];
        const newClass: Class = {
          id: tempId,
          website_id: websiteId,
          name: data.name || "New Class",
          css_class_name: data.css_class_name || generateCSSClassName(),
          parent_id: data.parent_id || null,
          custom_states: data.custom_states || [],
          styles: data.styles || {},
          sort_order: data.sort_order || classes.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({
          draftClasses: [...classes, newClass],
          activeClassId: newClass.id,
          hasUnsavedChanges: true,
        });
        return tempId;
      },

      updateClass: (id, data) => {
        set((state) => ({
          draftClasses: (state.draftClasses || []).map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
          hasUnsavedChanges: true,
        }));
      },

      deleteClass: (id) => {
        set((state) => ({
          draftClasses: (state.draftClasses || []).filter(
            (c) => c.id !== id && c.parent_id !== id
          ),
          activeClassId: state.activeClassId === id ? null : state.activeClassId,
          hasUnsavedChanges: true,
        }));
      },

      reorderClasses: (updatedClasses) => {
        set((state) => {
          const newClasses = (state.draftClasses || []).map((c) => {
            const updated = updatedClasses.find((uc) => uc.id === c.id);
            return updated ? { ...c, ...updated } : c;
          });
          return {
            draftClasses: newClasses.sort((a, b) => a.sort_order - b.sort_order),
            hasUnsavedChanges: true,
          };
        });
      },

      markSaved: (updatedAt) => {
        set({ hasUnsavedChanges: false, _savedAt: updatedAt });
      },

      discardDraft: () => {
        set({ draftClasses: null, hasUnsavedChanges: false });
      },

      reset: () => {
        set({
          activeClassId: null,
          draftClasses: null,
          hasUnsavedChanges: false,
          _savedAt: null,
        });
      },
    }),
    {
      name: "classes-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeClassId: state.activeClassId,
        draftClasses: state.draftClasses,
        hasUnsavedChanges: state.hasUnsavedChanges,
        _savedAt: state._savedAt,
      }),
    }
  )
);
