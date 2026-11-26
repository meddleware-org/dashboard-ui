// End-to-end build only (`vite build --mode e2e`; main.ts loads this when MODE is `e2e` and VITE_E2E is `1`, both static, so every other
// build drops it). A mock wallet is registered like an extension and the chain client is a stub with nothing on it, so every embedded tool
// can be checked connected (each tool's own flows are covered in its own repository).
import { installE2eWallet } from '@meddleware/wallet-adapter/testing'

/** Register the mock wallet the end-to-end build connects with; the chain client is the stub the shared test helper installs. */
export function installE2e(): void {
  installE2eWallet()
}
