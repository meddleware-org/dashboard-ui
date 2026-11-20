<script setup lang="ts">
// The dashboard shell: header, sidebar (a drawer on a phone), the routed tool, footer. The shell hosts the one shared wallet connection and
// the network choice; every tool view renders inline from its own package and reads them from the @meddleware/wallet-adapter singleton.
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

const { mode, remember } = useColorMode('dark')
const route = useRoute()
const { network, explorerNetwork } = useNetwork()
keepToOpenNetwork()

// The menu: the tools (each opens in the tool console), then what is about Meddleware itself (copy review 2, approved 2026-11-20).
const currentTool = computed(() => (route.name === 'tool' ? String(route.params.tool) : undefined))

// The dashboard hosts the single shared wallet connection for every inline tool view. It requests the superset of features the tools need so
// the connect control only offers wallets capable of every operation; individual tools still feature-guard at call time.
const { account, disconnect } = useWallet({ requiredFeatures: ['sui:signTransaction', 'sui:signPersonalMessage'] })

const DOCS_URL = import.meta.env.VITE_DOCS_URL || 'https://docs.meddleware.co.uk/'
const DEV_URL = import.meta.env.VITE_DEV_URL || 'https://meddleware.dev/'

// SuiVision has no localnet explorer, so the address links to it only on a public network; on localnet it is copy-only.
const hasExplorer = computed(() => network.value !== 'localnet')
const title = computed(() => toolById(currentTool.value)?.name ?? (typeof route.meta.title === 'string' ? route.meta.title : 'Meddleware'))
</script>

<template>
  <UiAppShell>
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

    <template #sidebar>
      <AppSidebar id="main-nav" variant="dark" nav-label="Dashboard">
        <SidebarGroup label="Tools" :level="1">
          <RouterLink v-slot="{ href, navigate }" to="/" custom>
            <SidebarItem label="All tools" icon="▦" :href="href" :active="route.name === 'tools'" @click="navigate" />
          </RouterLink>
          <RouterLink v-for="t in TOOLS" :key="t.id" v-slot="{ href, navigate }" :to="`/tools/${t.id}`" custom>
            <SidebarItem :label="t.name" :icon="t.icon" :href="href" :active="currentTool === t.id" @click="navigate" />
          </RouterLink>
        </SidebarGroup>
        <SidebarGroup label="About Meddleware" :level="1">
          <RouterLink v-slot="{ href, navigate }" to="/treasury" custom>
            <SidebarItem label="Treasury" icon="🏦" :href="href" :active="route.name === 'treasury'" @click="navigate" />
          </RouterLink>
          <SidebarItem label="Standards we use ↗" icon="📐" href="https://meddleware.dev/platform/standards" />
          <SidebarItem label="Roadmap ↗" icon="🗺" href="https://roadmap.meddleware.co.uk" />
        </SidebarGroup>

        <template #body>
          <NetworkSelector v-if="account" />
        </template>

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

    <h1 class="mw-visually-hidden">{{ title }}</h1>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>

    <template #footer>
      <AppFooter variant="dark" :docs-url="DOCS_URL" :dev-url="DEV_URL">
        <template #start>
          <CopyrightLine symbol-variant="kopimi" organisation-name="Meddleware" rights-statement="jam" />
        </template>
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
.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  color: inherit;
  text-decoration: none;
}
.mark {
  color: var(--accent);
}
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
