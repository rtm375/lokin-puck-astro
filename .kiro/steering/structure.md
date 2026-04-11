# Project Structure

## Root Organization

```
/
├── src/                    # Application source code
├── public/                 # Static assets served as-is
├── dist/                   # Production build output
├── .astro/                 # Astro generated files
├── .wrangler/              # Cloudflare Workers local state
├── .kiro/                  # Kiro AI assistant configuration
└── node_modules/           # Dependencies (pnpm)
```

## Source Directory (`src/`)

### Components (`src/components/`)

- **Astro components**: Root level (`.astro` files)
  - `Header.astro`, `Sidebar.astro`, `UserMenu.astro`
- **React components**: `src/components/client/` (`.tsx` files)
  - `auth/` - Login, Register components
  - `website/` - Website management UI
  - `website/pages/` - Page editor components
  - `website/pages/blocks/` - Puck editor block definitions
    - Each block in its own folder (e.g., `Hero/`, `Flex/`, `Text/`)
    - `index.ts` - Block registry
    - `types.ts` - Shared block types
    - `shared/` - Reusable block utilities
  - `website/pages/components/` - Editor UI components
  - `website/pages/config/` - Editor configuration
  - `website/pages/overrides/` - Puck editor customizations

### Layouts (`src/layouts/`)

- `layout.astro` - Base layout
- `auth.astro` - Authentication pages layout
- `dashboard.astro` - Dashboard layout

### Pages (`src/pages/`)

- Astro file-based routing
- `admin/` - Admin panel routes
- `api/` - API endpoints
- `sites/` - Site-specific routes
- Root pages: `index.astro`, `login.astro`, `register.astro`

### State Management (`src/stores/`)

- Zustand stores for global state
- Naming: `use[Feature]Store.ts`
- Examples: `useWebsitesStore.ts`, `usePagesStore.ts`, `useProfileStore.ts`

### Library Code (`src/lib/`)

- `client/` - Client-side utilities and API wrappers
- `server/` - Server-side utilities
- `i18n/` - Internationalization configuration
- `puck.config.tsx` - Puck editor configuration
- `script-registry.ts` - Script management

### Utilities (`src/utils/`)

- Pure utility functions
- `index.ts` - Main exports
- Individual files: `slugify.ts`, `formatters.ts`, `fetchHelpers.ts`, etc.

### Types (`src/types/`)

- Shared TypeScript type definitions
- `index.ts` - Type exports

### Assets (`src/assets/`)

- `css/` - Global styles
- `images/` - Image assets
- SVG files at root level

### Other

- `providers/` - React context providers (e.g., `LanguageProvider.tsx`)
- `middleware.ts` - Astro middleware
- `env.d.ts` - Environment type definitions

## Public Directory (`public/`)

Static files served directly:
- `js/` - Client-side scripts
  - `blocks/` - Block-specific scripts (e.g., slider initialization)
- `favicon.svg`, `logo-light.svg` - Brand assets

## Naming Conventions

- **Astro components**: PascalCase with `.astro` extension
- **React components**: PascalCase with `.tsx` extension
- **Stores**: `use[Feature]Store.ts` pattern
- **Utilities**: camelCase with `.ts` extension
- **Types**: PascalCase for interfaces/types
- **Folders**: kebab-case or camelCase

## File Organization Principles

- **Colocation**: Related files grouped together (e.g., blocks in folders)
- **Separation**: Astro vs React components clearly separated
- **Feature-based**: Stores and components organized by feature
- **Reusability**: Shared utilities in dedicated directories
- **Type safety**: Types defined in dedicated `types/` directory

## Import Patterns

Use path aliases for cleaner imports:
```typescript
import { Component } from '@components/client/Component'
import { useStore } from '@stores/useStore'
import { helper } from '@utils'
import type { BlockType } from '@blockTypes'
```

## Component Export Pattern

- One component per file
- Default export for components
- Named exports for utilities and types
