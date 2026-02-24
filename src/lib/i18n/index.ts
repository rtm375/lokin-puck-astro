/**
 * i18n (Internationalization) utilities
 * Handles language switching and translation for both client and server
 *
 * Usage:
 *   // Server-side (Astro middleware)
 *   import { initI18n } from '@/lib/i18n';
 *   const t = await initI18n('en');
 *
 *   // Client-side (React components)
 *   import '@/lib/i18n/react';  // Initialize React i18n
 *   import { useTranslation } from 'react-i18next';
 */

// Server-side i18n initialization
export { initI18n } from "./client";

// React component for language management
export { LanguageProvider } from "../../providers/LanguageProvider";

// Note: For React components, import the react.ts file directly:
// import '@/lib/i18n/react';
