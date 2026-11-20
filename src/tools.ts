// The tools the dashboard hosts: one entry each, in catalogue order (copy review 2, approved 2026-11-20). The dashboard is defined by
// none of them; a new tool is a new entry here (and its view is loaded lazily, so its dependencies load only when it is opened). The
// heading says what the tool does for a person; what it runs on is named only on its own card.
import { defineAsyncComponent } from 'vue'

export interface DashboardTool {
  /** The address segment (`/tools/<id>`). */
  id: string
  /** The tool's own name (its tab and its page title). */
  name: string
  /** What the tool does for a person: the card's heading. */
  title: string
  description: string
  /** What it runs on, named only on its card. */
  runsOn: string
  /** Decoration only. */
  icon: string
  view: ReturnType<typeof defineAsyncComponent>
}

export const TOOLS: readonly DashboardTool[] = [
  {
    id: 'walrus-storage',
    name: 'Walrus Storage',
    title: 'Keep files no one can take down',
    description: 'Store files where no single company can delete them, and see how long each one is kept.',
    runsOn: 'Walrus and Sui',
    icon: '🗄',
    view: defineAsyncComponent(() => import('@meddleware/walrus-storage-ui').then((m) => m.WalrusStorageView)),
  },
  {
    id: 'sealed-storage',
    name: 'Sealed Storage',
    title: 'Choose who can open a file',
    description: 'Files are encrypted in your browser; only people with the right pass, or after a time you set, can open them.',
    runsOn: 'Sui',
    icon: '🔒',
    view: defineAsyncComponent(() => import('@meddleware/sealed-storage-ui').then((m) => m.SealedStorageView)),
  },
  {
    id: 'access-gate',
    name: 'Access Gate',
    title: 'Sell access to your work',
    description: 'Sell passes to your files, pages or apps. Payment goes to you, less our published fee, with no account to set up.',
    runsOn: 'Sui',
    icon: '🔐',
    view: defineAsyncComponent(() => import('@meddleware/access-gate-ui').then((m) => m.AccessGateView)),
  },
  {
    id: 'token-issuance',
    name: 'Token Issuance',
    title: 'Issue your own token',
    description: 'Create a coin from your browser in about a minute; we never hold your keys.',
    runsOn: 'Sui',
    icon: '🪙',
    view: defineAsyncComponent(() => import('@meddleware/token-issuance-ui').then((m) => m.TokenIssuanceView)),
  },
]

/** The tool with this id, if any. */
export const toolById = (id: string | undefined): DashboardTool | undefined => TOOLS.find((t) => t.id === id)

/** The words for a network on a tool card. */
export function networkWords(network: string): string {
  return network === 'mainnet' ? 'main network' : network === 'localnet' ? 'local network' : 'test network'
}
