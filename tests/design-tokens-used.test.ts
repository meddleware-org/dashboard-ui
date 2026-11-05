// --warning is the bright yellow fill (2.0:1 on the light canvas), so it must never be a text colour; text
// uses --warning-text (design-tokens audit F10). The check also requires every custom property the shell
// reads to be one design-tokens defines (or the file defines itself): an undefined name falls through to a
// literal fallback that ignores the theme and season.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const tokenCss = readFileSync(require.resolve('@meddleware/design-tokens/tokens.css'), 'utf8')
const seasonCss = readFileSync(require.resolve('@meddleware/design-tokens/seasons.css'), 'utf8')
const declared = (css: string) => new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!))
const defined = declared(tokenCss + seasonCss)

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? sourceFiles(join(dir, e.name))
      : /\.(vue|css)$/.test(e.name)
        ? [join(dir, e.name)]
        : [],
  )
}

// AppSidebar/AppHeader/AppFooter (@meddleware/ui) set `--_muted` and `--_border` on their panel for the slot
// content to read; they are that component contract, not design tokens.
const PANEL_PRIVATE = /^--_(muted|border)$/

// Properties `@meddleware/ui` publishes on <html> at run time (`useStickyOffset`: the sticky header's real height, a second sticky layer's):
// they are not tokens and do not exist until a component measures itself, so the shell may read them only with a token as the fallback.
const RUNTIME_PUBLISHED = ['--mw-header-offset', '--mw-sticky-extra']

const files = sourceFiles(join(import.meta.dirname, '..', 'src'))

describe('design tokens in the shell styles', () => {
  it('finds the components and stylesheets', () => {
    expect(files.length).toBeGreaterThan(0)
    expect(files.some((f) => f.endsWith('App.vue'))).toBe(true)
  })

  it.each(files)('%s never uses --warning as a text colour (use --warning-text)', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(/(^|[^-])color:\s*var\(--warning\)/m)
  })

  it.each(files)('%s reads only properties design-tokens defines (or defines itself)', (file) => {
    const css = readFileSync(file, 'utf8')
    const own = declared(css)
    const used = [...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!)
    const known = (name: string) => defined.has(name) || own.has(name) || PANEL_PRIVATE.test(name) || RUNTIME_PUBLISHED.includes(name)
    expect(used.filter((name) => !known(name))).toEqual([])
  })

  it.each(files)('%s reads a run-time published property only with a fallback', (file) => {
    const css = readFileSync(file, 'utf8')
    for (const name of RUNTIME_PUBLISHED) {
      const bare = new RegExp(`var\\(\\s*${name}\\s*\\)`)
      expect(css, `${name} needs a fallback`).not.toMatch(bare)
    }
  })
})
