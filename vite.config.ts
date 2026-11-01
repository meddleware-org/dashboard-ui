import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { assertE2eOnlyInE2eMode, themeInit, viteTarget } from '@meddleware/frontend-config/vite'

// @meddleware/* resolve from node_modules (published packages — no monorepo aliases).
export default defineConfig(({ mode }) => {
  // The end-to-end build (`--mode e2e`) includes a mock wallet; nothing else may.
  assertE2eOnlyInE2eMode(mode)
  return {
    build: { target: viteTarget() },
    plugins: [vue(), themeInit({ default: 'dark' })],
    optimizeDeps: {
      // The Walrus wasm client is dynamically imported inside the inline WalrusStorageView upload flow;
      // keep it out of the eager dep-optimization graph so it stays a lazy chunk.
      // @meddleware/wallet-adapter ships TS + .vue source and holds the shared wallet singleton; if it
      // were pre-bundled, its .vue files (served raw) would load a second copy of the singleton in dev.
      exclude: ['@mysten/walrus', '@mysten/walrus-wasm', '@meddleware/wallet-adapter'],
    },
  }
})
