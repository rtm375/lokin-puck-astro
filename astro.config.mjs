// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import UnoCSS from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  server: {
    host: "0.0.0.0",
    allowedHosts: true
  },
  integrations: [
    react(),
    UnoCSS({
      injectEntry: false // Manual import required for SaaS pages
    })
  ]
});