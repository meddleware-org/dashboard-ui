// Vitest configuration for the shell's unit tests in tests/: the fleet's shared Vue test preset (jsdom, the shared setup) plus the Vue plugin.
// The Vue plugin, defineConfig and the shared preset.
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { vueTestConfig } from '@meddleware/frontend-config/vitest'

// Unit tests for the shell's contracts (routes, the network availability, design-token use, build inputs, workflows). jsdom hosts the Vue
// mounts. The browser-level check that every tool route mounts is the Playwright suite in e2e/.
// The preset, with the Vue plugin the shell's components need.
export default defineConfig(vueTestConfig({ plugins: [vue()] }))
