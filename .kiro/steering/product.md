# Product Overview

Lokin is a SaaS page builder platform that enables users to design and publish websites with visual editing capabilities. Users can publish sites to platform subdomains (e.g., `store.lokin.id`) or custom domains.

## Core Features

- Visual page builder using Puck Editor for drag-and-drop site creation
- Multi-site management dashboard
- Static site generation and publishing
- Subdomain and custom domain support
- User authentication and multi-tenancy
- Asset management and file uploads

## Architecture

- **Builder Dashboard**: Astro + React application for site design and management
- **Edge Renderer**: Cloudflare Worker serving static content from R2 storage
- **Authentication**: Supabase for user management
- **Storage**: Cloudflare R2 for static assets, KV for routing metadata
- **Deployment**: Cloudflare Workers for both dashboard and edge rendering

## Publishing Flow

1. Users design sites in the visual editor
2. Builder generates static HTML/CSS/JS
3. Assets uploaded to R2 storage (`sites/{siteId}/`)
4. Routing records synced to Cloudflare KV
5. Edge worker serves content based on hostname resolution
