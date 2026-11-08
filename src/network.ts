// Which networks the dashboard offers, from the deployment records and nothing else. A tool's record lists the networks it is published on
// (the keys of its `*_DEPLOYMENTS` object); `networkAvailability` reports a network as `live` only when every product the dashboard hosts
// has a record there. Adding a `mainnet` key to both records is therefore the one switch that opens mainnet in the selector: no page here
// states which network is live in prose, and the platform's mainnet-readiness structure check fails on a hand-written disabled option.
//
// The two records are the products whose on-chain deployment a network choice depends on: the Access Gate (also read by the Walrus relay
// gate, Token Issuance and the Treasury) and the Sealed Storage policies. Walrus Storage and Token Issuance have no record of their own.
import { ACCESS_GATE_DEPLOYMENTS } from '@meddleware/access-gate-client/deployments'
import { SEAL_POLICIES_DEPLOYMENTS } from '@meddleware/sealed-storage-client/deployments'
import { networkAvailability, type NetworkAvailability } from '@meddleware/web-utils'
import { useNetwork, type MwNetwork } from '@meddleware/wallet-adapter'

/** The availability of testnet and mainnet, from the records. */
export const AVAILABILITY = networkAvailability({
  'access gate': Object.keys(ACCESS_GATE_DEPLOYMENTS),
  'sealed storage': Object.keys(SEAL_POLICIES_DEPLOYMENTS),
})

export interface MainnetChoice {
  /** Mainnet can be selected. */
  readonly open: boolean
  /** The option's text. */
  readonly label: string
  /** The option's tooltip: what is missing, or that mainnet is coming. Absent when mainnet is open. */
  readonly title?: string
}

/** How the mainnet option reads for the given availability (default: the records). */
export function mainnetChoice(mainnet: NetworkAvailability = AVAILABILITY.mainnet): MainnetChoice {
  switch (mainnet.status) {
    case 'live':
      return { open: true, label: 'Mainnet' }
    case 'partial':
      return { open: false, label: 'Mainnet (not open yet)', title: `Mainnet is not open yet. Still missing: ${mainnet.missing.join(', ')}.` }
    case 'coming':
      return { open: false, label: 'Mainnet (not open yet)', title: 'Mainnet is coming' }
  }
}

export interface NetworkOption {
  readonly value: MwNetwork
  readonly label: string
  readonly disabled: boolean
  readonly title?: string
}

/** The options of the network selector: testnet and localnet always, mainnet as the records allow. */
export function networkOptions(mainnet: NetworkAvailability = AVAILABILITY.mainnet): NetworkOption[] {
  const choice = mainnetChoice(mainnet)
  return [
    { value: 'testnet', label: 'Testnet', disabled: false },
    { value: 'mainnet', label: choice.label, disabled: !choice.open, title: choice.title },
    { value: 'localnet', label: 'Localnet', disabled: false },
  ]
}

/**
 * Keep the shared network on one the dashboard offers: a stored mainnet choice (from a time mainnet was open, or edited by hand) goes back to
 * testnet unless mainnet is live. Every tool view reads the shared choice, so this runs in the shell, with or without a wallet connected.
 */
export function keepToOpenNetwork(mainnet: NetworkAvailability = AVAILABILITY.mainnet): void {
  const { network, setNetwork } = useNetwork()
  if (network.value === 'mainnet' && mainnet.status !== 'live') setNetwork('testnet')
}
