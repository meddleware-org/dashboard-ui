<script setup lang="ts">
// The dashboard shell: header, sidebar (a drawer on a phone), the routed tool, footer. The shell hosts the one shared wallet connection and
// the network choice; every tool view renders inline from its own package and reads them from the @meddleware/wallet-adapter singleton.
// Vue, the router, the shared components and composables of @meddleware/ui, the helpers of @meddleware/web-utils, the shared wallet and network state of @meddleware/wallet-adapter, and this app's own modules.
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  AppFooter,
  AppHeader,
  AppSidebar,
  BrandMark,
  ColorModeControl,
  CopyableAddress,
  CopyrightLine,
  ExplorerLink,
  SidebarGroup,
  SidebarItem,
  StatusWidget,
  UiAppShell,
  UiButton,
  UiStatusDot,
  useColorMode,
} from '@meddleware/ui'
import { suiExplorerUrl } from '@meddleware/web-utils'
import { useNetwork, useWallet } from '@meddleware/wallet-adapter'
import { TOOLS, toolById } from './tools.js'
import NetworkSelector from './components/NetworkSelector.vue'
import { keepToOpenNetwork } from './network.js'

// The colour mode (dark by default) and whether the visitor asked to remember it on this device.
const { mode, remember } = useColorMode('dark')
// The current route, and the shared network choice (kept on a network the dashboard offers).
const route = useRoute()
const { network, explorerNetwork } = useNetwork()
keepToOpenNetwork()

// The menu: the tools (each opens in the tool console), then what is about Meddleware itself (copy review 2, approved 2026-11-20).
// The id of the open tool, when the route is a tool page.
const currentTool = computed(() => (route.name === 'tool' ? String(route.params.tool) : undefined))

// The dashboard hosts the single shared wallet connection for every inline tool view. It requests the superset of features the tools need so
// the connect control only offers wallets capable of every operation; individual tools still feature-guard at call time.
// The wallet state.
const { account, disconnect } = useWallet({ requiredFeatures: ['sui:signTransaction', 'sui:signPersonalMessage'] })

// Where the footer links to: the user documentation and the developer documentation; a build can point them elsewhere.
const DOCS_URL = import.meta.env.VITE_DOCS_URL || 'https://docs.meddleware.co.uk/'
const DEV_URL = import.meta.env.VITE_DEV_URL || 'https://meddleware.dev/'

// SuiVision has no localnet explorer, so the address links to it only on a public network; on localnet it is copy-only.
// Whether the connected address can link to an explorer (a local network has none).
const hasExplorer = computed(() => network.value !== 'localnet')
// The page's one heading (visually hidden): the open tool's name, or the route's title.
const title = computed(() => toolById(currentTool.value)?.name ?? (typeof route.meta.title === 'string' ? route.meta.title : 'Meddleware'))
</script>

<template>
  <UiAppShell>
    <!-- Header: the brand link and the colour-mode control. -->
    <template #header>
      <AppHeader variant="dark" sidebar-id="main-nav" menu-label="Open the menu">
        <template #brand>
          <RouterLink to="/" class="brand-link"><BrandMark class="mark" /> Meddleware</RouterLink>
        </template>
        <template #actions>
          <ColorModeControl v-model="mode" v-model:remember="remember" />
        </template>
      </AppHeader>
    </template>

    <!-- Sidebar: the tools, then what is about Meddleware itself, the network selector once a wallet is connected, and the wallet at the foot. -->
    <template #sidebar>
      <!-- The navigation landmark, labelled "Dashboard"; a drawer on a phone. -->
      <AppSidebar id="main-nav" variant="dark" nav-label="Dashboard">
        <!-- The tools: "All tools", then one item per tool. -->
        <SidebarGroup label="Tools" :level="1">
          <RouterLink v-slot="{ href, navigate }" to="/" custom>
            <SidebarItem label="All tools" icon="▦" :href="href" :active="route.name === 'tools'" @click="navigate" />
          </RouterLink>
          <RouterLink v-for="t in TOOLS" :key="t.id" v-slot="{ href, navigate }" :to="`/tools/${t.id}`" custom>
            <SidebarItem :label="t.name" :icon="t.icon" :href="href" :active="currentTool === t.id" @click="navigate" />
          </RouterLink>
        </SidebarGroup>
        <!-- The treasury, and two links out: the standards page and the public roadmap. -->
        <SidebarGroup label="About Meddleware" :level="1">
          <RouterLink v-slot="{ href, navigate }" to="/treasury" custom>
            <SidebarItem label="Treasury" icon="🏦" :href="href" :active="route.name === 'treasury'" @click="navigate" />
          </RouterLink>
          <SidebarItem label="Standards we use ↗" icon="📐" href="https://meddleware.dev/platform/standards" />
          <SidebarItem label="Roadmap ↗" icon="🗺" href="https://roadmap.meddleware.co.uk" />
        </SidebarGroup>

        <!-- The network selector appears once a wallet is connected. -->
        <template #body>
          <NetworkSelector v-if="account" />
        </template>

        <!-- The foot: the connected address with its explorer link and a disconnect button, or a plain note that no wallet is connected. -->
        <template #foot>
          <p v-if="account" class="foot">
            <CopyableAddress :address="account.address">
              <ExplorerLink v-if="hasExplorer" :href="suiExplorerUrl('account', account.address, explorerNetwork)" :value="account.address" />
            </CopyableAddress>
            <UiButton variant="link" size="sm" @click="disconnect">Disconnect</UiButton>
          </p>
          <p v-else class="foot"><UiStatusDot status="unknown" size="sm" /> No wallet connected. Only tools that need one will ask.</p>
        </template>
      </AppSidebar>
    </template>

    <!-- The page heading is visually hidden because each screen draws its own visible headings. -->
    <h1 class="mw-visually-hidden">{{ title }}</h1>
    <!-- The routed screen. -->
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>

    <!-- Footer: the copyright line (the Kopimi notice), the platform status and a link to the treasury. -->
    <template #footer>
      <!-- The footer links to the docs and the developer site. -->
      <AppFooter variant="dark" :docs-url="DOCS_URL" :dev-url="DEV_URL">
        <template #start>
          <!-- The shared copyright notice: the Kopimi symbol, the year, the organisation and the statement. -->
          <CopyrightLine symbol-variant="kopimi" organisation-name="Meddleware" rights-statement="jam" />
        </template>
        <!-- The platform status, read from the public status service. -->
        <StatusWidget />
        <template #end>
          <!-- Meddleware's own funds, in public: in the footer as on the landing page. -->
          <RouterLink to="/treasury">Treasury</RouterLink>
        </template>
      </AppFooter>
    </template>
  </UiAppShell>
</template>

<style scoped>
/* The brand link is plain text with the mark beside it. */
.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  color: inherit;
  text-decoration: none;
}
/* The mark takes the accent colour. */
.mark {
  color: var(--accent);
}
/* The sidebar foot: the wallet address and its disconnect button, wrapping on a narrow sidebar. */
.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2xs);
  margin: 0;
  padding: var(--space-xs) var(--space-sm);
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: var(--font-size-sm);
}
</style>
