# Lokin Page Builder SaaS Architecture

## 1. High-Level Architecture

Lokin is a SaaS page builder enabling users to design and publish websites to platform subdomains (e.g., `store.lokin.id`) or custom domains (e.g., `example.com`).

### Components

- **Builder (Dashboard)**: ./astro-app = Astro + React application for designing sites.
- **Edge Renderer (Router)**: ./user-sites-router = Cloudflare Worker that serves static content from R2.

## 2. Tech Stack

- **Frontend/Builder**: Astro + React + Puck Editor
- **Backend/Auth**: Supabase
- **Storage**: Cloudflare R2
- **Edge Logic**: Cloudflare Workers
- **Edge Database**: Cloudflare KV
- **Hosting**: Cloudflare Workers for both

## 3. Data Flow & Publishing Pipeline

### A. Site Creation

- Users log in via Supabase Auth.
- Sites are built via Astro/React with puck editor editor.

### B. Publishing

- Builder generates static HTML/CSS/JS.
- Assets uploaded to `sites/{siteId}/` in R2.
- Routing records synced to KV:

  - Subdomain: `myshop -> siteId`
  - Custom domain: `shop.com -> siteId`

### C. Serving

- Request hits Cloudflare Worker.
- Worker resolves hostname (via `X-Forwarded-Host`).
- Looks up siteId in KV.
- Fetches from R2 (`sites/{siteId}/index.html`).
- Returns content to visitor.

## 4. Routing Logic

- **Platform Domain**: `lokin.id`
- **Worker Origin**: `sites.lokin.id`

### Resolution Priority

1. Check `X-Forwarded-Host` for original domain.
2. KV Lookup:

   - Exact hostname match.
   - Subdomain match: strip `.lokin.id` → slug → KV.

## 5. Storage Schema

### R2 Bucket Structure

```
sites/
  ├── {siteId}/
  │   ├── robots.txt
  │   ├── index.html
  │   ├── 404.html
  │   ├── assets/
  │   │   ├── images/
  │   │   ├── css/
  │   │   │   ├── style.css
  │   │   ├── js/
  │   │   │   └── script.js
```

### KV Namespace Structure

- **Slug Key**: `myshop -> siteId`
- **Custom Key**: `example.com -> siteId`

## 6. Supabase Integration

- Supabase is the source of truth.
- Cloudflare KV is an edge-optimized replica.
- Domain changes in Supabase must sync immediately to KV.
