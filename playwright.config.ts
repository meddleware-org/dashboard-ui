import { definePlaywrightConfig } from '@meddleware/frontend-config/playwright'

// Browser tests of the BUILT dashboard (`vite preview` of dist): every route and every embedded tool mounts, on the sidebar drawer too
// (phone viewports). Chromium locally, all five browser projects in CI (E2E_BROWSERS=all). Every request that leaves localhost is refused
// in the specs, so runs need no network. The e2e build (`--mode e2e`) registers a mock wallet and a stub chain, so the tools are also
// checked connected.
export default definePlaywrightConfig({ port: 4293, command: 'npm run build:e2e && npx vite preview --port 4293 --strictPort' })
