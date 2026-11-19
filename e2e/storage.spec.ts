// Nothing is stored in the visitor's browser, and no other host is asked for anything, before the visitor acts (PECR Sch. A1; the
// workspace's docs/legal/STORAGE_LEDGER.md and decision D134). The one exception is our own status page, which the dashboard reads
// on load to show whether the services are up: a first-party read that stores nothing.
import { test } from '@playwright/test'
import { offline } from '@meddleware/frontend-config/look'
import { expectNothingStored, watchOtherHosts } from '@meddleware/frontend-config/storage'

const OWN_HOSTS = ['status.meddleware.co.uk']

test.describe('stores nothing before the visitor acts (PECR Sch. A1)', () => {
  test('home', async ({ page }) => {
    await offline(page)
    const otherHosts = watchOtherHosts(page)
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    for (const host of OWN_HOSTS) otherHosts.delete(host)
    await expectNothingStored(page, { otherHosts })
  })
})
