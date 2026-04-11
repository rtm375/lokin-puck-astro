import { create } from "zustand";
import { fetchData } from "@/utils/fetchHelpers";
import { useVariableStore, type PropertyValue } from "./useVariableStore";
import {
  mergeClasses,
  mergeClassesUpTo,
  convertToComputedStyles,
  type MergeContext,
} from "@/lib/client/class-system/merge-engine";
import { initializeExampleClasses } from "@/lib/client/class-system/default-classes";

// ============================================================================
// Types
// ============================================================================

export type ClassType = "layout" | "utility" | "utility-sub" | "custom";

export type BreakpointKey = "desktop" | "laptop" | "tablet" | "mobile";

export type ResponsiveValue<T> = {
  [key in BreakpointKey]?: T;
};

export interface ResponsiveSpacing {
  top: ResponsiveValue<PropertyValue>;
  right: ResponsiveValue<PropertyValue>;
  bottom: ResponsiveValue<PropertyValue>;
  left: ResponsiveValue<PropertyValue>;
  topCustom?: ResponsiveValue<number>;
  rightCustom?: ResponsiveValue<number>;
  bottomCustom?: ResponsiveValue<number>;
  leftCustom?: ResponsiveValue<number>;
  unit?: ResponsiveValue<string>;
  lock: boolean;
}

export interface ClassProperties {
  // Layout properties (flex)
  flexDirection?: ResponsiveValue<PropertyValue>;
  justifyContent?: ResponsiveValue<PropertyValue>;
  alignItems?: ResponsiveValue<PropertyValue>;
  flexWrap?: ResponsiveValue<PropertyValue>;
  gap?: ResponsiveValue<PropertyValue>;
  rowGap?: ResponsiveValue<PropertyValue>;
  columnGap?: ResponsiveValue<PropertyValue>;

  // Layout properties (grid)
  gridTemplateColumns?: ResponsiveValue<PropertyValue>;
  gridTemplateRows?: ResponsiveValue<PropertyValue>;
  gridGap?: ResponsiveValue<PropertyValue>;
  gridRowGap?: ResponsiveValue<PropertyValue>;
  gridColumnGap?: ResponsiveValue<PropertyValue>;
  justifyItems?: ResponsiveValue<PropertyValue>;
  alignContent?: ResponsiveValue<PropertyValue>;

  // Common properties
  width?: ResponsiveValue<PropertyValue>;
  minWidth?: ResponsiveValue<PropertyValue>;
  maxWidth?: ResponsiveValue<PropertyValue>;
  height?: ResponsiveValue<PropertyValue>;
  minHeight?: ResponsiveValue<PropertyValue>;
  maxHeight?: ResponsiveValue<PropertyValue>;
  margin?: ResponsiveSpacing;
  padding?: ResponsiveSpacing;

  // Background and borders
  backgroundColor?: ResponsiveValue<PropertyValue>;
  borderRadius?: ResponsiveValue<PropertyValue>;
  borderWidth?: ResponsiveValue<PropertyValue>;
  borderColor?: ResponsiveValue<PropertyValue>;
}

export interface StyleClass {
  id: string;
  website_id: string;
  name: string;
  description?: string;
  type: ClassType;
  properties: ClassProperties;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ComputedStyles {
  properties: ClassProperties;
  cssVariables: Record<string, string>;
  classNames: string[];
}

// ============================================================================
// Store State
// ============================================================================

interface ClassRegistryStore {
  // State
  classes: Map<string, StyleClass>;
  systemClassesInitialized: boolean;
  currentWebsiteId: string | null;
  isLoading: boolean;
  error: string | null;
  dirtyClasses: Set<string>; // Track which classes have unsaved changes

  // Cache for computed styles
  computedStylesCache: Map<string, ComputedStyles>;

  // Actions - Initialization
  loadClasses: (websiteId: string) => Promise<void>;
  initializeSystemClasses: (websiteId: string) => Promise<void>;
  initializeExamples: (websiteId: string) => Promise<void>;
  setCurrentWebsite: (websiteId: string) => void;
  reset: () => void;

  // Actions - CRUD
  createClass: (
    websiteId: string,
    classData: Omit<
      StyleClass,
      "id" | "website_id" | "created_at" | "updated_at"
    >,
  ) => Promise<StyleClass>;
  updateClass: (
    id: string,
    updates: Partial<Omit<StyleClass, "id" | "website_id">>,
  ) => Promise<void>;
  updateClassLocal: (
    id: string,
    updates: Partial<Omit<StyleClass, "id" | "website_id">>,
  ) => void;
  deleteClass: (id: string) => Promise<void>;
  saveAllClasses: () => Promise<void>;

  // Actions - Cache Management
  invalidateCache: (classId?: string) => void;

  // Actions - Export/Import
  exportClasses: () => string;
  importClasses: (
    websiteId: string,
    jsonData: string,
    onConflict?: (existingName: string, newName: string) => string,
  ) => Promise<{ imported: number; skipped: number; errors: string[] }>;

  // Computed Getters - Lookup
  getClass: (id: string) => StyleClass | undefined;
  getClassByName: (name: string) => StyleClass | undefined;
  listClasses: (type?: ClassType) => StyleClass[];
  getLayoutClasses: () => StyleClass[];
  getSystemClasses: () => StyleClass[];

  // Computed Getters - Validation
  validateClassName: (name: string) => boolean;
  validateClassProperties: (
    properties: ClassProperties,
    type: ClassType,
  ) => boolean;

  // Computed Getters - Style Computation
  getComputedStyles: (classIds: string[]) => ComputedStyles;
  getLayoutMode: (classIds: string[]) => "flex" | "grid" | null;
  getInheritedValue: (
    classIds: string[],
    activeIndex: number,
    property: keyof ClassProperties,
    breakpoint: BreakpointKey,
  ) => PropertyValue | undefined;
}

// ============================================================================
// System Classes Definitions
// ============================================================================

const FLEX_CLASS_PROPERTIES: ClassProperties = {
  flexDirection: { desktop: "row" },
  justifyContent: { desktop: "flex-start" },
  alignItems: { desktop: "stretch" },
  flexWrap: { desktop: "nowrap" },
  gap: { desktop: "0px" },
};

const GRID_CLASS_PROPERTIES: ClassProperties = {
  gridTemplateColumns: { desktop: "repeat(auto-fit, minmax(250px, 1fr))" },
  gridGap: { desktop: "16px" },
  justifyItems: { desktop: "stretch" },
  alignItems: { desktop: "stretch" },
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useClassRegistryStore = create<ClassRegistryStore>((set, get) => ({
  // Initial State
  classes: new Map(),
  systemClassesInitialized: false,
  currentWebsiteId: null,
  isLoading: false,
  error: null,
  computedStylesCache: new Map(),
  dirtyClasses: new Set(),

  // ============================================================================
  // Initialization Actions
  // ============================================================================

  loadClasses: async (websiteId: string) => {
    set({ isLoading: true, error: null });

    await fetchData<StyleClass[]>(
      `/api/websites/${websiteId}/style-classes`,
      (data) => {
        const classesMap = new Map<string, StyleClass>();
        data.forEach((styleClass) => {
          classesMap.set(styleClass.id, styleClass);
        });
        set({
          classes: classesMap,
          currentWebsiteId: websiteId,
          systemClassesInitialized: data.some((c) => c.is_system),
        });
      },
      (err) => {
        console.error("Failed to load classes", err);
        set({ error: err.message });
      },
    );

    set({ isLoading: false });
  },

  initializeSystemClasses: async (websiteId: string) => {
    const { systemClassesInitialized, classes } = get();

    // Check if system classes already exist
    const hasSystemClasses = Array.from(classes.values()).some(
      (c) => c.is_system,
    );

    if (systemClassesInitialized || hasSystemClasses) {
      return; // Already initialized
    }

    set({ isLoading: true, error: null });

    try {
      // Create Flex system class
      await get().createClass(websiteId, {
        name: "Flex",
        type: "layout",
        is_system: true,
        properties: FLEX_CLASS_PROPERTIES,
      });

      // Create Grid system class
      await get().createClass(websiteId, {
        name: "Grid",
        type: "layout",
        is_system: true,
        properties: GRID_CLASS_PROPERTIES,
      });

      set({ systemClassesInitialized: true });
    } catch (error) {
      console.error("Failed to initialize system classes", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize system classes";
      set({ error: errorMessage });
    }

    set({ isLoading: false });
  },

  initializeExamples: async (websiteId: string) => {
    const { classes, createClass } = get();
    const existingClasses = Array.from(classes.values());

    // Only initialize example classes if we have system classes but no custom classes
    const hasCustomClasses = existingClasses.some((c) => !c.is_system);

    if (!hasCustomClasses) {
      try {
        const result = await initializeExampleClasses(
          websiteId,
          createClass,
          existingClasses,
        );
        console.log(
          `Initialized ${result.created} example classes (${result.skipped} skipped)`,
        );
      } catch (error) {
        console.error("Failed to initialize example classes:", error);
      }
    }
  },

  setCurrentWebsite: (websiteId: string) => {
    const { currentWebsiteId } = get();
    if (currentWebsiteId !== websiteId) {
      // Clear classes and cache when switching websites
      set({
        classes: new Map(),
        currentWebsiteId: websiteId,
        computedStylesCache: new Map(),
        systemClassesInitialized: false,
      });
      // Load classes for new website
      get().loadClasses(websiteId);
    }
  },

  reset: () => {
    set({
      classes: new Map(),
      systemClassesInitialized: false,
      currentWebsiteId: null,
      isLoading: false,
      error: null,
      computedStylesCache: new Map(),
      dirtyClasses: new Set(),
    });
  },

  // ============================================================================
  // CRUD Actions
  // ============================================================================

  createClass: async (websiteId, classData) => {
    set({ isLoading: true, error: null });

    // Validate class name
    if (!get().validateClassName(classData.name)) {
      const error = "Invalid class name";
      set({ error, isLoading: false });
      throw new Error(error);
    }

    // Check for duplicate name
    const existingClass = get().getClassByName(classData.name);
    if (existingClass) {
      const error = `Class with name "${classData.name}" already exists`;
      set({ error, isLoading: false });
      throw new Error(error);
    }

    const response = await fetch(`/api/websites/${websiteId}/style-classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = (errorData as any).error || "Failed to create class";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }

    const newClass: StyleClass = await response.json();

    set((state) => {
      const newClasses = new Map(state.classes);
      newClasses.set(newClass.id, newClass);
      return { classes: newClasses, isLoading: false };
    });

    // Invalidate cache since we added a new class
    get().invalidateCache();

    return newClass;
  },

  updateClass: async (id, updates) => {
    const { currentWebsiteId, classes } = get();
    if (!currentWebsiteId) {
      throw new Error("No website selected");
    }

    const existingClass = classes.get(id);
    if (!existingClass) {
      throw new Error(`Class not found: ${id}`);
    }

    // Prevent modification of system classes
    if (existingClass.is_system) {
      // Allow property updates but not name/type changes
      if (updates.name || updates.type !== undefined) {
        throw new Error("Cannot rename or change type of system classes");
      }
    }

    // Validate name if being updated
    if (updates.name && !get().validateClassName(updates.name)) {
      throw new Error("Invalid class name");
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== existingClass.name) {
      const duplicate = get().getClassByName(updates.name);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Class with name "${updates.name}" already exists`);
      }
    }

    set({ isLoading: true, error: null });

    const response = await fetch(
      `/api/websites/${currentWebsiteId}/style-classes/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = (errorData as any).error || "Failed to update class";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }

    const updatedClass: StyleClass = await response.json();

    set((state) => {
      const newClasses = new Map(state.classes);
      newClasses.set(id, updatedClass);
      const newDirtyClasses = new Set(state.dirtyClasses);
      newDirtyClasses.delete(id); // Remove from dirty set after successful save
      return { classes: newClasses, isLoading: false, dirtyClasses: newDirtyClasses };
    });

    // Invalidate cache for this class
    get().invalidateCache(id);
  },

  updateClassLocal: (id, updates) => {
    const { classes } = get();
    const existingClass = classes.get(id);
    
    if (!existingClass) {
      console.warn(`Class not found: ${id}`);
      return;
    }

    // Prevent modification of system classes
    if (existingClass.is_system) {
      // Allow property updates but not name/type changes
      if (updates.name || updates.type !== undefined) {
        console.warn("Cannot rename or change type of system classes");
        return;
      }
    }

    // Update local state immediately
    const updatedClass = {
      ...existingClass,
      ...updates,
      properties: updates.properties || existingClass.properties,
    };
    
    set((state) => {
      const newClasses = new Map(state.classes);
      newClasses.set(id, updatedClass);
      const newDirtyClasses = new Set(state.dirtyClasses);
      newDirtyClasses.add(id); // Mark as dirty
      return { classes: newClasses, dirtyClasses: newDirtyClasses };
    });
    
    // Invalidate cache immediately
    get().invalidateCache(id);
  },

  saveAllClasses: async () => {
    const { currentWebsiteId, classes, dirtyClasses } = get();
    
    if (!currentWebsiteId) {
      throw new Error("No website selected");
    }

    if (dirtyClasses.size === 0) {
      console.log("No classes to save");
      return;
    }

    set({ isLoading: true, error: null });

    const savePromises: Promise<void>[] = [];
    const errors: string[] = [];

    // Save all dirty classes
    for (const classId of dirtyClasses) {
      const styleClass = classes.get(classId);
      if (!styleClass) continue;

      const savePromise = fetch(
        `/api/websites/${currentWebsiteId}/style-classes/${classId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            properties: styleClass.properties,
            name: styleClass.name,
            description: styleClass.description,
          }),
        },
      )
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error((errorData as any).error || "Failed to save class");
            });
          }
          return response.json();
        })
        .then((updatedClass) => {
          // Update with server response
          set((state) => {
            const newClasses = new Map(state.classes);
            newClasses.set(classId, updatedClass as StyleClass);
            return { classes: newClasses };
          });
        })
        .catch((error) => {
          errors.push(`Failed to save class ${styleClass.name}: ${error.message}`);
        });

      savePromises.push(savePromise);
    }

    await Promise.all(savePromises);

    if (errors.length > 0) {
      set({ 
        error: errors.join("; "), 
        isLoading: false 
      });
      throw new Error(errors.join("; "));
    }

    // Clear dirty classes after successful save
    set({ 
      dirtyClasses: new Set(), 
      isLoading: false 
    });

    console.log(`Saved ${dirtyClasses.size} classes to database`);
  },

  deleteClass: async (id) => {
    const { currentWebsiteId, classes } = get();
    if (!currentWebsiteId) {
      throw new Error("No website selected");
    }

    const existingClass = classes.get(id);
    if (!existingClass) {
      throw new Error(`Class not found: ${id}`);
    }

    // Prevent deletion of system classes
    if (existingClass.is_system) {
      throw new Error("Cannot delete system classes");
    }

    set({ isLoading: true, error: null });

    const response = await fetch(
      `/api/websites/${currentWebsiteId}/style-classes/${id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = (errorData as any).error || "Failed to delete class";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }

    set((state) => {
      const newClasses = new Map(state.classes);
      newClasses.delete(id);
      return { classes: newClasses, isLoading: false };
    });

    // Invalidate cache since we removed a class
    get().invalidateCache(id);
  },

  // ============================================================================
  // Cache Management
  // ============================================================================

  invalidateCache: (classId?: string) => {
    set((state) => {
      if (classId) {
        // Remove entries containing this classId
        const newCache = new Map(state.computedStylesCache);
        for (const [key] of newCache) {
          if (key.includes(classId)) {
            newCache.delete(key);
          }
        }
        return { computedStylesCache: newCache };
      }
      // Clear all cache
      return { computedStylesCache: new Map() };
    });
  },

  // ============================================================================
  // Computed Getters - Lookup
  // ============================================================================

  getClass: (id: string): StyleClass | undefined => {
    return get().classes.get(id);
  },

  getClassByName: (name: string): StyleClass | undefined => {
    const { classes } = get();
    return Array.from(classes.values()).find((c) => c.name === name);
  },

  listClasses: (type?: ClassType): StyleClass[] => {
    const { classes } = get();
    const allClasses = Array.from(classes.values());

    if (type) {
      return allClasses.filter((c) => c.type === type);
    }

    return allClasses;
  },

  getLayoutClasses: (): StyleClass[] => {
    return get().listClasses("layout");
  },

  getSystemClasses: (): StyleClass[] => {
    const { classes } = get();
    return Array.from(classes.values()).filter((c) => c.is_system);
  },

  // ============================================================================
  // Computed Getters - Validation
  // ============================================================================

  validateClassName: (name: string): boolean => {
    // Must be 1-50 characters
    // Alphanumeric, hyphens, underscores, and spaces allowed
    // Cannot start with number or space
    // Cannot end with space
    const regex = /^[a-zA-Z_][a-zA-Z0-9_\- ]{0,48}[a-zA-Z0-9_-]$/;
    // Also allow single character names
    const singleCharRegex = /^[a-zA-Z_]$/;
    return regex.test(name) || singleCharRegex.test(name);
  },

  validateClassProperties: (
    properties: ClassProperties,
    type: ClassType,
  ): boolean => {
    // Basic validation - can be extended based on requirements
    // For now, just check that properties is an object
    if (!properties || typeof properties !== "object") {
      return false;
    }

    // Layout classes should have layout-specific properties
    if (type === "layout") {
      const hasFlexProps =
        properties.flexDirection ||
        properties.justifyContent ||
        properties.alignItems;
      const hasGridProps =
        properties.gridTemplateColumns ||
        properties.gridTemplateRows ||
        properties.gridGap;

      return !!(hasFlexProps || hasGridProps);
    }

    return true;
  },

  // ============================================================================
  // Computed Getters - Style Computation
  // ============================================================================

  getComputedStyles: (classIds: string[]): ComputedStyles => {
    const { classes, computedStylesCache } = get();
    const variableStore = useVariableStore.getState();
    const theme = variableStore.currentTheme;
    const cacheKey = `${classIds.join(":")}-${theme}`;

    // Check cache first
    const cached = computedStylesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Create merge context
    const context: MergeContext = {
      classes,
      resolveValue: variableStore.resolveValue,
      currentTheme: theme,
    };

    // Merge classes using merge engine
    const merged = mergeClasses(classIds, context);

    // Convert to computed styles with CSS generation
    const computed = convertToComputedStyles(merged, context);

    // Cache the result
    const newCache = new Map(computedStylesCache);
    newCache.set(cacheKey, computed);
    set({ computedStylesCache: newCache });

    return computed;
  },

  getLayoutMode: (classIds: string[]): "flex" | "grid" | null => {
    const { classes } = get();

    // Find the last layout class in the stack (rightmost wins)
    for (let i = classIds.length - 1; i >= 0; i--) {
      const styleClass = classes.get(classIds[i]);
      if (styleClass && styleClass.type === "layout") {
        // Determine if it's flex or grid based on properties
        const props = styleClass.properties;
        
        // Check for flex-specific properties
        if (
          props.flexDirection !== undefined ||
          props.justifyContent !== undefined ||
          props.alignItems !== undefined ||
          props.flexWrap !== undefined
        ) {
          return "flex";
        }
        
        // Check for grid-specific properties
        if (
          props.gridTemplateColumns !== undefined ||
          props.gridTemplateRows !== undefined ||
          props.gridGap !== undefined
        ) {
          return "grid";
        }
      }
    }

    return null;
  },

  getInheritedValue: (
    classIds: string[],
    activeIndex: number,
    property: keyof ClassProperties,
    breakpoint: BreakpointKey,
  ): PropertyValue | undefined => {
    const { classes, computedStylesCache } = get();
    const variableStore = useVariableStore.getState();
    const theme = variableStore.currentTheme;
    
    // Create cache key for inherited value
    const inheritedClassIds = classIds.slice(0, activeIndex);
    const cacheKey = `inherited:${inheritedClassIds.join(":")}-${property}-${breakpoint}-${theme}`;

    // Check if we have a cached computed style for this combination
    const cached = computedStylesCache.get(cacheKey);
    if (cached && cached.properties[property]) {
      const propValue = cached.properties[property];
      
      // Extract value for specific breakpoint
      if (typeof propValue === "object" && propValue !== null && !("type" in propValue)) {
        const responsiveValue = propValue as ResponsiveValue<PropertyValue>;
        return responsiveValue[breakpoint];
      }
      
      return propValue as PropertyValue;
    }

    // If no cache, compute inherited value using merge engine
    if (activeIndex === 0) {
      return undefined; // No previous classes
    }

    const context: MergeContext = {
      classes,
      resolveValue: variableStore.resolveValue,
      currentTheme: theme,
    };

    // Merge classes up to (but not including) the active index
    const merged = mergeClassesUpTo(inheritedClassIds, activeIndex, context);
    
    // Cache the merged result
    const computed = convertToComputedStyles(merged, context);
    const newCache = new Map(computedStylesCache);
    newCache.set(cacheKey, computed);
    set({ computedStylesCache: newCache });

    // Extract the property value for the specific breakpoint
    const propertyValue = merged[property];
    if (!propertyValue) {
      return undefined;
    }

    // Handle ResponsiveValue
    if (typeof propertyValue === "object" && propertyValue !== null && !("type" in propertyValue)) {
      // Check if it's ResponsiveSpacing
      if ("top" in propertyValue && "right" in propertyValue) {
        // For spacing properties, we don't return a single value
        // The UI will need to handle this differently
        return undefined;
      }
      
      const responsiveValue = propertyValue as ResponsiveValue<PropertyValue>;
      return responsiveValue[breakpoint];
    }

    // Direct value
    return propertyValue as PropertyValue;
  },

  // ============================================================================
  // Export/Import Actions
  // ============================================================================

  exportClasses: (): string => {
    const { classes } = get();
    const allClasses = Array.from(classes.values());

    // Filter out system classes from export (they're pre-registered)
    const exportableClasses = allClasses.filter((c) => !c.is_system);

    // Create export data structure
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      classes: exportableClasses.map((c) => ({
        name: c.name,
        description: c.description,
        type: c.type,
        properties: c.properties,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  },

  importClasses: async (
    websiteId: string,
    jsonData: string,
    onConflict?: (existingName: string, newName: string) => string,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      // Parse JSON
      const importData = JSON.parse(jsonData);

      // Validate structure
      if (!importData.classes || !Array.isArray(importData.classes)) {
        throw new Error("Invalid import format: missing classes array");
      }

      // Process each class
      for (const classData of importData.classes) {
        try {
          // Validate required fields
          if (!classData.name || !classData.type || !classData.properties) {
            result.errors.push(
              `Skipped class: missing required fields (name: ${classData.name})`,
            );
            result.skipped++;
            continue;
          }

          // Check for name conflict
          let finalName = classData.name;
          const existingClass = get().getClassByName(classData.name);

          if (existingClass) {
            if (onConflict) {
              // Use conflict resolution callback
              finalName = onConflict(existingClass.name, classData.name);
              
              // If callback returns empty string, skip this class
              if (!finalName) {
                result.skipped++;
                continue;
              }
            } else {
              // Default: append timestamp to make unique
              finalName = `${classData.name}_${Date.now()}`;
            }
          }

          // Validate class name
          if (!get().validateClassName(finalName)) {
            result.errors.push(
              `Invalid class name after conflict resolution: ${finalName}`,
            );
            result.skipped++;
            continue;
          }

          // Validate properties
          if (!get().validateClassProperties(classData.properties, classData.type)) {
            result.errors.push(
              `Invalid properties for class: ${finalName}`,
            );
            result.skipped++;
            continue;
          }

          // Create the class
          await get().createClass(websiteId, {
            name: finalName,
            description: classData.description,
            type: classData.type,
            is_system: false,
            properties: classData.properties,
          });

          result.imported++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to import class "${classData.name}": ${errorMessage}`,
          );
          result.skipped++;
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Failed to parse import data: ${errorMessage}`);
    }

    return result;
  },
}));
