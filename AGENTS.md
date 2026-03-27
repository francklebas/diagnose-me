# Decisional Client - Agent Instructions

This is a **Nuxt 4 full-stack web application** integrated with Supabase for authentication and backend services.

## Project Overview

- **Framework**: Nuxt 4 (Vue 3 with SSR/hydration)
- **Package Manager**: Bun (uses `bun install`, `bun run`)
- **Backend**: Supabase for auth, PostgreSQL database, and Realtime features
- **Hosting**: Cloudflare Pages (via Nitro `cloudflare-pages` preset)
- **UI Framework**: Reka UI components + TailwindCSS + Lucide icons
- **Styling**: TailwindCSS 6.14.0
- **i18n**: Nuxt i18n for internationalization support
- **Type Safety**: Full TypeScript with Nuxt auto-config

## Essential Architecture

### Core Application Structure

```
app/
├── pages/          # File-based routing (Nuxt auto-generates routes)
│   ├── index.vue   # Home page (/)
│   └── admin.vue   # Admin page (/admin)
```

**Key Pattern**: Use Vue Single File Components (`.vue`) with `<template>`, `<script>`, `<style>` blocks. Pages automatically become routes.

### Configuration Files

- **nuxt.config.ts**: Entry point for all Nuxt/module configuration. Includes Supabase redirect options (`/login`, `/confirm` endpoints).
- **tsconfig.json**: References auto-generated `.nuxt/` config files (don't manually edit).
- **eslint.config.mjs**: Extends `.nuxt/eslint.config.mjs` (Nuxt-managed).

## Development Workflows

### Starting Development

```bash
# Install dependencies (required before first run)
bun install

# Start dev server on http://localhost:3000
bun run dev

# Dev server includes HMR (hot module replacement) and auto-reload
```

### Building for Production

```bash
# Build optimized bundle for Cloudflare Pages
bun run build

# Locally preview production bundle
bun run preview

# Generate static site (if needed)
bun run generate
```

### Code Quality

- **Linting**: `@nuxt/eslint` integrated (uses eslint.config.mjs)
- **Formatting**: Prettier (config: .prettierrc, ignored files: .prettierignore)
- **Type Checking**: Automatic via `.nuxt/tsconfig.*.json` files

## Integration Points

### Supabase Integration (@nuxtjs/supabase v2.0.4)

**Configuration** (in nuxt.config.ts):
```typescript
supabase: {
  redirect: false,
  redirectOptions: {
    login: "/login",      // Redirect unauthenticated users here
    callback: "/confirm"  // Callback after auth provider (OAuth)
  },
}
```

**Environment Variables** (.env file):
```
SUPABASE_URL=http://127.0.0.1:54321              # Your Supabase instance URL
SUPABASE_KEY=...                                  # Service role key
SUPABASE_ANON_KEY=...                             # Public anon key (for browsers)
SUPABASE_PUBLISHABLE_KEY=...                      # Alternative publishable key
```

**Important**: Pages requiring auth should redirect to `/login` if unauthenticated. Create `/login` and `/confirm` pages for auth flows.

### Cloudflare Pages Deployment

- **Preset**: `cloudflare-pages` in Nitro config
- **Node.js Compatibility**: Enabled via `compatibilityFlags: ["nodejs_compat"]`
- **Excluded Routes**: None by default (all routes public)
- Uses Cloudflare Workers for serverless functions

## Module Ecosystem

Key installed modules (in nuxt.config.ts modules array):

| Module | Purpose | Usage |
|--------|---------|-------|
| `@nuxt/devtools` | Browser devtools for debugging | Auto-enabled |
| `@nuxt/eslint` | Integrated linting | Extends config in eslint.config.mjs |
| `@nuxt/fonts` | Google/custom fonts | Configure in nuxt.config.ts |
| `@nuxt/image` | Image optimization | Use `<NuxtImg>` components |
| `@nuxtjs/tailwindcss` | Tailwind styling | Configure tailwind.config.js if needed |
| `@nuxtjs/i18n` | Internationalization | Add locale files in i18n config |
| `@nuxtjs/supabase` | Supabase client/auth | Use `$supabase` composable |
| `@nuxtjs/turnstile` | Cloudflare CAPTCHA | `<NuxtTurnstile>` component |
| `@pinia/nuxt` | State management | Create stores in `app/stores/` |
| `reka-ui` | Headless UI components | Import from `reka-ui` |
| `nuxt-lucide-icons` | Icon library | Use `<Icon name="icon-name" />` |

## Project-Specific Patterns

### Composables and Utilities
- Create composables in `app/composables/` (auto-imported)
- Create utils in `app/utils/` (auto-imported)
- Name composables with `use` prefix (e.g., `useAuth.ts`)

### State Management with Pinia
Create stores in `app/stores/` with `.ts` extension:
```typescript
export const useMyStore = defineStore('my-store', () => {
  const state = ref(0)
  return { state }
})
```

### Layouts
Create layouts in `app/layouts/` (auto-applied via `<NuxtLayout>` or route meta).

## Critical Developer Notes

1. **TypeScript is Strict**: Nuxt auto-generates type definitions in `.nuxt/`. Don't commit `.nuxt/` folder.
2. **No Manual Server Config**: Use Nitro server directory (auto-detected) for API routes.
3. **Supabase Local Dev**: Using local Supabase instance (port 54321) for development.
4. **Turnstile CAPTCHA**: If implementing forms, use `@nuxtjs/turnstile` for Cloudflare CAPTCHA protection.
5. **Multi-language Support**: i18n module enabled—create locale files and update nuxt.config.ts for `i18n` options.
6. **Compatibility Date**: Set to 2025-07-15 (Nuxt version lock for stability).

## Common Tasks

| Task | Approach |
|------|----------|
| Add a new page | Create `.vue` file in `app/pages/` |
| Add authentication | Setup `/login` and `/confirm` pages, use `$supabase` composable |
| Style with Tailwind | Use class names directly in templates (e.g., `class="text-lg"`) |
| Add database queries | Use Supabase client: `const { data } = await $supabase.from('table').select()` |
| Deploy to Cloudflare | Push to repo, Cloudflare Pages CI/CD handles build |
| Add global state | Create store in `app/stores/`, use composable import |

## References

- [Nuxt Documentation](https://nuxt.com/)
- [Supabase + Nuxt](https://supabase.com/docs/guides/getting-started/quickstarts/nuxt)
- [Cloudflare Pages with Nuxt](https://developers.cloudflare.com/pages/framework-guides/nuxt)
- [TailwindCSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)

