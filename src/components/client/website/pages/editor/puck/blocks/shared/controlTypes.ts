import { type VariableType } from "@/types";

/**
 * Maps each CSS property to the variable type(s) that can be bound to it.
 * This is the single source of truth — controls read from this, never hardcode.
 */
export const CSS_PROPERTY_VARIABLE_MAP: Record<string, VariableType[]> = {
  // Color properties → "color" variables
  backgroundColor: ["color"],
  color: ["color"],
  borderColor: ["color"],
  outlineColor: ["color"],
  textDecorationColor: ["color"],
  caretColor: ["color"],
  accentColor: ["color"],
  fill: ["color"],
  stroke: ["color"],
  background: ["color"],  // gradient support

  // Length properties → "length" variables
  width: ["length"],
  height: ["length"],
  minWidth: ["length"],
  maxWidth: ["length"],
  minHeight: ["length"],
  maxHeight: ["length"],
  paddingTop: ["length"],
  paddingRight: ["length"],
  paddingBottom: ["length"],
  paddingLeft: ["length"],
  marginTop: ["length"],
  marginRight: ["length"],
  marginBottom: ["length"],
  marginLeft: ["length"],
  gap: ["length"],
  rowGap: ["length"],
  columnGap: ["length"],
  borderWidth: ["length"],
  borderRadius: ["length"],
  fontSize: ["length"],
  lineHeight: ["length"],
  letterSpacing: ["length"],
  top: ["length"],
  right: ["length"],
  bottom: ["length"],
  left: ["length"],

  // Shadow properties → shadow variables
  boxShadow: ["box-shadow"],
  textShadow: ["text-shadow"],
};

/**
 * Get compatible variable types for a CSS property.
 * Returns empty array if no variables are applicable.
 */
export const getVariableTypesForProperty = (cssProperty: string): VariableType[] => {
  return CSS_PROPERTY_VARIABLE_MAP[cssProperty] || [];
};

/**
 * Check if a value is a variable reference
 */
export const isVariableRef = (value: string): boolean => {
  return typeof value === "string" && value.startsWith("var(--lv-");
};

/**
 * Extract variable ID from a var() reference
 * Format: var(--lv-{variableId})
 */
export const parseVariableRef = (value: string): string | null => {
  const match = value?.match?.(/^var\(--lv-(.+)\)$/);
  return match ? match[1] : null;
};

/**
 * Create a CSS var() reference from a variable ID
 */
export const createVariableRef = (variableId: string): string => {
  return `var(--lv-${variableId})`;
};

/**
 * Infers the variable type based on its value.
 * Used to filter variables by their apparent type since the type isn't stored explicitly on the variable object.
 */
export const inferVariableType = (value: string): VariableType | "simple" => {
  if (!value) return "simple";
  if (value.includes("gradient") || value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl") || value === "transparent" || value === "currentColor") {
    return "color";
  }
  if (value.match(/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh|ch|ex|vmin|vmax)?$/) || value === "auto" || value === "0") {
    return "length";
  }
  const parts = value.split(" ").filter(Boolean);
  if (parts.length >= 4) {
    if (parts.length === 4) return "text-shadow";
    return "box-shadow";
  }
  return "simple";
};

