// The dashboard's router: three screens (the tool list, the tool console and the treasury) and the redirects from addresses that earlier
// versions used. The route table below says what each address shows.
import { createRouter, createWebHistory } from 'vue-router'
import { toolById } from '../tools.js'

// The dashboard (copy review 2, approved 2026-11-20):
//   /             → Tools: the tools available now, a card each.
//   /tools/<id>   → the tool console: every tool as a tab, the address naming the open one.
//   /treasury     → Meddleware's own funds, in public (also linked from the footer).
// Each tool renders inline from its own package (no iframes), sharing the dashboard's wallet through the @meddleware/wallet-adapter
// singleton. Routes are lazy so a tool's dependencies (the Walrus wasm included) load only on navigation.
/** The one router the app uses (history mode; the base comes from Vite). */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'tools', meta: { title: 'Tools' }, component: () => import('../views/ToolsView.vue') },
    {
      path: '/tools/:tool',
      name: 'tool',
      // The page title is the open tool's name (App.vue reads it from the route).
      meta: { title: 'Tools' },
      component: () => import('../views/ToolConsole.vue'),
      beforeEnter: (to) => (toolById(String(to.params.tool)) ? true : { name: 'tools' }),
    },
    { path: '/tools', redirect: '/' },
    { path: '/treasury', name: 'treasury', meta: { title: 'Treasury' }, component: () => import('@meddleware/treasury-ui').then((m) => m.TreasuryView) },
    // DAO is retired from the dashboard until governance is usable: there is no route for it (the dao-ui package is not a dependency).

    // Old addresses: the tools section was /blockchain, and each tool once had its own path.
    { path: '/blockchain', redirect: '/' },
    { path: '/walrus', redirect: '/tools/walrus-storage' },
    { path: '/walrus-storage', redirect: '/tools/walrus-storage' },
    { path: '/sealed-storage', redirect: '/tools/sealed-storage' },
    { path: '/access-gate', redirect: '/tools/access-gate' },
    { path: '/token-deployer', redirect: '/tools/token-issuance' },
    { path: '/token-issuance', redirect: '/tools/token-issuance' },
  ],
})

export default router
