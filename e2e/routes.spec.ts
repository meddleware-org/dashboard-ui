// The built dashboard mounts every route and every embedded tool (audit C.1). A tool whose package or config contract broke (for example a
// dependency that throws on import or on mount) shows up here as an uncaught page error or a missing tool body. Requests that leave localhost
// are refused, so the run needs no network; the failed fetches are expected and are not errors of the page itself.
import { expect, test, type Page } from '@playwright/test'
import { offline } from '@meddleware/frontend-config/look'
import { TOOLS, openNav, tool, treasury } from './open.js'

async function watch(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await offline(page)
  return errors
}

test('the Treasury view mounts at /, with the page landmarks and one heading level 1', async ({ page }) => {
  const errors = await watch(page)
  await treasury(page)
  await openNav(page)
  await expect(page.getByText('No wallet connected')).toBeVisible()
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Treasury')
  expect(errors).toEqual([])
})

test('every Blockchain tool mounts as a tab at /blockchain', async ({ page }) => {
  const errors = await watch(page)
  await page.goto('/blockchain')
  const tabs = page.getByRole('tab', { name: /^(Walrus Storage|Sealed Storage|Access Gate|Token Issuance)$/ })
  await expect(tabs).toHaveCount(TOOLS.length)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blockchain tools')
  for (const { tab, body } of TOOLS) {
    await page.getByRole('tab', { name: tab, exact: true }).click()
    await expect(page.getByRole('tabpanel').first()).toContainText(body)
  }
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

test('the sidebar is real links, and Back returns to the organisation sections without leaving the page', async ({ page }) => {
  await watch(page)
  await treasury(page)
  await openNav(page)
  const nav = page.getByRole('navigation', { name: 'Dashboard' })
  await expect(nav.getByRole('link', { name: 'Treasury' })).toHaveAttribute('aria-current', 'page')
  await nav.getByRole('link', { name: 'Blockchain' }).click()
  await expect(page).toHaveURL(/\/blockchain$/)
  await openNav(page)
  await expect(nav.getByRole('button', { name: /Back/ })).toBeVisible()
  await nav.getByRole('button', { name: /Back/ }).click()
  await openNav(page) // choosing an item closes the drawer on a phone
  await expect(nav.getByRole('link', { name: 'Treasury' })).toBeVisible()
  await expect(page).toHaveURL(/\/blockchain$/)
})

test('the retired per-tool paths land on /blockchain', async ({ page }) => {
  const errors = await watch(page)
  for (const path of ['/walrus', '/walrus-storage', '/sealed-storage', '/access-gate', '/token-deployer', '/token-issuance']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/blockchain$/)
  }
  expect(errors).toEqual([])
})
