/**
 * Server-side utilities (Astro/Node server-only)
 * Usage: import { apiHandler, APIError, s3Client } from '@/lib/server'
 *
 * IMPORTANT: Some modules are commented out to prevent bundling issues.
 * Import them directly when needed: import { s3Client } from '@/lib/server/s3'
 */

// API handler and error handling forAstro API routes
export { apiHandler, APIError } from "./api";

// Validators for API routes
export { requireWebsite, requirePage, requireAuth } from "./api";

// Cache utilities
export { LRUCache } from "./cache";
export { pageCache } from "./page-cache";

// Cloudflare utilities (safe - no top-level instantiation)
export { syncToKV } from "./cloudflare";

// CSS Engine is intentionally NOT exported here.
// UnoCSS uses @oxc-parser native bindings incompatible with the CF Workers
// runtime (workerd). Import css-engine.ts directly only from build-time scripts.

// Permissions & roles
export { getWebsiteRole, requireWebsiteRole } from "./permissions";
export type { WebsiteRole } from "./permissions";

// Database error handler
export { handleSupabaseError } from "./db";
