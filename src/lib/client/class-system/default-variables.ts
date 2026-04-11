import type { Variable, VariableCategory, VariableType } from "@/stores/useVariableStore";

/**
 * Default variables to initialize on first website load
 * These provide sensible defaults for common design tokens
 */

export interface DefaultVariableDefinition {
  name: string;
  key: string;
  category: VariableCategory;
  type: VariableType;
  value: {
    light: string;
    dark: string;
  };
}

export const DEFAULT_VARIABLES: DefaultVariableDefinition[] = [
  // ============================================================================
  // Color Variables
  // ============================================================================
  {
    name: "Primary Color",
    key: "color.primary",
    category: "color",
    type: "color",
    value: {
      light: "#f3602a",
      dark: "#ff7a47",
    },
  },
  {
    name: "Secondary Color",
    key: "color.secondary",
    category: "color",
    type: "color",
    value: {
      light: "#2563eb",
      dark: "#3b82f6",
    },
  },
  {
    name: "Neutral 50",
    key: "color.neutral.50",
    category: "color",
    type: "color",
    value: {
      light: "#fafafa",
      dark: "#18181b",
    },
  },
  {
    name: "Neutral 100",
    key: "color.neutral.100",
    category: "color",
    type: "color",
    value: {
      light: "#f4f4f5",
      dark: "#27272a",
    },
  },
  {
    name: "Neutral 200",
    key: "color.neutral.200",
    category: "color",
    type: "color",
    value: {
      light: "#e4e4e7",
      dark: "#3f3f46",
    },
  },
  {
    name: "Neutral 300",
    key: "color.neutral.300",
    category: "color",
    type: "color",
    value: {
      light: "#d4d4d8",
      dark: "#52525b",
    },
  },
  {
    name: "Neutral 700",
    key: "color.neutral.700",
    category: "color",
    type: "color",
    value: {
      light: "#3f3f46",
      dark: "#d4d4d8",
    },
  },
  {
    name: "Neutral 900",
    key: "color.neutral.900",
    category: "color",
    type: "color",
    value: {
      light: "#18181b",
      dark: "#fafafa",
    },
  },

  // ============================================================================
  // Spacing Variables
  // ============================================================================
  {
    name: "Spacing XS",
    key: "spacing.xs",
    category: "spacing",
    type: "dimension",
    value: {
      light: "4px",
      dark: "4px",
    },
  },
  {
    name: "Spacing S",
    key: "spacing.s",
    category: "spacing",
    type: "dimension",
    value: {
      light: "8px",
      dark: "8px",
    },
  },
  {
    name: "Spacing M",
    key: "spacing.m",
    category: "spacing",
    type: "dimension",
    value: {
      light: "16px",
      dark: "16px",
    },
  },
  {
    name: "Spacing L",
    key: "spacing.l",
    category: "spacing",
    type: "dimension",
    value: {
      light: "24px",
      dark: "24px",
    },
  },
  {
    name: "Spacing XL",
    key: "spacing.xl",
    category: "spacing",
    type: "dimension",
    value: {
      light: "32px",
      dark: "32px",
    },
  },
  {
    name: "Spacing 2XL",
    key: "spacing.2xl",
    category: "spacing",
    type: "dimension",
    value: {
      light: "48px",
      dark: "48px",
    },
  },

  // ============================================================================
  // Sizing Variables
  // ============================================================================
  {
    name: "Container SM",
    key: "sizing.container.sm",
    category: "sizing",
    type: "dimension",
    value: {
      light: "640px",
      dark: "640px",
    },
  },
  {
    name: "Container MD",
    key: "sizing.container.md",
    category: "sizing",
    type: "dimension",
    value: {
      light: "768px",
      dark: "768px",
    },
  },
  {
    name: "Container LG",
    key: "sizing.container.lg",
    category: "sizing",
    type: "dimension",
    value: {
      light: "1024px",
      dark: "1024px",
    },
  },
  {
    name: "Container XL",
    key: "sizing.container.xl",
    category: "sizing",
    type: "dimension",
    value: {
      light: "1280px",
      dark: "1280px",
    },
  },
  {
    name: "Container 2XL",
    key: "sizing.container.2xl",
    category: "sizing",
    type: "dimension",
    value: {
      light: "1536px",
      dark: "1536px",
    },
  },

  // ============================================================================
  // Typography Variables
  // ============================================================================
  {
    name: "Font Family Sans",
    key: "typography.fontFamily.sans",
    category: "typography",
    type: "fontFamily",
    value: {
      light: "system-ui, -apple-system, sans-serif",
      dark: "system-ui, -apple-system, sans-serif",
    },
  },
  {
    name: "Font Family Serif",
    key: "typography.fontFamily.serif",
    category: "typography",
    type: "fontFamily",
    value: {
      light: "Georgia, Cambria, serif",
      dark: "Georgia, Cambria, serif",
    },
  },
  {
    name: "Font Family Mono",
    key: "typography.fontFamily.mono",
    category: "typography",
    type: "fontFamily",
    value: {
      light: "ui-monospace, monospace",
      dark: "ui-monospace, monospace",
    },
  },
  {
    name: "Font Size XS",
    key: "typography.fontSize.xs",
    category: "typography",
    type: "fontSize",
    value: {
      light: "12px",
      dark: "12px",
    },
  },
  {
    name: "Font Size SM",
    key: "typography.fontSize.sm",
    category: "typography",
    type: "fontSize",
    value: {
      light: "14px",
      dark: "14px",
    },
  },
  {
    name: "Font Size Base",
    key: "typography.fontSize.base",
    category: "typography",
    type: "fontSize",
    value: {
      light: "16px",
      dark: "16px",
    },
  },
  {
    name: "Font Size LG",
    key: "typography.fontSize.lg",
    category: "typography",
    type: "fontSize",
    value: {
      light: "18px",
      dark: "18px",
    },
  },
  {
    name: "Font Size XL",
    key: "typography.fontSize.xl",
    category: "typography",
    type: "fontSize",
    value: {
      light: "20px",
      dark: "20px",
    },
  },
  {
    name: "Font Size 2XL",
    key: "typography.fontSize.2xl",
    category: "typography",
    type: "fontSize",
    value: {
      light: "24px",
      dark: "24px",
    },
  },
  {
    name: "Font Weight Normal",
    key: "typography.fontWeight.normal",
    category: "typography",
    type: "fontWeight",
    value: {
      light: "400",
      dark: "400",
    },
  },
  {
    name: "Font Weight Medium",
    key: "typography.fontWeight.medium",
    category: "typography",
    type: "fontWeight",
    value: {
      light: "500",
      dark: "500",
    },
  },
  {
    name: "Font Weight Semibold",
    key: "typography.fontWeight.semibold",
    category: "typography",
    type: "fontWeight",
    value: {
      light: "600",
      dark: "600",
    },
  },
  {
    name: "Font Weight Bold",
    key: "typography.fontWeight.bold",
    category: "typography",
    type: "fontWeight",
    value: {
      light: "700",
      dark: "700",
    },
  },
];

/**
 * Initialize default variables for a website
 * Only creates variables that don't already exist
 */
export async function initializeDefaultVariables(
  websiteId: string,
  createVariable: (
    websiteId: string,
    variable: Omit<Variable, "id" | "website_id" | "created_at" | "updated_at">,
  ) => Promise<Variable>,
  existingVariables: Variable[],
): Promise<{ created: number; skipped: number }> {
  const existingKeys = new Set(existingVariables.map((v) => v.key));
  let created = 0;
  let skipped = 0;

  for (const defaultVar of DEFAULT_VARIABLES) {
    if (existingKeys.has(defaultVar.key)) {
      skipped++;
      continue;
    }

    try {
      await createVariable(websiteId, defaultVar);
      created++;
    } catch (error) {
      console.error(`Failed to create default variable ${defaultVar.key}:`, error);
      skipped++;
    }
  }

  return { created, skipped };
}
