import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { meddlewareApp } from '@meddleware/frontend-config/vite'

// meddlewareApp refuses VITE_E2E outside the end-to-end mode (`--mode e2e`: a mock wallet and a stub chain; nothing else may include them),
// sets the browserslist build target and the dark default colour mode, and keeps @meddleware/wallet-adapter (the shared wallet singleton,
// shipped as TS + .vue source) out of pre-bundling, so dev does not load a second copy of it.
export default defineConfig(
  meddlewareApp({
    plugins: [vue()],
    config: {
      optimizeDeps: {
        // The Walrus wasm client is dynamically imported inside the inline WalrusStorageView upload flow; keep it out of the eager
        // dep-optimization graph so it stays a lazy chunk.
        exclude: ['@mysten/walrus', '@mysten/walrus-wasm'],
      },
    },
  }),
)
