// Ambient types: Vite's client types (import.meta.env and asset imports), and a declaration so TypeScript accepts imports of single-file components.
/// <reference types="vite/client" />

// Every .vue file is a component with no props or emits known here; vue-tsc checks the real ones.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
