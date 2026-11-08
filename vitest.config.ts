import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { vueTestConfig } from '@meddleware/frontend-config/vitest'

// Unit tests for the shell's contracts (routes, the network availability, design-token use, build inputs, workflows). jsdom hosts the Vue
// mounts. The browser-level check that every tool route mounts is the Playwright suite in e2e/.
export default defineConfig(vueTestConfig({ plugins: [vue()] }))
