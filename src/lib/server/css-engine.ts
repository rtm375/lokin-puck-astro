/**
 * CSS Engine — UnoCSS-based utility class extractor.
 *
 * IMPORTANT: This module uses @oxc-parser native bindings and can ONLY run in
 * Node.js (Astro SSR / API routes). It must NEVER be imported in code paths
 * that execute inside the Cloudflare Workers runtime (workerd).
 *
 * ✅ Safe to call from: src/pages/api/** (API routes run Node-side)
 * ❌ Do NOT call from:  src/pages/sites/[...path].astro (runs in workerd)
 */

import { createGenerator, presetWind4 } from "unocss";
import tailwindReset from "@unocss/reset/tailwind-v4.css?inline";

// Initialize once — reused across requests within the same Node.js process
const generator = createGenerator({
  presets: [presetWind4()],
  preflights: [
    {
      getCSS: () => tailwindReset,
    },
  ],
});

/**
 * Scans HTML for UnoCSS utility classes and returns the generated CSS string.
 * Pre-generates CSS at save time so the CF Worker just reads a stored string.
 */
export async function generateCss(html: string): Promise<string> {
  const gen = await generator;
  const { css } = await gen.generate(html);
  return css;
}
