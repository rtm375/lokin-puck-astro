/**
 * Validation functions for the class system
 * Validates class names, property values, and class properties
 */

import type { ClassProperties, ClassType } from '@/stores/useClassRegistryStore';
import type { PropertyValue, VariableReference } from '@/stores/useVariableStore';
import { ErrorCode, createClassSystemError } from './errors';

// Class name validation regex: alphanumeric, hyphens, underscores, must start with letter
const CLASS_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

/**
 * Validates a class name
 * @param name - Class name to validate
 * @returns True if valid, false otherwise
 */
export function validateClassName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  if (name.length < 1 || name.length > 100) {
    return false;
  }
  
  return CLASS_NAME_REGEX.test(name);
}

/**
 * Gets validation error message for invalid class name
 * @param name - Class name that failed validation
 * @returns Error message
 */
export function getClassNameError(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'Class name is required';
  }
  
  if (name.length < 1) {
    return 'Class name cannot be empty';
  }
  
  if (name.length > 100) {
    return 'Class name must be 100 characters or less';
  }
  
  if (!CLASS_NAME_REGEX.test(name)) {
    return 'Class name must start with a letter and contain only letters, numbers, hyphens, and underscores';
  }
  
  return 'Invalid class name';
}

/**
 * Checks if a value is a variable reference
 * @param value - Value to check
 * @returns True if value is a variable reference
 */
export function isVariableReference(value: any): value is VariableReference {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.type === 'variable' &&
    typeof value.variableId === 'string'
  );
}

/**
 * Validates a property value based on property type
 * @param property - Property name
 * @param value - Value to validate
 * @returns True if valid, false otherwise
 */
export function validatePropertyValue(property: string, value: PropertyValue): boolean {
  // Allow variable references
  if (isVariableReference(value)) {
    return typeof value.variableId === 'string' && value.variableId.length > 0;
  }
  
  // Allow undefined (property not set)
  if (value === undefined || value === null) {
    return true;
  }
  
  // Validate based on property type
  switch (property) {
    // Flex direction
    case 'flexDirection':
      return ['row', 'row-reverse', 'column', 'column-reverse'].includes(value as string);
    
    // Justify content
    case 'justifyContent':
      return [
        'flex-start', 'flex-end', 'center', 'space-between', 
        'space-around', 'space-evenly'
      ].includes(value as string);
    
    // Align items
    case 'alignItems':
    case 'alignContent':
    case 'justifyItems':
      return [
        'flex-start', 'flex-end', 'center', 'stretch', 
        'baseline', 'start', 'end'
      ].includes(value as string);
    
    // Flex wrap
    case 'flexWrap':
      return ['nowrap', 'wrap', 'wrap-reverse'].includes(value as string);
    
    // Dimensions (width, height, gap, etc.)
    case 'width':
    case 'minWidth':
    case 'maxWidth':
    case 'height':
    case 'minHeight':
    case 'maxHeight':
    case 'gap':
    case 'rowGap':
    case 'columnGap':
    case 'gridGap':
    case 'gridRowGap':
    case 'gridColumnGap':
      return typeof value === 'string' && /^(\d+(\.\d+)?(px|%|rem|em|vh|vw|auto)|auto)$/.test(value);
    
    // Grid template
    case 'gridTemplateColumns':
    case 'gridTemplateRows':
      return typeof value === 'string' && value.length > 0;
    
    // Colors
    case 'backgroundColor':
    case 'borderColor':
      return typeof value === 'string' && (
        /^#[0-9A-Fa-f]{3,8}$/.test(value) || // hex
        /^rgb\(/.test(value) || // rgb
        /^rgba\(/.test(value) || // rgba
        /^hsl\(/.test(value) || // hsl
        /^hsla\(/.test(value) || // hsla
        value === 'transparent' ||
        value === 'currentColor'
      );
    
    // Border radius
    case 'borderRadius':
      return typeof value === 'string' && /^(\d+(\.\d+)?(px|%|rem|em))$/.test(value);
    
    // Border width
    case 'borderWidth':
      return typeof value === 'string' && /^(\d+(\.\d+)?(px))$/.test(value);
    
    default:
      // For unknown properties, accept strings and numbers
      return typeof value === 'string' || typeof value === 'number';
  }
}

/**
 * Gets validation error message for invalid property value
 * @param property - Property name
 * @param value - Value that failed validation
 * @returns Error message
 */
export function getPropertyValueError(property: string, value: PropertyValue): string {
  if (isVariableReference(value)) {
    return 'Invalid variable reference';
  }
  
  switch (property) {
    case 'flexDirection':
      return 'Must be one of: row, row-reverse, column, column-reverse';
    case 'justifyContent':
      return 'Must be one of: flex-start, flex-end, center, space-between, space-around, space-evenly';
    case 'alignItems':
    case 'alignContent':
    case 'justifyItems':
      return 'Must be one of: flex-start, flex-end, center, stretch, baseline, start, end';
    case 'flexWrap':
      return 'Must be one of: nowrap, wrap, wrap-reverse';
    case 'width':
    case 'height':
    case 'gap':
      return 'Must be a valid CSS dimension (e.g., 100px, 50%, 2rem, auto)';
    case 'backgroundColor':
    case 'borderColor':
      return 'Must be a valid CSS color (hex, rgb, rgba, hsl, hsla, transparent, currentColor)';
    case 'borderRadius':
      return 'Must be a valid CSS dimension (e.g., 4px, 0.5rem, 50%)';
    case 'borderWidth':
      return 'Must be a valid CSS dimension in pixels (e.g., 1px, 2px)';
    default:
      return 'Invalid property value';
  }
}

/**
 * Validates class properties based on class type
 * @param properties - Properties to validate
 * @param type - Class type
 * @returns Validation result with errors
 */
export function validateClassProperties(
  properties: ClassProperties,
  type: ClassType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Layout classes must have at least one layout property
  if (type === 'layout') {
    const hasFlexProps = !!(
      properties.flexDirection ||
      properties.justifyContent ||
      properties.alignItems ||
      properties.flexWrap ||
      properties.gap
    );
    
    const hasGridProps = !!(
      properties.gridTemplateColumns ||
      properties.gridTemplateRows ||
      properties.gridGap ||
      properties.justifyItems
    );
    
    if (!hasFlexProps && !hasGridProps) {
      errors.push('Layout classes must define at least one layout property');
    }
  }
  
  // Validate each property value
  for (const [property, value] of Object.entries(properties)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    // Handle responsive values
    if (typeof value === 'object' && !isVariableReference(value) && 'desktop' in value) {
      for (const [breakpoint, breakpointValue] of Object.entries(value)) {
        if (breakpointValue !== undefined && !validatePropertyValue(property, breakpointValue)) {
          errors.push(`Invalid value for ${property} at ${breakpoint}: ${getPropertyValueError(property, breakpointValue)}`);
        }
      }
    }
    // Handle spacing objects
    else if (typeof value === 'object' && !isVariableReference(value) && 'top' in value) {
      // Spacing validation handled separately
      continue;
    }
    // Handle direct values
    else if (!validatePropertyValue(property, value)) {
      errors.push(`Invalid value for ${property}: ${getPropertyValueError(property, value)}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Throws a validation error if class name is invalid
 * @param name - Class name to validate
 * @throws ClassSystemError if invalid
 */
export function assertValidClassName(name: string): void {
  if (!validateClassName(name)) {
    throw createClassSystemError(
      getClassNameError(name),
      ErrorCode.INVALID_CLASS_NAME,
      { name }
    );
  }
}

/**
 * Throws a validation error if property value is invalid
 * @param property - Property name
 * @param value - Value to validate
 * @throws ClassSystemError if invalid
 */
export function assertValidPropertyValue(property: string, value: PropertyValue): void {
  if (!validatePropertyValue(property, value)) {
    throw createClassSystemError(
      getPropertyValueError(property, value),
      ErrorCode.INVALID_PROPERTY_VALUE,
      { property, value }
    );
  }
}
