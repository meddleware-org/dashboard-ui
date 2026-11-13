# CLAUDE.md — @meddleware/dashboard-ui

## What this app is

A Vue 3 + Vite SPA serving as the Meddleware dashboard at `dash.meddleware.co.uk`: the one place a person uses the five tools (Treasury,
Walrus Storage, Sealed Storage, Access Gate, Token Issuance) with one wallet connection. It renders each tool/view inline by importing the
exported component from its own package (e.g. `TreasuryView` from `@meddleware/treasury-ui`, `WalrusStorageView` from
`@meddleware/walrus-storage-ui`) and wrapping it in the dashboard shell.

### Information architecture (two org sections + a drill-down)

The sidebar has two **modes**:

- **Top level** — organisation sections. Currently **Treasury** (the default route `/`, embedding
  `TreasuryView`) and **Blockchain**. Room for more general-org sections later.
- **Blockchain mode** — entered by clicking the *Blockchain* item. The sidebar swaps to a modular
  **chain selector** (`ChainSelector`, defaults to Sui, data-driven for future chains) plus an
  **up-one-level** ("← Back") control that returns to the top level *without leaving the page*.
  The content area (`/blockchain`, `views/BlockchainView.vue`) is a **qt-style tabbed console**
  (`AppTabNav variant="raised"`) whose tabs are the Sui tools — Walrus Storage, Sealed Storage,
  Access Gate, Token Issuance — each lazy-loaded and kept alive across tab switches.

Sidebar mode is local UI state (`sidebarView: 'top' | 'blockchain'`), not a route: clicking
*Blockchain* while already on `/blockchain` just re-opens the selector (no reload); *up one level*
only changes the sidebar. Legacy per-tool paths (`/walrus`, …) redirect to `/blockchain`.

**DAO is retired** from the dashboard until governance is usable: there is no route for it and `@meddleware/dao-ui` is not a
dependency (it was removed unused on 2026-10-31; add it back with the route when DAO participation ships).

Navigation is real links (`SidebarItem href` through `RouterLink custom`), so it opens in a new tab and works without script. Below 45em the
sidebar is a drawer (the Popover API) opened by the header's menu button (`AppHeader sidebar-id="main-nav"`). Each route has a visually hidden
`h1` (`route.meta.title`); the tools bring their own `h2`.

## Architectural invariants

- **No on-chain logic here — extend the domain client.** `suiBoundary()` from
  `@meddleware/eslint-config` (appended by `vueApp({ sui: true })` in `eslint.config.ts`) forbids, in `src/` outside
  `src/wallet.ts`: value imports of `@mysten/sui/{grpc,client,transactions}` (type-only imports are
  fine; `@mysten/sui/jsonRpc` is banned outright), building transactions and chain reads. URL
  bindings on native elements must go through `safeHref`, `safeIcon`, `suiExplorerUrl` or
  `walruscanBlobUrl`. Do not disable it — move the logic into the domain client instead.
- **Hosts the single shared wallet connection.** The dashboard mounts `useWallet()` from
  `@meddleware/wallet-adapter` (a module singleton) and surfaces one connect/disconnect control
  in the header. Every inline tool view reads that same connection — connect once, all tools see
  it. (This supersedes the earlier "no wallet" invariant, which applied when tools were external
  iframes.) The dashboard still performs no accounting and builds no transactions itself — the
  tool views own their signing flows.
- **Which networks are offered comes from the deployment records.** `src/network.ts` computes
  `networkAvailability({ 'access gate': Object.keys(ACCESS_GATE_DEPLOYMENTS), 'sealed storage': Object.keys(SEAL_POLICIES_DEPLOYMENTS) })`
  (`@meddleware/web-utils`, records from `@meddleware/access-gate-client/deployments` and `@meddleware/sealed-storage-client/deployments`).
  `NetworkSelector` enables each of the testnet and mainnet options only when that network's status is `live`; otherwise the option reads
  "Mainnet (not available yet)" (plain, naming no product; D117), and `keepToOpenNetwork()` (called by `App.vue`, with or without a wallet) resets a stored mainnet
  choice to testnet only while mainnet is not live. Adding a `mainnet` key to both records is the whole switch; never hand-write a
  disabled mainnet option or a sentence saying which network is live (the platform's mainnet-readiness structure check
  fails on it). Token Issuance additionally keeps mainnet closed until the build carries `VITE_FEE_TREASURY_MAINNET` (no personal address is
  committed as a default; `.env.production` holds testnet only).
- **Tools render inline, not via iframe.** Import each tool's exported view component and render
  it in a route. Do not reintroduce cross-origin iframes (`X-Frame-Options` blocks them and
  wallet extensions don't inject into them). Tool routes are lazy (`() => import(...)`) so each
  tool's deps (incl. the Walrus wasm) load only on navigation.
- **No accounting logic.** Financial truth lives on-chain; this app derives none of it.
- **Shell slots are unwrapped.** `AppHeader`/`AppSidebar`/`AppFooter` render slot content directly,
  so the shell styles its own pieces (e.g. `.foot` in `App.vue`). The frame is `UiAppShell` (skip link, `<main>`); the page scrolls, the tool
  tabs stay under the sticky header, and the shell uses only token roles (no ui-private `--_*` variables).
- **Sidebar navigation components come from `@meddleware/ui`.** Use `SidebarItem` for entries
  (and `SidebarGroup` if a mode ever needs grouped headers). Do not create local copies. The
  sidebar renders one of two modes (see IA above): top-level org sections, or the Blockchain
  chain-selector. Onboarding a new chain = a new entry in `src/chains.ts` plus a new tool set in
  `BlockchainView`'s `TOOLSETS` — no shell changes (`App.vue` passes the chosen chain to the view).
- **qt-style tabbed tools.** The Blockchain view uses the shared `AppTabNav variant="raised"`
  (WAI-ARIA tabs) with a `UiTabPanel` around the lazy, kept-alive tool views. Do not give each tool its own route;
  they are tabs within `/blockchain`.
- **StatusWidget polls `https://status.meddleware.co.uk/api/status` every 60 s** via plain
  `fetch`. No external libraries. Three states: `ok`, `degraded`, `error`.
- **One `@mysten/sui` in the tree — a direct dependency (`^2.36.0`), no `overrides`.** Two copies of
  `@mysten/sui` produce `#private`-mismatch type errors (`Type 'X' is not assignable to type 'X'`) that
  break `vue-tsc`, because the shared `@meddleware/wallet-adapter` `Executor` crosses every tool. The
  embedded `@meddleware/*` tools and SDKs declare the same caret range, so npm dedupes to one copy and an
  override is unnecessary. When bumping, keep the dashboard's range no lower than what every embedded
  tool declares, then confirm `npm ls @mysten/sui` shows a single version (all others `deduped`). Re-add
  an `overrides` entry only if the embedded ranges stop overlapping.
- **One `@meddleware/wallet-adapter` in the tree.** It is a module singleton: two copies are two
  wallet connections. This app holds the one real dependency; every embedded tool declares it as a
  peerDependency (`>=0.0.12 <0.2.0`). After a bump, confirm a single copy:
  `find node_modules -path '*@meddleware/wallet-adapter/package.json'` lists exactly one.

## Tests and checks

`npm test` (vitest, jsdom, `vueTestConfig` from `@meddleware/frontend-config`) pins the shell's contracts: the route table and tool imports
(`tests/router.test.ts`), the network availability, the selector's mainnet option and the stored-network guard with the records mocked to
prove the switch (`tests/network.test.ts`), the
contract with design-tokens — no `--warning` text colour, no undefined custom property
(`tests/design-tokens-used.test.ts`), the build-input inventory — Dockerfile ARGs, `.env.example` and the
release build-args stay in step and no access-gate price variable exists (`tests/build-inputs.test.ts`),
and the release-gate contract (`tests/workflows.test.ts`). `npm run test:e2e` (Playwright; Chromium locally, five browsers in CI with
`E2E_BROWSERS=all`) builds the app in e2e mode (`npm run build:e2e`: a mock wallet and an empty stub chain, `src/e2e.ts`, refused in any
other mode), serves `dist` and mounts `/`, every tool tab of `/blockchain` (disconnected and connected) and the legacy redirects with all
external requests refused, then runs the shared accessibility sweep (`e2e/a11y.spec.ts`: every route and tool in every colour mode × season,
reflow with the drawer at 320 px, text size, forced colours, keyboard). `tests/app.test.ts` pins the header's brand mark and that the app keeps no icon of its own; `tests/dist.test.ts` runs over the built `dist/` (CI runs it after the build with
`REQUIRE_DIST=1`; a plain `npm test` before a build skips it): the icon set and the manifest name, one icon link per kind, the mark in the bundle and no `◆`
placeholder, no font file or font host, no third-party script, style or image, and no origin named beyond this site, the explorers and the protocol
endpoints (the licence-text chunk is not read: it quotes the licensors' sites). Do not add a font, CDN, analytics or other third-party load; the CI
workflows set `DO_NOT_TRACK=1`. `npm run lhci` runs Lighthouse. `npm run check:csp`
(`mw-check-csp-inline`) fails if a built page has an inline script the Dockerfile's CSP does not allow by hash. CI (`node-ci.yml`) runs all of these, and
both release workflows call it. CI also builds the image and probes the running container
(`scripts/smoke.sh <image>`; `CONTAINER_ENGINE=podman` for rootless podman) and runs a Trivy filesystem scan.

The embedded tools take no props: each reads its own `VITE_*` configuration at bundle time. The relay
access-gate price is read from the chain (walrus-storage-kit 0.1.31); there is no price variable.

## Shared tooling

The audit gate (`mw-audit-gate`), licence notices (`mw-third-party-licenses`), the CSP check (`mw-check-csp-inline`), the Vite and Vitest
configurations (`meddlewareApp`, `vueTestConfig`) and the tsconfig base come from `@meddleware/frontend-config`; there are no local copies.
`package.json` `"meddleware": { "kind": "app", "csp": "chain-wasm", "lhci": true }` configures `npx mw-sync`, which keeps `.dockerignore`, the
postcss and stylelint configs, `dependabot.yml`, the audit allowlist and the Dockerfile's `ARG CSP` equal to the shared templates: run
`npx mw-sync --write` after a bump, `npx mw-sync --check` runs in CI. `meddlewareApp({ name: 'Meddleware' })` also emits the brand icon set
(favicon, apple-touch-icon, 192/512 icons, `site.webmanifest`) and injects the links, so the app keeps no `public/favicon.*` and no icon `<link>`
(`mw-sync --check` fails on the former). The header shows the company mark (`BrandMark` from `@meddleware/ui`, decorative, coloured with
`var(--accent)`) beside the name; the footer's Kopimi symbol (`CopyrightLine`) is a different thing and stays. The tool emoji in the sidebar are
tool icons, not the logo. The CSP profile is `chain-wasm`: script-src is `'self'` plus
`'wasm-unsafe-eval'` for the Walrus and Move WebAssembly.

## Commands

```bash
npm ci
npm run dev          # Vite dev server at http://localhost:5173
npm run type-check
npm test             # unit tests
npm run test:e2e     # Playwright over the e2e build (E2E_BROWSERS=all for the five browsers)
npm run build && npm run check:bundle && npm run check:csp && npm run check:licenses
```

## Adding a tool

A tool of an existing chain is a new entry in `TOOLSETS` in `views/BlockchainView.vue` (an `id`, a `label`, a lazy import of the view from the
tool's package), plus its package in `package.json` and a state in `e2e/open.ts` (`TOOLS`) and `e2e/a11y.spec.ts`. An organisation section
(like Treasury) is a route in `router/index.ts` and a `SidebarItem` in `App.vue`. Either way the dashboard stays thin: no chain calls, no
signing and no financial logic of its own.

## Dependency order

Every `@meddleware/*` dependency (the shared packages and the five embedded tool packages) must be published to npmjs at the version `package.json` names before this image can be built: release in tier order and bump the ranges after each publish.
For local development:

```bash
cd repos/ui && npm install && npm run build
cd repos/ui && npm link
cd repos/dashboard-ui && npm install && npm link @meddleware/ui
npm run dev
```

## Scope

This dashboard is for the people who use the five tools. Developer documentation (self-host guides, library docs, fork-your-own
instructions) lives on the developer site (`meddleware.dev`; the footer links to it). Do not add self-host or library content here. Words on
the page follow the wording rules: Meddleware (one spelling), no build variable, script or file name, nothing "coming soon" written by hand
(what is live comes from the deployment records), and "operator" only for people who run infrastructure.
