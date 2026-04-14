import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "@/lib/client/api";
import { type Class } from "@/types";
import { generateCSSClassName } from "@/components/client/website/pages/editor/core/css-engine";

interface ClassesState {
  classes: Class[];
  activeClassId: string | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;

  // Actions
  setActiveClassId: (id: string | null) => void;
  fetchClassesData: (websiteId: string) => Promise<void>;
  saveChanges: (websiteId: string) => Promise<void>;

  // Classes
  addClass: (websiteId: string, data: Partial<Class>) => string;
  updateClass: (websiteId: string, id: string, data: Partial<Class>) => void;
  deleteClass: (websiteId: string, id: string) => void;
  reorderClasses: (websiteId: string, newOrder: Class[]) => void;
}

export const useClassesStore = create<ClassesState>()(
  persist(
    (set, get) => ({
      classes: [],
      activeClassId: null,
      isLoading: false,
      error: null,
      hasUnsavedChanges: false,
      isSaving: false,

      setActiveClassId: (id) => set({ activeClassId: id }),

      fetchClassesData: async (websiteId: string) => {
        if (get().hasUnsavedChanges) return;

        set({ isLoading: true, error: null });
        try {
          const classes = await api.get<Class[]>(`/api/websites/${websiteId}/classes`);
          // Ensure all classes have CSS class names
          let needsUpdate = false;
          const classesWithNames = classes.map(cls => {
            if (!cls.css_class_name) {
              needsUpdate = true;
              return {
                ...cls,
                css_class_name: generateCSSClassName()
              };
            }
            return cls;
          });
          
          set({
            classes: classesWithNames.sort((a, b) => a.sort_order - b.sort_order),
            isLoading: false,
            hasUnsavedChanges: needsUpdate // Mark as changed if we generated names
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      saveChanges: async (websiteId: string) => {
        const { classes } = get();
        set({ isSaving: true, error: null });
        try {
          await api.post(`/api/websites/${websiteId}/classes/bulk`, {
            classes
          });
          set({ isSaving: false, hasUnsavedChanges: false });
        } catch (error: any) {
          set({ error: error.message, isSaving: false });
          throw error;
        }
      },

      addClass: (websiteId, data) => {
        const tempId = crypto.randomUUID();
        const newClass: Class = {
          id: tempId,
          website_id: websiteId,
          name: data.name || "New Class",
          css_class_name: data.css_class_name || generateCSSClassName(),
          parent_id: data.parent_id || null,
          styles: data.styles || {},
          sort_order: data.sort_order || get().classes.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          classes: [...state.classes, newClass],
          activeClassId: newClass.id,
          hasUnsavedChanges: true
        }));
        return tempId;
      },

      updateClass: (_websiteId, id, data) => {
        set((state) => ({
          classes: state.classes.map(c => c.id === id ? { ...c, ...data } : c),
          hasUnsavedChanges: true
        }));
      },

      deleteClass: (_websiteId, id) => {
        set((state) => ({
          classes: state.classes.filter(c => c.id !== id && c.parent_id !== id),
          activeClassId: state.activeClassId === id ? null : state.activeClassId,
          hasUnsavedChanges: true
        }));
      },

      reorderClasses: (_websiteId, updatedClasses) => {
        set((state) => {
          const newClasses = state.classes.map(c => {
            const updated = updatedClasses.find(uc => uc.id === c.id);
            return updated ? { ...c, ...updated } : c;
          });
          return { classes: newClasses.sort((a,b) => a.sort_order - b.sort_order), hasUnsavedChanges: true };
        });
      }
    }),
    {
      name: "classes-data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
