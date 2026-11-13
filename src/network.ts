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

export interface NetworkChoice {
  /** The network can be selected. */
  readonly open: boolean
  /** The option's text: the network's name, and "not available yet" while its records are missing. */
  readonly label: string
}

const NAMES = { testnet: 'Testnet', mainnet: 'Mainnet' } as const

/**
 * How a network's option reads for its availability: selectable once every hosted product has a record there, otherwise listed with
 * "not available yet" (plain: a reader cannot act on which product is missing, so the text names none; D117).
 */
export function networkChoice(network: keyof typeof NAMES, availability: NetworkAvailability): NetworkChoice {
  return availability.status === 'live'
    ? { open: true, label: NAMES[network] }
    : { open: false, label: `${NAMES[network]} (not available yet)` }
}

export interface NetworkOption {
  readonly value: MwNetwork
  readonly label: string
  readonly disabled: boolean
}

/** The options of the network selector: testnet and mainnet as the records allow, localnet always (a developer's own node). */
export function networkOptions(availability: Pick<typeof AVAILABILITY, 'testnet' | 'mainnet'> = AVAILABILITY): NetworkOption[] {
  const testnet = networkChoice('testnet', availability.testnet)
  const mainnet = networkChoice('mainnet', availability.mainnet)
  return [
    { value: 'testnet', label: testnet.label, disabled: !testnet.open },
    { value: 'mainnet', label: mainnet.label, disabled: !mainnet.open },
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
