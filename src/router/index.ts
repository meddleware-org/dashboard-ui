import { createRouter, createWebHistory } from 'vue-router'

// Two org-level sections:
//   /            → Treasury console (organisation accounting), the default landing route.
//   /blockchain  → Blockchain tools hub: a qt-style tabbed interface over the Sui tools.
// Each view/tool renders inline via the component exported from its own package (no iframes),
// sharing the dashboard's wallet through the @meddleware/wallet-adapter singleton. Routes are
// lazy so a tool's deps (incl. the Walrus wasm) load only on navigation.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'treasury',
      meta: { title: 'Treasury' },
      component: () => import('@meddleware/treasury-ui').then((m) => m.TreasuryView),
    },
    {
      path: '/blockchain',
      name: 'blockchain',
      meta: { title: 'Blockchain tools' },
      component: () => import('../views/BlockchainView.vue'),
    },
    // DAO is retired from the dashboard until governance is usable: there is no route for it (the dao-ui package is not a dependency).

    // Legacy per-tool paths now live as tabs inside /blockchain — redirect old bookmarks.
    { path: '/walrus', redirect: '/blockchain' },
    { path: '/walrus-storage', redirect: '/blockchain' },
    { path: '/sealed-storage', redirect: '/blockchain' },
    { path: '/access-gate', redirect: '/blockchain' },
    { path: '/token-deployer', redirect: '/blockchain' },
    { path: '/token-issuance', redirect: '/blockchain' },
  ],
})

export default router
