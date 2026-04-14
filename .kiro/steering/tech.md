# Tech Stack

## Frontend Framework

- **Astro 6.x**: SSR-enabled with Cloudflare adapter
- **React 19.x**: Client-side interactivity and components
- **TypeScript**: Strict mode enabled throughout

## Styling

- **TailwindCSS**: Atomic CSS with Wind4 preset (Tailwind v4 compatible)
- Primary color: `#f3602a`
- Scoped to `src/components/client/**/*.{tsx,ts}`

## State Management

- **Zustand**: Global state stores in `src/stores/`
- Store naming: `use[Feature]Store.ts` (e.g., `useWebsitesStore.ts`)

## Key Libraries

- **@puckeditor/core**: Visual page builder editor
- **@supabase/supabase-js**: Authentication and database
- **@aws-sdk/client-s3**: R2 storage integration
- **react-router-dom**: Client-side routing
- **react-i18next**: Internationalization
- **date-fns**: Date formatting
- **jose**: JWT handling
- **zod**: Schema validation

## Backend & Infrastructure

- **Cloudflare Workers**: Edge compute and routing
- **Cloudflare R2**: Object storage for static assets
- **Cloudflare KV**: Edge key-value store for routing metadata
- **Supabase**: PostgreSQL database and auth

## Development Tools

- **pnpm**: Package manager (enforced)
- **Prettier**: Code formatting with Tailwind plugin
- **Wrangler**: Cloudflare Workers CLI

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (Astro)
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm db               # Run Supabase CLI (via pnpx)

# Cloudflare
pnpm generate-types   # Generate Wrangler types for Workers

# Code Quality
# (No linting configured yet - consider adding ESLint)
```

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@assets/*` → `./src/assets/*`
- `@components/*` → `./src/components/*`
- `@layouts/*` → `./src/layouts/*`
- `@lib/*` → `./src/lib/*`
- `@stores/*` → `./src/stores/*`
- `@utils` → `./src/utils/index`
- `@blockTypes` → Block type definitions

## Build Configuration

- **Output**: Server-side rendering (SSR)
- **Adapter**: Cloudflare Workers
- **Chunk size limit**: 1000kb
- **Dev server**: Binds to `0.0.0.0` for network access
