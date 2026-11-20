// The built dashboard mounts every route and every embedded tool (audit C.1). A tool whose package or config contract broke (for example a
// dependency that throws on import or on mount) shows up here as an uncaught page error or a missing tool body. Requests that leave localhost
// are refused, so the run needs no network; the failed fetches are expected and are not errors of the page itself.
import { expect, test, type Page } from '@playwright/test'
import { offline } from '@meddleware/frontend-config/look'
import { TOOLS, openNav, tool, tools } from './open.js'

async function watch(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await offline(page)
  return errors
}

test('Tools is the first screen: one card per tool, each opening the tool in place, with the landmarks and one heading level 1', async ({ page }) => {
  const errors = await watch(page)
  await tools(page)
  await openNav(page)
  await expect(page.getByText('No wallet connected. Only tools that need one will ask.')).toBeVisible()
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tools')
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(TOOLS.length)
  // On a phone the menu is a drawer over the page; start again with it closed before using a card.
  await tools(page)
  await page.getByRole('main').getByRole('link', { name: 'Choose who can open a file' }).click()
  await expect(page).toHaveURL(/\/tools\/sealed-storage$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sealed Storage')
  expect(errors).toEqual([])
})

test('the treasury mounts at /treasury and is linked from the footer', async ({ page }) => {
  const errors = await watch(page)
  await tools(page)
  await page.getByRole('contentinfo').getByRole('link', { name: 'Treasury' }).click()
  await expect(page).toHaveURL(/\/treasury$/)
  await expect(page.getByText('Meddleware Treasury')).toBeVisible()
  expect(errors).toEqual([])
})

test('every tool mounts as a tab of the console, the address following the tab', async ({ page }) => {
  const errors = await watch(page)
  await page.goto('/tools/walrus-storage')
  const tabs = page.getByRole('tab', { name: /^(Walrus Storage|Sealed Storage|Access Gate|Token Issuance)$/ })
  await expect(tabs).toHaveCount(TOOLS.length)
  for (const { tab, body } of TOOLS) {
    await page.getByRole('tab', { name: tab, exact: true }).click()
    await expect(page.getByRole('tabpanel').first()).toContainText(body)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(tab)
  }
  await expect(page).toHaveURL(/\/tools\/token-issuance$/)
  expect(errors).toEqual([])
})

test('every tool also mounts with a wallet connected', async ({ page }) => {
  const errors = await watch(page)
  await tool('Walrus Storage', true)(page)
  for (const { tab, body } of TOOLS) {
    await page.getByRole('tab', { name: tab, exact: true }).click()
    await expect(page.getByRole('tabpanel').first()).toContainText(body)
  }
  await openNav(page)
  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible()
  expect(errors).toEqual([])
})

test('the menu is real links: the tools, then what is about Meddleware', async ({ page }) => {
  await watch(page)
  await tools(page)
  await openNav(page)
  const nav = page.getByRole('navigation', { name: 'Dashboard' })
  await expect(nav.getByRole('link', { name: 'All tools' })).toHaveAttribute('aria-current', 'page')
  await nav.getByRole('link', { name: 'Access Gate' }).click()
  await expect(page).toHaveURL(/\/tools\/access-gate$/)
  await openNav(page)
  await expect(nav.getByRole('link', { name: 'Access Gate' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: /Standards we use/ })).toHaveAttribute('href', 'https://meddleware.dev/platform/standards')
  await nav.getByRole('link', { name: 'Treasury' }).click()
  await expect(page).toHaveURL(/\/treasury$/)
})

test('mainnet is offered only when the records make it live, and a stored mainnet choice goes back to testnet until then', async ({ page }) => {
  const errors = await watch(page)
  await page.addInitScript(() => sessionStorage.setItem('mw:network', 'mainnet'))
  await tool('Walrus Storage', true)(page)
  await openNav(page)
  const select = page.getByRole('combobox', { name: 'Network' })
  const mainnet = select.locator('option[value="mainnet"]')
  await expect(select.locator('option[value="testnet"]')).toBeEnabled()
  await expect(select.locator('option[value="localnet"]')).toBeEnabled()
  if (await mainnet.isDisabled()) {
    // Not live: the option says so plainly, and the stored choice was reset.
    await expect(mainnet).toHaveText('Mainnet (not available yet)')
    await expect(select).toHaveValue('testnet')
  } else {
    await expect(mainnet).toHaveText('Mainnet')
    await expect(select).toHaveValue('mainnet')
  }
  expect(errors).toEqual([])
})

test('the old addresses land on Tools and on each tool', async ({ page }) => {
  const errors = await watch(page)
  await page.goto('/blockchain')
  await expect(page).toHaveURL(/\/$/)
  for (const [path, id] of [['/walrus', 'walrus-storage'], ['/sealed-storage', 'sealed-storage'], ['/access-gate', 'access-gate'], ['/token-deployer', 'token-issuance']]) {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`/tools/${id}$`))
  }
  expect(errors).toEqual([])
})
