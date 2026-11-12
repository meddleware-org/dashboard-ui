// The shell's header: the company mark beside the name, hidden from assistive technology, and no icon of the app's own (the favicon set
// comes from the shared brand icons). The routed tool is mocked: this pins the shell, not the tools.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@meddleware/treasury-ui', () => ({ TreasuryView: { template: '<p class="view">treasury</p>' } }))
vi.mock('../src/views/BlockchainView.vue', () => ({ default: { template: '<p class="view">blockchain</p>' } }))
const { default: router } = await import('../src/router/index.js')
const { default: App } = await import('../src/App.vue')

async function mounted() {
  await router.push('/')
  await router.isReady()
  return mount(App, { global: { plugins: [router] } })
}

describe('App header', () => {
  it('shows the company mark beside the name, hidden from assistive technology, and no placeholder glyph', async () => {
    const header = (await mounted()).get('header')
    const mark = header.get('svg.mw-brand-mark')
    expect(mark.attributes('aria-hidden')).toBe('true')
    expect(header.get('a').text()).toContain('Meddleware')
    expect(header.text()).not.toContain('◆')
  })
})

describe('the brand', () => {
  it('keeps no icon of its own: the favicon set comes from the shared brand icons', () => {
    expect(existsSync('public/favicon.svg')).toBe(false)
    expect(readdirSync('public').filter((f) => /favicon|apple-touch|icon-/.test(f))).toEqual([])
    expect(readFileSync('index.html', 'utf8')).not.toMatch(/rel="(?:shortcut )?icon"|apple-touch-icon/)
  })
})
