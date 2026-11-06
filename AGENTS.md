# AGENTS.md — @meddleware/dashboard-ui

See [CLAUDE.md](CLAUDE.md) for architecture and scope constraints.

## Quick commands

```bash
npm install          # install deps (every @meddleware/* range in package.json must be published on npmjs, or npm link / a local pack)
npm run dev          # dev server at http://localhost:5173
npm run type-check   # TypeScript check only
npm test             # unit tests (vitest)
npm run test:e2e     # browser smoke test of the built app (Playwright)
npm run build        # type-check + vite build → dist/
```

## Adding a feature page

1. Create `src/views/MyFeaturePage.vue` with Overview / Launch / White-label sections.
2. Add a route in `src/router/index.ts`.
3. Add a `SidebarItem` in `src/App.vue`.
4. Keep the page thin — no chain calls, no wallet, no financial logic.
