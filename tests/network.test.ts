// Which networks the dashboard offers comes from the deployment records, never from prose: mainnet is selectable only when every hosted
// product has a mainnet record, and a stored mainnet choice goes back to testnet only while it is not. The records are mocked to prove the
// switch (the real ones hold testnet only until the mainnet publish).
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.doUnmock('@meddleware/access-gate-client/deployments')
  vi.doUnmock('@meddleware/sealed-storage-client/deployments')
  vi.resetModules()
})

const record = (networks: string[]) => Object.fromEntries(networks.map((n) => [n, { originalId: '0x1', publishedAt: '0x1' }]))

/** The shell's network code as it behaves when the two records hold exactly these networks. */
async function withRecords(gate: string[], seal: string[]) {
  vi.resetModules()
  vi.doMock('@meddleware/access-gate-client/deployments', () => ({ ACCESS_GATE_DEPLOYMENTS: record(gate) }))
  vi.doMock('@meddleware/sealed-storage-client/deployments', () => ({ SEAL_POLICIES_DEPLOYMENTS: record(seal) }))
  const { mount } = await import('@vue/test-utils')
  const { useNetwork } = await import('@meddleware/wallet-adapter')
  const net = await import('../src/network.js')
  const NetworkSelector = (await import('../src/components/NetworkSelector.vue')).default
  useNetwork().setNetwork('testnet')
  return { mount, useNetwork, net, NetworkSelector }
}

describe('mainnet availability', () => {
  it('is "coming" while neither record has a mainnet key', async () => {
    const { net } = await withRecords(['testnet'], ['testnet'])
    expect(net.AVAILABILITY.testnet.status).toBe('live')
    expect(net.AVAILABILITY.mainnet.status).toBe('coming')
    expect(net.mainnetChoice()).toEqual({ open: false, label: 'Mainnet (not open yet)', title: 'Mainnet is coming' })
  })

  it('is "partial" when one record has it, and the tooltip names what is missing', async () => {
    const { net } = await withRecords(['testnet', 'mainnet'], ['testnet'])
    expect(net.AVAILABILITY.mainnet.status).toBe('partial')
    expect(net.mainnetChoice()).toEqual({
      open: false,
      label: 'Mainnet (not open yet)',
      title: 'Mainnet is not open yet. Still missing: sealed storage.',
    })
  })

  it('is "live" once both records have it, and the option reads as plain Mainnet', async () => {
    const { net } = await withRecords(['testnet', 'mainnet'], ['testnet', 'mainnet'])
    expect(net.AVAILABILITY.mainnet.status).toBe('live')
    expect(net.mainnetChoice()).toEqual({ open: true, label: 'Mainnet' })
  })

  it('lists testnet, mainnet and localnet in that order, with only mainnet disabled', async () => {
    const { net } = await withRecords(['testnet'], ['testnet'])
    expect(net.networkOptions().map((o) => [o.value, o.disabled])).toEqual([['testnet', false], ['mainnet', true], ['localnet', false]])
  })

  it('reads the real records today: testnet is live', async () => {
    vi.resetModules()
    const net = await import('../src/network.js')
    expect(net.AVAILABILITY.testnet.status).toBe('live')
    expect(net.AVAILABILITY.testnet.live).toEqual(['access gate', 'sealed storage'])
  })
})

describe('the stored network', () => {
  it('goes back to testnet when mainnet is not live', async () => {
    const { net, useNetwork } = await withRecords(['testnet'], ['testnet'])
    const { network, setNetwork } = useNetwork()
    setNetwork('mainnet')
    net.keepToOpenNetwork()
    expect(network.value).toBe('testnet')
  })

  it('goes back to testnet when mainnet is only partly deployed', async () => {
    const { net, useNetwork } = await withRecords(['testnet', 'mainnet'], ['testnet'])
    const { network, setNetwork } = useNetwork()
    setNetwork('mainnet')
    net.keepToOpenNetwork()
    expect(network.value).toBe('testnet')
  })

  it('stays on mainnet once mainnet is live', async () => {
    const { net, useNetwork } = await withRecords(['testnet', 'mainnet'], ['testnet', 'mainnet'])
    const { network, setNetwork } = useNetwork()
    setNetwork('mainnet')
    net.keepToOpenNetwork()
    expect(network.value).toBe('mainnet')
  })

  it('leaves testnet and localnet alone', async () => {
    const { net, useNetwork } = await withRecords(['testnet'], ['testnet'])
    const { network, setNetwork } = useNetwork()
    setNetwork('localnet')
    net.keepToOpenNetwork()
    expect(network.value).toBe('localnet')
  })
})

describe('NetworkSelector', () => {
  it('offers testnet and localnet, and lists mainnet disabled with the reason while it is coming', async () => {
    const { mount, NetworkSelector } = await withRecords(['testnet'], ['testnet'])
    const select = mount(NetworkSelector).get('select')
    const option = (value: string) => select.get(`option[value="${value}"]`)
    expect(option('testnet').attributes('disabled')).toBeUndefined()
    expect(option('localnet').attributes('disabled')).toBeUndefined()
    expect(option('mainnet').attributes('disabled')).toBeDefined()
    expect(option('mainnet').attributes('title')).toBe('Mainnet is coming')
    expect(option('mainnet').text()).toBe('Mainnet (not open yet)')
  })

  it('says what is missing while mainnet is partly deployed', async () => {
    const { mount, NetworkSelector } = await withRecords(['testnet', 'mainnet'], ['testnet'])
    const option = mount(NetworkSelector).get('option[value="mainnet"]')
    expect(option.attributes('disabled')).toBeDefined()
    expect(option.attributes('title')).toBe('Mainnet is not open yet. Still missing: sealed storage.')
  })

  it('enables mainnet, with no tooltip, once the records have it', async () => {
    const { mount, NetworkSelector } = await withRecords(['testnet', 'mainnet'], ['testnet', 'mainnet'])
    const option = mount(NetworkSelector).get('option[value="mainnet"]')
    expect(option.attributes('disabled')).toBeUndefined()
    expect(option.attributes('title')).toBeUndefined()
    expect(option.text()).toBe('Mainnet')
  })

  it('writes the chosen network to the shared singleton', async () => {
    const { mount, useNetwork, NetworkSelector } = await withRecords(['testnet'], ['testnet'])
    const { network } = useNetwork()
    const wrapper = mount(NetworkSelector)
    await wrapper.get('select').setValue('localnet')
    expect(network.value).toBe('localnet')
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
  })

  it('does not itself change a stored mainnet choice (the shell keeps to an open network)', async () => {
    const { mount, useNetwork, NetworkSelector } = await withRecords(['testnet'], ['testnet'])
    const { network, setNetwork } = useNetwork()
    setNetwork('mainnet')
    mount(NetworkSelector)
    expect(network.value).toBe('mainnet')
  })
})

describe('no hard-coded network claim', () => {
  it('has no disabled mainnet option written by hand, and no "coming soon"', async () => {
    const { readFileSync, readdirSync } = await import('node:fs')
    const { join } = await import('node:path')
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
    const files = walk(join(import.meta.dirname, '..', 'src')).filter((f) => /\.(vue|ts)$/.test(f))
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      expect(text, file).not.toMatch(/<option value="mainnet"[^>]*\sdisabled/)
      expect(text, file).not.toMatch(/coming soon/i)
    }
  })
})
