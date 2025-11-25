---
trigger: always_on
---

# Repository Guidelines

## Project Structure & Module Organization

- App root: `index.html`, `vite.config.js`, `eslint.config.js`, `package.json`, `pnpm-workspace.yaml`.
- Source code: `src/`
  - Components: `src/components/*` (PascalCase files, default export per file)
  - State: `src/store/*` (Zustand stores)
  - Utilities: `src/utils/*`
  - Data & assets: `src/data/*`, `src/assets/*`
  - Styles: `src/index.css` (Tailwind v4 via `@tailwindcss/vite`)
- Static assets served from `public/`.

## Build, Test, and Development Commands

- Install (pnpm is enforced): `pnpm install`
- Dev server (port 9000): `pnpm dev`
- Type‑check: n/a (no TS yet)
- Lint (ESLint): `pnpm lint`
- Production build: `pnpm build` → outputs to `dist/`
- Preview local build: `pnpm preview`

## Coding Style & Naming Conventions

- Language: ESM JavaScript + React (JSX). Indent 2 spaces; keep semicolons.
- Filenames: components `PascalCase.jsx` (e.g., `TimelineGrid.jsx`); utilities `camelCase.js`.
- Exports: default export one component per file.
- React: prefer functional components and hooks; keep side effects in `useEffect`.
- Tailwind: prefer utility classes over inline styles; extend in `src/index.css` only when needed.
- Linting: ESLint is configured with `@eslint/js`, React Hooks, and React Refresh. Fix all `error` rules before committing.

## Testing Guidelines

- No test runner is configured yet. If adding tests, use Vitest + React Testing Library.
  - File names: colocate as `*.test.jsx` near source (e.g., `src/components/Button.test.jsx`).
  - Add scripts: `"test": "vitest", "test:watch": "vitest --watch"`.

## Security & Configuration Tips

- Never commit secrets. Use `.env.local` with Vite‑prefixed variables (`VITE_API_URL=...`).
- Node 18+ recommended. Use `pnpm` (enforced by `preinstall`).
