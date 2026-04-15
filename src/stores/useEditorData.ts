import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Data } from "@puckeditor/core";
import type {
  Props,
  RootProps,
} from "@/components/client/website/pages/editor/puck/blocks/types";

/**
 * Editor data store — handles local draft state for the page being edited.
 * Server fetching is handled by useEditorDataQuery.
 * This store only holds the live draft (pending changes before save).
 */
interface EditorState {
  // Current draft being edited (one page at a time)
  draftKey: string | null; // "websiteId-pageId"
  draftData: Data<Props, RootProps> | null;
  hasUnsavedChanges: boolean;
  _savedAt: string | null;

  // Actions
  setDraft: (key: string, data: Data<Props, RootProps>, savedAt?: string) => void;
  updateDraft: (data: Data<Props, RootProps>) => void;
  markSaved: (updatedAt: string) => void;
  discardDraft: () => void;
  reset: () => void;
}

export const useEditorData = create<EditorState>()(
  persist(
    (set, get) => ({
      draftKey: null,
      draftData: null,
      hasUnsavedChanges: false,
      _savedAt: null,

      setDraft: (key, data, savedAt) => {
        set({
          draftKey: key,
          draftData: data,
          _savedAt: savedAt || new Date().toISOString(),
          hasUnsavedChanges: false,
        });
      },

      updateDraft: (data) => {
        // Enforce front page uniqueness
        if (data.root?.props?.isFrontPage) {
          // This is now only relevant for the current draft
        }
        set({ draftData: data, hasUnsavedChanges: true });
      },

      markSaved: (updatedAt) => {
        set({ hasUnsavedChanges: false, _savedAt: updatedAt });
      },

      discardDraft: () => {
        set({
          draftKey: null,
          draftData: null,
          hasUnsavedChanges: false,
          _savedAt: null,
        });
      },

      reset: () => {
        set({
          draftKey: null,
          draftData: null,
          hasUnsavedChanges: false,
          _savedAt: null,
        });
      },
    }),
    {
      name: "editor-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draftKey: state.draftKey,
        draftData: state.draftData,
        hasUnsavedChanges: state.hasUnsavedChanges,
        _savedAt: state._savedAt,
      }),
    }
  )
);
