// The route table is the dashboard's contract with the embedded tools (copy review 2, approved 2026-11-20): Tools at `/`, every tool as a
// tab of the console at `/tools/<id>` (never an iframe), the treasury at `/treasury`, the old addresses redirecting, and no DAO surface while
// governance is retired. Mounting is covered by the browser spec in e2e/.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import router from '../src/router'
import { TOOLS } from '../src/tools'

// The route table, and a lookup by path.
const routes = router.getRoutes()
const byPath = (path: string) => routes.find((r) => r.path === path)

// Where each address goes.
describe('router', () => {
  it('serves Tools at /, the tool console at /tools/:tool and the treasury at /treasury', () => {
    expect(byPath('/')?.name).toBe('tools')
    expect(byPath('/tools/:tool')?.name).toBe('tool')
    expect(byPath('/treasury')?.name).toBe('treasury')
  })

  it('redirects the old addresses: /blockchain to Tools, each old tool path to its tool', () => {
    expect(byPath('/blockchain')?.redirect).toBe('/')
    for (const [path, to] of [
      ['/walrus', '/tools/walrus-storage'],
      ['/walrus-storage', '/tools/walrus-storage'],
      ['/sealed-storage', '/tools/sealed-storage'],
      ['/access-gate', '/tools/access-gate'],
      ['/token-deployer', '/tools/token-issuance'],
      ['/token-issuance', '/tools/token-issuance'],
    ]) {
      expect(byPath(path)?.redirect, path).toBe(to)
    }
  })

  it('has no DAO route while the DAO view is retired', () => {
    expect(routes.some((r) => r.path.startsWith('/dao'))).toBe(false)
  })

  it('lazy-loads the route components (a tool loads only on navigation)', () => {
    for (const r of routes.filter((x) => !x.redirect)) {
      expect(typeof r.components?.default, r.path).toBe('function')
    }
  })

  it('resolves every other path to no route', () => {
    expect(router.resolve('/no-such-page').matched).toHaveLength(0)
  })
})

// The tools are imported from their own packages, lazily, and never embedded in an iframe.
describe('tool mounting', () => {
  const tools = readFileSync(join(import.meta.dirname, '..', 'src', 'tools.ts'), 'utf8')

  it('imports each tool view from its own package, lazily', () => {
    for (const [pkg, exported] of [
      ['@meddleware/walrus-storage-ui', 'WalrusStorageView'],
      ['@meddleware/sealed-storage-ui', 'SealedStorageView'],
      ['@meddleware/access-gate-ui', 'AccessGateView'],
      ['@meddleware/token-issuance-ui', 'TokenIssuanceView'],
    ]) {
      expect(tools).toContain(`import('${pkg}').then((m) => m.${exported})`)
    }
    expect(TOOLS.map((t) => t.id)).toEqual(['walrus-storage', 'sealed-storage', 'access-gate', 'token-issuance'])
  })

  it('never embeds a tool in an iframe', () => {
    const src = ['src/tools.ts', 'src/App.vue', 'src/views/ToolConsole.vue', 'src/views/ToolsView.vue']
      .map((f) => readFileSync(join(import.meta.dirname, '..', f), 'utf8'))
      .join('\n')
    expect(src).not.toMatch(/<iframe/i)
  })
})
