import { create } from "zustand";
import { fetchData } from "@/utils/fetchHelpers";
import { initializeDefaultVariables } from "@/lib/client/class-system/default-variables";

// ============================================================================
// Types
// ============================================================================

export type VariableCategory = "color" | "spacing" | "sizing" | "typography";
export type VariableType =
  | "color"
  | "dimension"
  | "fontFamily"
  | "fontSize"
  | "fontWeight";
export type Theme = "light" | "dark";

export interface VariableValue {
  light: string;
  dark: string;
}

export interface Variable {
  id: string;
  website_id: string;
  name: string;
  key: string;
  category: VariableCategory;
  type: VariableType;
  value: VariableValue;
  created_at?: string;
  updated_at?: string;
}

export interface VariableReference {
  type: "variable";
  variableId: string;
}

export type PropertyValue = string | number | VariableReference;

// ============================================================================
// Store State
// ============================================================================

interface VariableStore {
  // State
  variables: Map<string, Variable>;
  currentTheme: Theme;
  currentWebsiteId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Initialization
  loadVariables: (websiteId: string) => Promise<void>;
  initializeDefaults: (websiteId: string) => Promise<void>;
  setCurrentWebsite: (websiteId: string) => void;
  reset: () => void;

  // Actions - CRUD
  createVariable: (
    websiteId: string,
    variable: Omit<Variable, "id" | "website_id" | "created_at" | "updated_at">,
  ) => Promise<Variable>;
  updateVariable: (
    id: string,
    updates: Partial<Omit<Variable, "id" | "website_id">>,
  ) => Promise<void>;
  deleteVariable: (id: string) => Promise<void>;

  // Actions - Theme Management
  setTheme: (theme: Theme) => void;
  getCurrentTheme: () => Theme;

  // Computed Getters - Value Resolution
  resolveValue: (value: PropertyValue) => string;
  resolveVariable: (variableId: string) => string;
  getVariable: (id: string) => Variable | undefined;
  listVariables: (category?: VariableCategory) => Variable[];
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useVariableStore = create<VariableStore>((set, get) => ({
  // Initial State
  variables: new Map(),
  currentTheme: "light",
  currentWebsiteId: null,
  isLoading: false,
  error: null,

  // ============================================================================
  // Initialization Actions
  // ============================================================================

  loadVariables: async (websiteId: string) => {
    set({ isLoading: true, error: null });

    await fetchData<Variable[]>(
      `/api/websites/${websiteId}/variables`,
      (data) => {
        const variablesMap = new Map<string, Variable>();
        data.forEach((variable) => {
          variablesMap.set(variable.id, variable);
        });
        set({ variables: variablesMap, currentWebsiteId: websiteId });
      },
      (err) => {
        console.error("Failed to load variables", err);
        set({ error: err.message });
      },
    );

    set({ isLoading: false });
  },

  initializeDefaults: async (websiteId: string) => {
    const { variables, createVariable } = get();
    const existingVariables = Array.from(variables.values());

    // Only initialize if no variables exist yet
    if (existingVariables.length === 0) {
      try {
        const result = await initializeDefaultVariables(
          websiteId,
          createVariable,
          existingVariables,
        );
        console.log(
          `Initialized ${result.created} default variables (${result.skipped} skipped)`,
        );
      } catch (error) {
        console.error("Failed to initialize default variables:", error);
      }
    }
  },

  setCurrentWebsite: (websiteId: string) => {
    const { currentWebsiteId } = get();
    if (currentWebsiteId !== websiteId) {
      // Clear variables when switching websites
      set({ variables: new Map(), currentWebsiteId: websiteId });
      // Load variables for new website
      get().loadVariables(websiteId);
    }
  },

  reset: () => {
    set({
      variables: new Map(),
      currentTheme: "light",
      currentWebsiteId: null,
      isLoading: false,
      error: null,
    });
  },

  // ============================================================================
  // CRUD Actions
  // ============================================================================

  createVariable: async (websiteId, variableData) => {
    set({ isLoading: true, error: null });

    const response = await fetch(`/api/websites/${websiteId}/variables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variableData),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      set({ error: error.error || "Failed to create variable", isLoading: false });
      throw new Error(error.error || "Failed to create variable");
    }

    const newVariable: Variable = await response.json();

    set((state) => {
      const newVariables = new Map(state.variables);
      newVariables.set(newVariable.id, newVariable);
      return { variables: newVariables, isLoading: false };
    });

    return newVariable;
  },

  updateVariable: async (id, updates) => {
    const { currentWebsiteId } = get();
    if (!currentWebsiteId) {
      throw new Error("No website selected");
    }

    set({ isLoading: true, error: null });

    const response = await fetch(
      `/api/websites/${currentWebsiteId}/variables/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      const error = await response.json() as any;
      set({ error: error.error || "Failed to update variable", isLoading: false });
      throw new Error(error.error || "Failed to update variable");
    }

    const updatedVariable: Variable = await response.json();

    set((state) => {
      const newVariables = new Map(state.variables);
      newVariables.set(id, updatedVariable);
      return { variables: newVariables, isLoading: false };
    });
  },

  deleteVariable: async (id) => {
    const { currentWebsiteId } = get();
    if (!currentWebsiteId) {
      throw new Error("No website selected");
    }

    set({ isLoading: true, error: null });

    const response = await fetch(
      `/api/websites/${currentWebsiteId}/variables/${id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const error = await response.json() as any;
      set({ error: error.error || "Failed to delete variable", isLoading: false });
      throw new Error(error.error || "Failed to delete variable");
    }

    set((state) => {
      const newVariables = new Map(state.variables);
      newVariables.delete(id);
      return { variables: newVariables, isLoading: false };
    });
  },

  // ============================================================================
  // Theme Management
  // ============================================================================

  setTheme: (theme: Theme) => {
    set({ currentTheme: theme });
  },

  getCurrentTheme: () => {
    return get().currentTheme;
  },

  // ============================================================================
  // Computed Getters - Value Resolution
  // ============================================================================

  resolveValue: (value: PropertyValue): string => {
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    // Handle VariableReference
    if (
      typeof value === "object" &&
      value !== null &&
      "type" in value &&
      value.type === "variable"
    ) {
      return get().resolveVariable(value.variableId);
    }

    return String(value);
  },

  resolveVariable: (variableId: string): string => {
    const { variables, currentTheme } = get();
    const variable = variables.get(variableId);

    if (!variable) {
      console.warn(`Variable not found: ${variableId}`);
      return ""; // Fallback to empty string
    }

    if (!variable.value || typeof variable.value !== "object") {
      console.warn(`Variable ${variableId} has invalid value structure:`, variable);
      return ""; // Fallback to empty string
    }

    const themeValue = variable.value[currentTheme];
    if (themeValue === undefined || themeValue === null) {
      console.warn(`Variable ${variableId} has no value for theme ${currentTheme}`);
      return ""; // Fallback to empty string
    }

    return themeValue;
  },

  getVariable: (id: string): Variable | undefined => {
    return get().variables.get(id);
  },

  listVariables: (category?: VariableCategory): Variable[] => {
    const { variables } = get();
    const allVariables = Array.from(variables.values());

    if (category) {
      return allVariables.filter((v) => v.category === category);
    }

    return allVariables;
  },
}));
