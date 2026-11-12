# Changelog

All notable changes to `@meddleware/dashboard` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/). Before 0.2.0, breaking changes ship as patch releases.
Releases before 0.1.85 are recorded in the git history only.

## [0.1.99] - 2026-11-12

### Changed

- The header shows the Meddleware mark (`BrandMark` from `@meddleware/ui` ^0.1.42) in place of the `◆` placeholder, and the browser tab, home-screen and web-manifest icons are the shared brand icon set. The app keeps no icon of its own: `public/favicon.svg` and the `<link rel="icon">` in `index.html` are removed, and `meddlewareApp` (`@meddleware/frontend-config` ^0.0.8, `name: 'Meddleware'`) emits `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `site.webmanifest` and injects the links. The footer's copyright symbol is unchanged.
- No third-party fonts, scripts, styles, images or analytics: the only outside calls are the Sui node, the status page and the read-index the tools exist to use. CI workflows set `DO_NOT_TRACK=1`.
- Takes the embedded tools' releases (access-gate-ui 0.1.49, sealed-storage-ui 0.0.49, token-issuance-ui 0.0.47, treasury-ui 0.0.28, walrus-storage-ui 0.1.70), `@meddleware/wallet-adapter` ^0.0.23 and `@meddleware/ui` ^0.1.42. The installed tree now has one copy of `@meddleware/web-utils` (^0.0.4; the lock takes `@meddleware/walrus-storage-kit` 0.1.40).

### Internal

- New tests: the mark in the header (decorative) and no icon of the app's own, and, over the built `dist/` (run in CI after the build with `REQUIRE_DIST=1`), the icon set once per page, the mark in the bundle and no `◆`, no font file or font host, no third-party load and no origin beyond this site, the explorers and the protocol endpoints.

## [0.1.98] - 2026-11-08

### Changed

- The network selector reads the deployment records instead of a hard-coded option: Mainnet is selectable only when every hosted product (Access Gate, Sealed Storage) has a mainnet record, and until then it reads "Mainnet (not open yet)" with a tooltip that says what is missing or that mainnet is coming. A stored mainnet choice goes back to testnet only while mainnet is not open, with or without a wallet connected.
- Token Issuance no longer carries a committed mainnet fee address: `.env.production` holds testnet only and the mainnet treasury is an optional build argument, so Token Issuance stays closed on mainnet until the build is given one.
- Takes the embedded tools' 2026-11-07 releases (access-gate-ui 0.1.48, sealed-storage-ui 0.0.48, token-issuance-ui 0.0.46, treasury-ui 0.0.27, walrus-storage-ui 0.1.69), `@meddleware/wallet-adapter` ^0.0.22 (one copy, shared by all five), `@meddleware/ui` ^0.1.40, `@meddleware/web-utils` ^0.0.4 and `@meddleware/frontend-config` ^0.0.7. The explorer link beside the connected address uses wallet-adapter's `explorerNetwork`.
- Describes the app for the people who use it (five tools, one wallet connection) in `package.json`, the README, `index.html` and CLAUDE.md.

### Internal

- Shared tooling replaces the local copies: `mw-audit-gate`, `mw-third-party-licenses` and `mw-check-csp-inline` (the `check:dist` script is now `check:csp`, which checks inline scripts against the Dockerfile's CSP by hash), `meddlewareApp`, `vueTestConfig` and the shared tsconfig base. `mw-sync --check` runs in CI; the `chain-wasm` CSP profile is configured in `package.json`.
- New dependencies `@meddleware/access-gate-client` and `@meddleware/sealed-storage-client` (their deployment records feed the selector). New tests for the availability, the selector and the stored-network guard with the records mocked, and an end-to-end check of the selector.

## [0.1.97] - 2026-11-06

### Changed

- Takes the embedded tools' 2026-11-06 releases (access-gate-ui 0.1.47, sealed-storage-ui 0.0.47, token-issuance-ui 0.0.45, treasury-ui 0.0.26 — now swept with data in its own end-to-end build —, walrus-storage-ui 0.1.68), `@meddleware/ui` ^0.1.39, and the Dependabot merges of 2026-11-06 (image bases, dev tools). Adds a README and a `LICENSE`.

## [0.1.96] - 2026-11-06

### Changed

- Takes `@meddleware/access-gate-ui` 0.1.46 (its gate-policy template reads type-check under every `vue-tsc`) and the Dependabot merges of 2026-11-06 (image base `static-server` 0.1.12, dev tools).

## [0.1.95] - 2026-11-05

### Fixed

- The Blockchain view's tab strip sits under the header's real height and publishes its own offset (`--mw-sticky-extra`), so focus is not hidden behind the sticky header and strip (WCAG 2.4.11).

### Security

- CI and the image build scan the production bundle for the e2e harness (`check-prod-bundle` from `@meddleware/frontend-config`), and `src/e2e*.ts` is no longer in the published package.

### Changed

- Takes the embedded tools' 2026-11-05 releases (access-gate-ui 0.1.45, sealed-storage-ui 0.0.46, token-issuance-ui 0.0.44, treasury-ui 0.0.25, walrus-storage-ui 0.1.67) and `@meddleware/ui` ^0.1.38, `@meddleware/design-tokens` ^0.1.13, `@meddleware/web-utils` ^0.0.2, `@meddleware/frontend-config` ^0.0.2, `@meddleware/wallet-adapter` ^0.0.21.

## [0.1.94] - 2026-11-01

- Shared shell, sidebar drawer on phones, tools updated, accessibility gates

## [0.1.93] - 2026-10-30

- Dependency updates (minor and patch groups) and workflow action bumps. No source change.

## [0.1.92] - 2026-10-30

- Point the developer-docs and indexer links at the machine zone (ADR-0005); current @meddleware packages.

## [0.1.91] - 2026-10-24

### Changed

- Machine-zone endpoints (the indexer and the Walrus relays) can be overridden at deploy time by a same-origin `/runtime-config.json` (`@meddleware/ui` 0.1.34 `loadRuntimeConfig`), so the image is built once and moved between Cloudflare zones by configuration (workspace ADR-0005). Without the file the build-time values apply, as before.
- Ships its own `robots.txt` (Content Signals `search=yes, ai-input=yes`) and `llms.txt` instead of static-server's defaults.

## [0.1.90] - 2026-10-24

### Fixed

- The image publish workflow pushed to the old repository name (`dashboard`); it now publishes `dashboard-ui`, the name `config/images.yaml` pins. No code change.

## [0.1.89] - 2026-10-24

### Changed

- Renamed from `dashboard` to `dashboard-ui` (workspace naming convention, `docs/architecture/ADR-0003-naming.md`). No code change beyond names, paths, hostnames and dependency names; the history below keeps the old names.

## [0.1.88] - 2026-10-22

### Changed

- Embedded apps on their latest releases (access-gate-client 0.0.10 stale-indexer fallback, walrus-client 0.0.30 flow fix, nft-gate-client 0.0.18 rules); image base static-server 0.1.11 (Go 1.26.10 standard library, CVE-2026-111943)

## [0.1.87] - 2026-10-19

### Changed

- Image rebuilt without the `VITE_UPLOAD_RELAY_MAX_TIP_MIST` repository variable (deleted; it still held the old 0.05 SUI ceiling and overrode the 0.005 SUI default introduced in the previous release)

## [0.1.86] - 2026-10-19

### Changed

- Embedded apps on their re-priced releases (workspace cost model, D57): token-deployer-ui 0.0.37 (2 SUI deploy fee, 0.005 SUI tip ceiling), walrus-ui 0.1.59, seal-ui 0.0.39; ui ^0.1.32; dependency updates and the Node 26 baseline merged since 0.1.85

## [0.1.85] - 2026-10-18

### Changed

- Embeds the 2026-10-18 builds of every tool: `@meddleware/walrus-ui` ^0.1.58 and
  `@meddleware/token-deployer-ui` ^0.0.36 (both adopt `@meddleware/walrus-relay` 0.1.31: the access-gate
  price is read from the chain and shown, with the payees and network, before the wallet opens),
  `@meddleware/access-gate-ui` ^0.1.37, `@meddleware/seal-ui` ^0.0.38, `@meddleware/treasury-ui` ^0.0.18,
  `@meddleware/dao-ui` ^0.1.34 (retained, not mounted) and `@meddleware/design-tokens` ^0.1.10; their
  clients resolve to `walrus-client` 0.0.28, `access-gate-client` 0.0.9, `seal-client` 0.0.20 and
  `sui-token-client` 0.0.11. `@mysten/sui` ^2.36.0, `vue` ^3.5.44, `vue-router` ^5.4.0 and merged tooling
  updates. One copy of `@mysten/sui` and of each `@meddleware/*` package (`npm ls`).
- Image base: `static-server` 0.1.8 (`sha256:e32cf42b…4000`).
- `npm-publish.yml` `verify` calls `node-ci.yml` (audit gate, signatures, type-check, all linters, tests,
  build, licences, browser smoke test), as the image release does (audit F15).
- The four image builds pass the same build arguments (the registry-mirror builds lacked
  `VITE_WALRUS_RELAY_MAINNET`).
- `.env.example` lists every build input; `.env.production` names the current package;
  `CLAUDE.md` and `SECURITY.md` are current.

### Removed

- `VITE_ACCESS_GATE_PRICE_MIST_TESTNET` (Dockerfile argument, release workflow, docs): walrus-ui and
  token-deployer-ui no longer read it. A build that still sets it ignores it. The repository variable of the
  same name can be deleted.

### Added

- Unit tests (`npm test`, vitest): route table and tool imports, the network selector's mainnet guard (I7),
  design-token use (no `--warning` text colour, no undefined custom property), the build-input inventory,
  and the inline-script guard.
- Browser smoke test (`npm run test:e2e`, Playwright): `/`, every tool tab of `/blockchain` and the legacy
  redirects mount in Chromium with no uncaught error and no network.
- CI builds the image (not pushed) and probes the running container with `scripts/smoke.sh`: non-root user,
  read-only root, the in-image health check, `/` and the SPA fallback with the security headers and the CSP
  (no `'unsafe-inline'` for scripts), immutable `/assets/`, `/THIRD_PARTY_LICENSES`, dot-files refused, POST
  405 (audit F14). A Trivy filesystem scan (vulnerabilities, Dockerfile misconfiguration, secrets; fixable
  CRITICAL/HIGH fail) runs beside it.
- `tests/workflows.test.ts` pins the release gate: both release workflows call `node-ci.yml`, CI runs every
  check above, third-party actions are pinned by SHA, the Dockerfile runs `check:dist` and sets the user.
- `npm run check:dist` (also run by the Dockerfile) fails the build when a built page has an inline script or event-handler attribute
  that the CSP would refuse (audit F13).
- `CHANGELOG.md` (listed in `files` but absent before).

### Fixed

- CI verifies registry signatures with npm 11.20.0: the npm bundled with Node 24.13 (11.6.2) reports
  `EMISSINGSIGNATUREKEY` for the attestations of recently published packages.
