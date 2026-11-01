// The chains the Blockchain section offers. Data-driven: onboarding a chain is a new entry here plus a tool set in `views/BlockchainView.vue`.
export interface Chain {
  id: string
  label: string
  /** A decorative glyph (hidden from assistive technology). */
  icon: string
}

export const CHAINS: readonly Chain[] = [
  { id: 'sui', label: 'Sui', icon: '🌊' },
  // Future chains slot in here — the Blockchain view swaps tool sets by the selected id.
]

export const DEFAULT_CHAIN = CHAINS[0].id
