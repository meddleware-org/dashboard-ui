# @meddleware/dashboard-ui

The organisation-level Meddleware dashboard, served at [`dash.meddleware.co.uk`](https://dash.meddleware.co.uk): a Vue 3 + Vite single-page
app that embeds each tool from its own package (Treasury, and under *Blockchain* the Walrus Storage, Sealed Storage, Access Gate and Token
Issuance consoles) inside one shell with a chain selector. It holds no financial logic: every number is read from the chain by the embedded tool.

- **Stack:** Vue 3, Vite, `@meddleware/design-tokens`, `@meddleware/ui`, `@meddleware/wallet-adapter`.
- **Image:** `quay.io/meddleware-org/dashboard-ui`, built on `quay.io/meddleware-org/static-server` (see `Dockerfile`).
- **Context for contributors and agents:** [CLAUDE.md](CLAUDE.md); the security review is `docs/audit/dashboard-ui-audit.md`.
- **Licence:** BSD Zero Clause ([0BSD](LICENSE)).

## Develop

```bash
npm ci
npm run dev          # Vite dev server
npm test             # unit tests (Vitest)
npm run test:e2e     # builds the e2e variant and runs the Playwright sweep (E2E_BROWSERS=all adds Firefox, WebKit and two mobile profiles)
npm run lint && npm run type-check
npm run build && npm run check:bundle && npm run check:dist
```

`npm run check:bundle` fails if a test hook reached the production bundle; `npm run check:dist` fails if the build has an inline script the CSP would refuse.
