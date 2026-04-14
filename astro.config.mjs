// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  security: {
    checkOrigin: false
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true
  },
  integrations: [
    react()
  ],
  adapter: cloudflare(),
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
    plugins: [tailwindcss()]
  },
});