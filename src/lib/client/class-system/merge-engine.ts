import type {
  ClassProperties,
  StyleClass,
  ResponsiveValue,
  ResponsiveSpacing,
  BreakpointKey,
  ComputedStyles,
} from "@/stores/useClassRegistryStore";
import type { PropertyValue } from "@/stores/useVariableStore";
import { ErrorCode, createClassSystemError, logClassSystemError } from "./errors";

// ============================================================================
// Types
// ============================================================================

export interface MergeContext {
  classes: Map<string, StyleClass>;
  resolveValue: (value: PropertyValue) => string;
  currentTheme: string;
}

export interface PropertyExplanation {
  property: string;
  finalValue: any;
  contributingClass: string; // ID of class that set this value
  overriddenBy: string[]; // IDs of classes that were overridden
}

export interface MergeTrace {
  step: number;
  classId: string;
  className: string;
  propertiesAdded: string[];
  propertiesOverridden: string[];
  currentState: ClassProperties;
}

// ============================================================================
// Core Merge Functions
// ============================================================================

/**
 * Merges multiple classes in left-to-right order, with later classes overriding earlier ones.
 * Handles responsive values at the breakpoint level and spacing at the edge level.
 * 
 * @param classIds - Array of class IDs to merge
 * @param context - Merge context with class registry and value resolver
 * @returns Merged class properties
 */
export function mergeClasses(
  classIds: string[],
  context: MergeContext
): ClassProperties {
  const result: ClassProperties = {};
  
  // Filter out invalid class IDs first
  const validClassIds = classIds.filter((classId) => {
    const exists = context.classes.has(classId);
    if (!exists) {
      const error = createClassSystemError(
        `Class not found: ${classId}`,
        ErrorCode.CLASS_NOT_FOUND,
        { classId, availableClasses: Array.from(context.classes.keys()) }
      );
      logClassSystemError(error);
    }
    return exists;
  });
  
  // If no valid classes, return empty properties
  if (validClassIds.length === 0) {
    return result;
  }

  for (const classId of validClassIds) {
    const styleClass = context.classes.get(classId);
    
    // This should never happen due to filtering above, but TypeScript needs it
    if (!styleClass) {
      continue;
    }

    // Merge each property from this class
    for (const [propertyKey, propertyValue] of Object.entries(styleClass.properties)) {
      const property = propertyKey as keyof ClassProperties;
      
      if (propertyValue === undefined || propertyValue === null) {
        continue;
      }

      try {
        // Handle ResponsiveSpacing (margin, padding)
        if (property === "margin" || property === "padding") {
          result[property] = mergeResponsiveSpacing(
            result[property] as ResponsiveSpacing | undefined,
            propertyValue as ResponsiveSpacing
          );
        }
        // Handle ResponsiveValue
        else if (isResponsiveValue(propertyValue)) {
          result[property] = mergeResponsiveValue(
            result[property] as ResponsiveValue<PropertyValue> | undefined,
            propertyValue as ResponsiveValue<PropertyValue>
          ) as any;
        }
        // Direct property assignment
        else {
          result[property] = propertyValue as any;
        }
      } catch (err) {
        const error = createClassSystemError(
          `Error merging property ${property} from class ${styleClass.name}`,
          ErrorCode.MERGE_ERROR,
          { classId, className: styleClass.name, property, error: err }
        );
        logClassSystemError(error);
        // Continue with other properties
      }
    }
  }

  return result;
}

/**
 * Merges classes up to (but not including) a specific index.
 * Used for computing inherited values in the class editor.
 * 
 * @param classIds - Array of class IDs
 * @param stopAtIndex - Index to stop at (exclusive)
 * @param context - Merge context
 * @returns Merged class properties up to the stop index
 */
export function mergeClassesUpTo(
  classIds: string[],
  stopAtIndex: number,
  context: MergeContext
): ClassProperties {
  const limitedClassIds = classIds.slice(0, stopAtIndex);
  return mergeClasses(limitedClassIds, context);
}

/**
 * Explains which class contributed a specific property value.
 * 
 * @param classIds - Array of class IDs
 * @param property - Property name to explain
 * @param context - Merge context
 * @returns Explanation of property contribution
 */
export function explainProperty(
  classIds: string[],
  property: keyof ClassProperties,
  context: MergeContext
): PropertyExplanation {
  let contributingClass = "";
  let finalValue: any = undefined;
  const overriddenBy: string[] = [];

  for (const classId of classIds) {
    const styleClass = context.classes.get(classId);
    if (!styleClass) continue;

    const propertyValue = styleClass.properties[property];
    if (propertyValue !== undefined && propertyValue !== null) {
      if (contributingClass) {
        overriddenBy.push(classId);
      }
      contributingClass = classId;
      finalValue = propertyValue;
    }
  }

  return {
    property,
    finalValue,
    contributingClass,
    overriddenBy,
  };
}

/**
 * Generates a debug trace of the merge process.
 * 
 * @param classIds - Array of class IDs
 * @param context - Merge context
 * @returns Array of merge steps
 */
export function getDebugTrace(
  classIds: string[],
  context: MergeContext
): MergeTrace[] {
  const traces: MergeTrace[] = [];
  let currentState: ClassProperties = {};

  classIds.forEach((classId, index) => {
    const styleClass = context.classes.get(classId);
    if (!styleClass) {
      traces.push({
        step: index + 1,
        classId,
        className: "NOT_FOUND",
        propertiesAdded: [],
        propertiesOverridden: [],
        currentState: { ...currentState },
      });
      return;
    }

    const propertiesAdded: string[] = [];
    const propertiesOverridden: string[] = [];

    for (const property of Object.keys(styleClass.properties)) {
      if (currentState[property as keyof ClassProperties] !== undefined) {
        propertiesOverridden.push(property);
      } else {
        propertiesAdded.push(property);
      }
    }

    // Merge this class into current state
    currentState = mergeClasses(classIds.slice(0, index + 1), context);

    traces.push({
      step: index + 1,
      classId,
      className: styleClass.name,
      propertiesAdded,
      propertiesOverridden,
      currentState: { ...currentState },
    });
  });

  return traces;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Type guard to check if a value is a ResponsiveValue.
 */
function isResponsiveValue(value: any): value is ResponsiveValue<any> {
  if (!value || typeof value !== "object") return false;
  
  // Check if it has VariableReference type (not a ResponsiveValue)
  if ("type" in value && value.type === "variable") return false;
  
  // Check if it has ResponsiveSpacing structure
  if ("top" in value && "right" in value && "bottom" in value && "left" in value) {
    return false;
  }
  
  // Check if it has at least one breakpoint key
  const breakpoints: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];
  return breakpoints.some((bp) => bp in value);
}

/**
 * Merges two ResponsiveValue objects at the breakpoint level.
 * Later values override earlier ones.
 */
function mergeResponsiveValue<T>(
  base: ResponsiveValue<T> | undefined,
  override: ResponsiveValue<T>
): ResponsiveValue<T> {
  const result: ResponsiveValue<T> = { ...(base || {}) };
  
  const breakpoints: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];
  
  for (const breakpoint of breakpoints) {
    if (override[breakpoint] !== undefined) {
      result[breakpoint] = override[breakpoint];
    }
  }
  
  return result;
}

/**
 * Merges two ResponsiveSpacing objects at the edge and breakpoint level.
 * Handles lock state and custom values.
 */
function mergeResponsiveSpacing(
  base: ResponsiveSpacing | undefined,
  override: ResponsiveSpacing
): ResponsiveSpacing {
  if (!base) {
    return { ...override };
  }

  const result: ResponsiveSpacing = {
    top: mergeResponsiveValue(base.top, override.top),
    right: mergeResponsiveValue(base.right, override.right),
    bottom: mergeResponsiveValue(base.bottom, override.bottom),
    left: mergeResponsiveValue(base.left, override.left),
    lock: override.lock !== undefined ? override.lock : base.lock,
  };

  // Merge custom values if present
  if (override.topCustom !== undefined || base.topCustom !== undefined) {
    result.topCustom = mergeResponsiveValue(base.topCustom, override.topCustom || {});
  }
  if (override.rightCustom !== undefined || base.rightCustom !== undefined) {
    result.rightCustom = mergeResponsiveValue(base.rightCustom, override.rightCustom || {});
  }
  if (override.bottomCustom !== undefined || base.bottomCustom !== undefined) {
    result.bottomCustom = mergeResponsiveValue(base.bottomCustom, override.bottomCustom || {});
  }
  if (override.leftCustom !== undefined || base.leftCustom !== undefined) {
    result.leftCustom = mergeResponsiveValue(base.leftCustom, override.leftCustom || {});
  }

  // Merge unit if present
  if (override.unit !== undefined || base.unit !== undefined) {
    result.unit = mergeResponsiveValue(base.unit, override.unit || {});
  }

  return result;
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Configuration for generating responsive CSS.
 */
export interface ResponsiveCSSConfig {
  property: string;
  prefix: string;
  responsiveValue?: ResponsiveValue<any>;
  resolver?: (bp: BreakpointKey) => string | undefined | null;
  formatter?: (val: any) => string;
}

/**
 * Breakpoint codes for CSS variable naming.
 */
const BREAKPOINT_CODES: Record<BreakpointKey, string> = {
  desktop: "base",
  laptop: "lg",
  tablet: "md",
  mobile: "sm",
};

/**
 * Breakpoint prefixes for utility classes.
 */
const BREAKPOINT_PREFIX: Record<BreakpointKey, string> = {
  desktop: "",
  laptop: "lg:",
  tablet: "md:",
  mobile: "sm:",
};

/**
 * Converts a camelCase property name to kebab-case for CSS.
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generates a prefix for CSS variable naming based on property name.
 */
function generatePrefix(property: string): string {
  return camelToKebab(property);
}

/**
 * Generates responsive CSS from a ResponsiveCSSConfig array.
 * Returns CSS custom properties and utility class names.
 */
export function getResponsiveCSS(configs: ResponsiveCSSConfig[]): {
  style: Record<string, string>;
  className: string;
} {
  const style: Record<string, string> = {};
  const classes: string[] = [];

  const breakpoints: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];

  configs.forEach(({ property, prefix, responsiveValue, resolver, formatter }) => {
    breakpoints.forEach((bp) => {
      let val;
      if (resolver) {
        val = resolver(bp);
      } else if (responsiveValue) {
        val = responsiveValue[bp];
      }

      if (val !== undefined && val !== null && val !== "") {
        const finalValue = formatter ? formatter(val) : val;
        const varName = `--${prefix}-${BREAKPOINT_CODES[bp]}`;

        style[varName] = String(finalValue);

        const mqPrefix = BREAKPOINT_PREFIX[bp];
        classes.push(`${mqPrefix}[${property}:var(${varName})]`);
      }
    });
  });

  return { style, className: classes.join(" ") };
}

/**
 * Converts merged ClassProperties to ComputedStyles with CSS variables and class names.
 * Resolves variable references to their concrete values.
 * 
 * @param merged - Merged class properties
 * @param context - Merge context with value resolver
 * @returns Computed styles with CSS variables and class names
 */
export function convertToComputedStyles(
  merged: ClassProperties,
  context: MergeContext
): ComputedStyles {
  const configs: ResponsiveCSSConfig[] = [];

  try {
    // Process each property in the merged result
    for (const [propertyKey, propertyValue] of Object.entries(merged)) {
      const property = propertyKey as keyof ClassProperties;

      if (propertyValue === undefined || propertyValue === null) {
        continue;
      }

      try {
        // Handle ResponsiveSpacing (margin, padding)
        if (property === "margin" || property === "padding") {
          const spacing = propertyValue as ResponsiveSpacing;
          
          // Generate configs for each edge
          ["top", "right", "bottom", "left"].forEach((edge) => {
            const edgeValue = spacing[edge as keyof typeof spacing] as ResponsiveValue<PropertyValue>;
            if (!edgeValue) return;

            const resolvedValue: ResponsiveValue<string> = {};
            const breakpoints: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];
            
            for (const bp of breakpoints) {
              const val = edgeValue[bp];
              if (val !== undefined) {
                try {
                  resolvedValue[bp] = context.resolveValue(val);
                } catch (err) {
                  // Log error but use fallback value
                  const error = createClassSystemError(
                    `Failed to resolve variable reference for ${property}-${edge} at ${bp}`,
                    ErrorCode.VARIABLE_NOT_FOUND,
                    { property, edge, breakpoint: bp, value: val, error: err }
                  );
                  logClassSystemError(error);
                  // Use empty string as fallback
                  resolvedValue[bp] = "";
                }
              }
            }

            configs.push({
              property: `${camelToKebab(property)}-${edge}`,
              prefix: `${property}-${edge}`,
              responsiveValue: resolvedValue,
            });
          });
        }
        // Handle ResponsiveValue
        else if (isResponsiveValue(propertyValue)) {
          const responsiveValue = propertyValue as ResponsiveValue<PropertyValue>;
          const resolvedValue: ResponsiveValue<string> = {};
          const breakpoints: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];
          
          for (const bp of breakpoints) {
            const val = responsiveValue[bp];
            if (val !== undefined) {
              try {
                resolvedValue[bp] = context.resolveValue(val);
              } catch (err) {
                // Log error but use fallback value
                const error = createClassSystemError(
                  `Failed to resolve variable reference for ${property} at ${bp}`,
                  ErrorCode.VARIABLE_NOT_FOUND,
                  { property, breakpoint: bp, value: val, error: err }
                );
                logClassSystemError(error);
                // Use empty string as fallback
                resolvedValue[bp] = "";
              }
            }
          }

          configs.push({
            property: camelToKebab(property),
            prefix: generatePrefix(property),
            responsiveValue: resolvedValue,
          });
        }
        // Direct property value (non-responsive)
        else {
          try {
            const resolvedValue = context.resolveValue(propertyValue as PropertyValue);
            
            // Create a desktop-only responsive value
            configs.push({
              property: camelToKebab(property),
              prefix: generatePrefix(property),
              responsiveValue: { desktop: resolvedValue },
            });
          } catch (err) {
            // Log error but continue with other properties
            const error = createClassSystemError(
              `Failed to resolve variable reference for ${property}`,
              ErrorCode.VARIABLE_NOT_FOUND,
              { property, value: propertyValue, error: err }
            );
            logClassSystemError(error);
          }
        }
      } catch (err) {
        // Log error for this property but continue with others
        const error = createClassSystemError(
          `Error processing property ${property}`,
          ErrorCode.MERGE_ERROR,
          { property, value: propertyValue, error: err }
        );
        logClassSystemError(error);
      }
    }

    const { style, className } = getResponsiveCSS(configs);

    return {
      properties: merged,
      cssVariables: style,
      classNames: className ? className.split(" ") : [],
    };
  } catch (err) {
    // Critical error - return empty computed styles
    const error = createClassSystemError(
      "Critical error converting to computed styles",
      ErrorCode.MERGE_ERROR,
      { merged, error: err }
    );
    logClassSystemError(error);
    
    return {
      properties: {},
      cssVariables: {},
      classNames: [],
    };
  }
}
