/**
 * Barrel export for all utility functions
 * This file provides a single entry point for importing utilities
 * Usage: import { slugify, browserLang, formatBytes } from '@/utils'
 */

// Browser utilities
export { browserLang } from "./browserLang";

// Fetch helpers
export { shouldFetch, fetchData } from "./fetchHelpers";

// Formatters
export { formatBytes, formatSlug, truncate } from "./formatters";

// Custom hooks
export { useSelection, useFileUpload } from "./hooks";

// Navigation utilities
export { isActive } from "./isActive";

// String utilities
export { slugify } from "./slugify";
