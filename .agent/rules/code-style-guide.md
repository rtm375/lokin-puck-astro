---
trigger: always_on
---

---

# Rules for This Project

## Overall

- Keep code simple, modular, and readable.
- Avoid overengineering.
- Avoid expensive supabase db call
- DRY: don't repeat code.
- Maintain global types for shared models.
- Proper t() i18n for string

---

## SAAS (`/astro-app`)

- Astro + React + TypeScript hybrid.
- Use functional components + hooks.
- Uno css
- Use a state manager Zustand
- Use Zod for all schema validations.
- All astro components inside /astro-app/src/components
- All react code inside /astro-app/src/components/client
- Keep reusable logic in custom hooks.
- Keep strict typing everywhere.

---

## User Websites (`/user-sites-router`)

- Cloudflare Workers environment.
- Use TypeScript everywhere.
- Keep global types shared with frontend.
- Maintain modules: `routes/`, `services/`, `utils/`, `types/`, `schemas/`.
- Keep handlers small and focused.

---

## Architecture

- Worker 1: SPA serving.
- Worker 2: API.
- Enforce consistent error format via Zod and typed responses.
- Reuse schemas across FE/BE when possible.
