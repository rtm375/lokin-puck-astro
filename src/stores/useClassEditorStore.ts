import { create } from "zustand";
import type { BreakpointKey } from "@/stores/useClassRegistryStore";

// ============================================================================
// Store State
// ============================================================================

interface ClassEditorStore {
  // UI State
  activeComponentId: string | null;
  activeClassIndex: number;
  activeBreakpoint: BreakpointKey;
  draggingClassIndex: number | null;
  dropIndicatorIndex: number | null;

  // Actions
  setActiveComponent: (componentId: string | null) => void;
  setActiveClassIndex: (index: number) => void;
  setActiveBreakpoint: (breakpoint: BreakpointKey) => void;
  setDraggingClassIndex: (index: number | null) => void;
  setDropIndicatorIndex: (index: number | null) => void;
  reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useClassEditorStore = create<ClassEditorStore>((set) => ({
  // Initial State
  activeComponentId: null,
  activeClassIndex: 0,
  activeBreakpoint: "desktop",
  draggingClassIndex: null,
  dropIndicatorIndex: null,

  // Actions
  setActiveComponent: (componentId) => {
    set({ activeComponentId: componentId, activeClassIndex: 0 });
  },

  setActiveClassIndex: (index) => {
    set({ activeClassIndex: index });
  },

  setActiveBreakpoint: (breakpoint) => {
    set({ activeBreakpoint: breakpoint });
  },

  setDraggingClassIndex: (index) => {
    set({ draggingClassIndex: index });
  },

  setDropIndicatorIndex: (index) => {
    set({ dropIndicatorIndex: index });
  },

  reset: () => {
    set({
      activeComponentId: null,
      activeClassIndex: 0,
      activeBreakpoint: "desktop",
      draggingClassIndex: null,
      dropIndicatorIndex: null,
    });
  },
}));
