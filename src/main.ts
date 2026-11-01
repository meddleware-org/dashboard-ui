import { createApp } from 'vue'

// Shared design system: tokens first (defines CSS vars), then the element defaults and utilities (components bring their own CSS).
import '@meddleware/design-tokens/tokens.css'
import '@meddleware/design-tokens/seasons.css'
import '@meddleware/ui/reset.css'

import { loadRuntimeConfig, useSeason } from '@meddleware/ui'

// The colour mode (dark by default, then the saved choice) is applied before the first paint by the theme-init script `index.html` loads.
useSeason()

// Machine-zone endpoints (the indexer, the Walrus relays) may come from /runtime-config.json (ADR-0005). The embedded tools read them when
// their modules load, so the app and the router are imported only afterwards.
void loadRuntimeConfig().then(async () => {
  // End-to-end builds only: a mock wallet and a stub chain (`src/e2e.ts`). Both conditions are static, so no other build contains it.
  if (import.meta.env.MODE === 'e2e' && import.meta.env.VITE_E2E === '1') (await import('./e2e.js')).installE2e()
  const [{ default: App }, { default: router }] = await Promise.all([import('./App.vue'), import('./router')])
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
