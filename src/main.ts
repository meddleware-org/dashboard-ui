import { createApp } from 'vue'

// Shared design system: tokens first (defines CSS vars), then base element defaults.
import '@meddleware/design-tokens/tokens.css'
import '@meddleware/design-tokens/seasons.css'
import '@meddleware/ui/base.css'
import './styles.css'

import { loadRuntimeConfig, useColorMode, useSeason } from '@meddleware/ui'

// Default to dark on first load (persisted to localStorage thereafter).
// Applied before mount to avoid a light-mode flash.
useColorMode('dark')
useSeason()

// Machine-zone endpoints (the indexer, the Walrus relays) may come from /runtime-config.json (ADR-0005). The
// embedded tools read them when their modules load, so the app and the router are imported only afterwards.
void loadRuntimeConfig().then(async () => {
  const [{ default: App }, { default: router }] = await Promise.all([import('./App.vue'), import('./router')])
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
