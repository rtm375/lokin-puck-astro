import type { StyleClass, ClassProperties } from "@/stores/useClassRegistryStore";

/**
 * Example classes to help users get started
 * These demonstrate common layout patterns
 */

export interface DefaultClassDefinition {
  name: string;
  description: string;
  type: "custom";
  properties: ClassProperties;
}

export const DEFAULT_EXAMPLE_CLASSES: DefaultClassDefinition[] = [
  // ============================================================================
  // Centered Column
  // ============================================================================
  {
    name: "Centered Column",
    description: "A vertically stacked column with centered content",
    type: "custom",
    properties: {
      flexDirection: { desktop: "column" },
      justifyContent: { desktop: "center" },
      alignItems: { desktop: "center" },
      gap: { desktop: "16px" },
      padding: {
        top: { desktop: "24px" },
        right: { desktop: "24px" },
        bottom: { desktop: "24px" },
        left: { desktop: "24px" },
        lock: true,
      },
    },
  },

  // ============================================================================
  // Spaced Row
  // ============================================================================
  {
    name: "Spaced Row",
    description: "A horizontal row with space between items",
    type: "custom",
    properties: {
      flexDirection: { desktop: "row" },
      justifyContent: { desktop: "space-between" },
      alignItems: { desktop: "center" },
      gap: { desktop: "16px" },
      flexWrap: { desktop: "wrap" },
    },
  },

  // ============================================================================
  // Grid Gallery
  // ============================================================================
  {
    name: "Grid Gallery",
    description: "A responsive grid layout for image galleries",
    type: "custom",
    properties: {
      gridTemplateColumns: {
        desktop: "repeat(4, 1fr)",
        laptop: "repeat(3, 1fr)",
        tablet: "repeat(2, 1fr)",
        mobile: "repeat(1, 1fr)",
      },
      gridGap: { desktop: "24px", tablet: "16px", mobile: "12px" },
      padding: {
        top: { desktop: "24px" },
        right: { desktop: "24px" },
        bottom: { desktop: "24px" },
        left: { desktop: "24px" },
        lock: true,
      },
    },
  },

  // ============================================================================
  // Card Container
  // ============================================================================
  {
    name: "Card Container",
    description: "A card-style container with padding and background",
    type: "custom",
    properties: {
      flexDirection: { desktop: "column" },
      gap: { desktop: "12px" },
      padding: {
        top: { desktop: "20px" },
        right: { desktop: "20px" },
        bottom: { desktop: "20px" },
        left: { desktop: "20px" },
        lock: true,
      },
      backgroundColor: { desktop: "#ffffff" },
      borderRadius: { desktop: "8px" },
      borderWidth: { desktop: "1px" },
      borderColor: { desktop: "#e4e4e7" },
    },
  },
];

/**
 * Initialize example classes for a website
 * Only creates classes that don't already exist
 */
export async function initializeExampleClasses(
  websiteId: string,
  createClass: (
    websiteId: string,
    classData: Omit<StyleClass, "id" | "website_id" | "created_at" | "updated_at">,
  ) => Promise<StyleClass>,
  existingClasses: StyleClass[],
): Promise<{ created: number; skipped: number }> {
  const existingNames = new Set(existingClasses.map((c) => c.name));
  let created = 0;
  let skipped = 0;

  for (const exampleClass of DEFAULT_EXAMPLE_CLASSES) {
    if (existingNames.has(exampleClass.name)) {
      skipped++;
      continue;
    }

    try {
      await createClass(websiteId, {
        name: exampleClass.name,
        description: exampleClass.description,
        type: exampleClass.type,
        is_system: false,
        properties: exampleClass.properties,
      });
      created++;
    } catch (error) {
      console.error(`Failed to create example class ${exampleClass.name}:`, error);
      skipped++;
    }
  }

  return { created, skipped };
}
