<script setup lang="ts">
// The dashboard shell: header, sidebar (a drawer on a phone), the routed tool, footer. The shell hosts the one shared wallet connection and
// the network choice; every tool view renders inline from its own package and reads them from the @meddleware/wallet-adapter singleton.
import { computed, ref, watch } from 'vue'
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
import { DEFAULT_CHAIN } from './chains.js'
import ChainSelector from './components/ChainSelector.vue'
import NetworkSelector from './components/NetworkSelector.vue'
import { keepToOpenNetwork } from './network.js'

const { mode } = useColorMode('dark')
const route = useRoute()
const { network, explorerNetwork } = useNetwork()
keepToOpenNetwork()

// The sidebar has two modes. Top level shows the organisation sections (Treasury, Blockchain). Entering the Blockchain section swaps it to a
// chain selector with an up-one-level control that returns to the top level without leaving the page. The mode follows the route (so a
// direct load, a reload or a back-forward lands right); `upOneLevel` sets 'top' without a route change, and that override stands until the
// next navigation.
type SidebarView = 'top' | 'blockchain'
const sidebarView = ref<SidebarView>('top')
const selectedChain = ref(DEFAULT_CHAIN)
watch(
  () => route.path,
  (p) => {
    sidebarView.value = p === '/blockchain' ? 'blockchain' : 'top'
  },
  { immediate: true },
)
const isTreasury = computed(() => route.path === '/')
const isBlockchain = computed(() => route.path === '/blockchain')
const upOneLevel = (): void => {
  sidebarView.value = 'top'
}
// Already on /blockchain: the link does not navigate, but the section still opens its chain selector.
const openBlockchain = (): void => {
  sidebarView.value = 'blockchain'
}

// The dashboard hosts the single shared wallet connection for every inline tool view. It requests the superset of features the tools need so
// the connect control only offers wallets capable of every operation; individual tools still feature-guard at call time.
const { account, disconnect } = useWallet({ requiredFeatures: ['sui:signTransaction', 'sui:signPersonalMessage'] })

const DOCS_URL = import.meta.env.VITE_DOCS_URL || 'https://docs.meddleware.co.uk/'
const DEV_URL = import.meta.env.VITE_DEV_URL || 'https://meddleware.dev/'

// SuiVision has no localnet explorer, so the address links to it only on a public network; on localnet it is copy-only.
const hasExplorer = computed(() => network.value !== 'localnet')
const title = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : 'Meddleware'))
</script>

<template>
  <UiAppShell>
    <template #header>
      <AppHeader variant="dark" sidebar-id="main-nav" menu-label="Open the menu">
        <template #brand>
          <RouterLink to="/" class="brand-link"><BrandMark class="mark" /> Meddleware</RouterLink>
        </template>
        <template #actions>
          <ColorModeControl v-model="mode" />
        </template>
      </AppHeader>
    </template>

    <template #sidebar>
      <AppSidebar id="main-nav" variant="dark" nav-label="Dashboard">
        <!-- Top level: organisation sections -->
        <template v-if="sidebarView === 'top'">
          <SidebarGroup label="Organisation" :level="1">
            <RouterLink v-slot="{ href, navigate }" to="/" custom>
              <SidebarItem label="Treasury" icon="🏦" :href="href" :active="isTreasury" @click="navigate" />
            </RouterLink>
            <RouterLink v-slot="{ href, navigate }" to="/blockchain" custom>
              <SidebarItem
                label="Blockchain"
                icon="⛓"
                :href="href"
                :active="isBlockchain"
                @click="(e: MouseEvent) => { navigate(e); openBlockchain() }"
              />
            </RouterLink>
          </SidebarGroup>
        </template>

        <!-- Blockchain section: up-one-level + the chain selector -->
        <template v-else>
          <SidebarItem label="Back" icon="←" @click="upOneLevel" />
          <ChainSelector v-model="selectedChain" />
        </template>

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
          <p v-else class="foot"><UiStatusDot status="unknown" size="sm" /> No wallet connected</p>
        </template>
      </AppSidebar>
    </template>

    <h1 class="mw-visually-hidden">{{ title }}</h1>
    <RouterView v-slot="{ Component, route: current }">
      <component :is="Component" :chain="current.name === 'blockchain' ? selectedChain : undefined" />
    </RouterView>

    <template #footer>
      <AppFooter variant="dark" :docs-url="DOCS_URL" :dev-url="DEV_URL">
        <template #start>
          <CopyrightLine symbol-variant="kopimi" organisation-name="Meddleware" rights-statement="jam" />
        </template>
        <StatusWidget />
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
