import type { Page } from '@playwright/test'
import { offline } from '@meddleware/frontend-config/look'
import { connectMockWallet } from '@meddleware/frontend-config/wallet'

export const TOOLS = [
  { tab: 'Walrus Storage', body: /Upload and manage blobs on Walrus/ },
  { tab: 'Sealed Storage', body: /Client-side encrypted, access-gated storage/ },
  { tab: 'Access Gate', body: /Create and manage on-chain access gates/ },
  { tab: 'Token Issuance', body: /Deploy your own Sui coin/ },
] as const

/** The built dashboard (the e2e build: a mock wallet and an empty stub chain), every request that leaves localhost refused. */
export async function treasury(page: Page): Promise<void> {
  await offline(page)
  await page.goto('/')
  await page.getByText('Meddleware Treasury').waitFor()
}

/** A tool's tab in `/blockchain`, with the wallet connected or not. */
export const tool =
  (name: string, connected = false) =>
  async (page: Page): Promise<void> => {
    await offline(page)
    await page.goto('/blockchain')
    await page.getByRole('tab', { name, exact: true }).click()
    if (connected) {
      await page.getByRole('button', { name: /^Connect wallet$/i }).first().click()
      await page.getByRole('dialog').getByRole('button', { name: 'Test Wallet' }).click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
    }
    await page.waitForTimeout(400)
  }

export { connectMockWallet }

/** On a phone the sidebar is a drawer behind the header's menu button: open it (a wide screen already shows it). */
export async function openNav(page: Page): Promise<void> {
  const menu = page.getByRole('button', { name: 'Open the menu' })
  if (await menu.isVisible()) await menu.click()
}
