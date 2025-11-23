import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Data } from "@measured/puck";

interface EditorState {
  pages: Record<string, Data>;
  setPageData: (key: string, data: Data) => void;
  getPageData: (key: string) => Data | null;
  clearPageData: (key: string) => void;
}

export const useEditorData = create<EditorState>()(
  persist(
    (set, get) => ({
      pages: {},

      setPageData: (key, data) =>
        set((state) => ({
          pages: { ...state.pages, [key]: data },
        })),

      getPageData: (key) => {
        return get().pages[key] || null;
      },

      clearPageData: (key) =>
        set((state) => {
          const newPages = { ...state.pages };
          delete newPages[key];
          return { pages: newPages };
        }),
    }),
    {
      name: "editor-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
