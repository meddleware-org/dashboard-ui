<script setup lang="ts">
// Blockchain tools hub — a qt-style tabbed console over one chain's tools. Today the only
// chain is Sui; the `chain` prop is the sidebar's choice, so a second chain switches the tool set without a rewrite. Each tool view is lazy-loaded (its deps, incl. the Walrus
// wasm, load only when its tab is first opened) and kept alive so switching tabs preserves state.
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { AppTabNav, UiTabPanel, type AppTab } from '@meddleware/ui'

import { CHAINS, DEFAULT_CHAIN } from '../chains.js'

const props = withDefaults(defineProps<{ chain?: string }>(), { chain: DEFAULT_CHAIN })
const chainLabel = computed(() => CHAINS.find((c) => c.id === props.chain)?.label ?? props.chain)

interface Tool extends AppTab {
  comp: ReturnType<typeof defineAsyncComponent>
}

// Per-chain tool sets. Add a new key when onboarding a chain.
const TOOLSETS: Record<string, Tool[]> = {
  sui: [
    { id: 'walrus-storage', label: 'Walrus Storage', comp: defineAsyncComponent(() => import('@meddleware/walrus-storage-ui').then((m) => m.WalrusStorageView)) },
    { id: 'sealed-storage', label: 'Sealed Storage', comp: defineAsyncComponent(() => import('@meddleware/sealed-storage-ui').then((m) => m.SealedStorageView)) },
    { id: 'access-gate', label: 'Access Gate', comp: defineAsyncComponent(() => import('@meddleware/access-gate-ui').then((m) => m.AccessGateView)) },
    { id: 'token-issuance', label: 'Token Issuance', comp: defineAsyncComponent(() => import('@meddleware/token-issuance-ui').then((m) => m.TokenIssuanceView)) },
  ],
}

const tools = computed<Tool[]>(() => TOOLSETS[props.chain] ?? [])
const tabs = computed<AppTab[]>(() => tools.value.map(({ id, label }) => ({ id, label })))
const active = ref(tools.value[0]?.id ?? '')

// Reset to the first tool when the chain changes.
watch(
  () => props.chain,
  () => {
    active.value = tools.value[0]?.id ?? ''
  },
)

const activeComp = computed(() => tools.value.find((t) => t.id === active.value)?.comp)
</script>

<template>
  <section aria-labelledby="blockchain-title" class="blockchain-view">
    <h2 id="blockchain-title" class="mw-visually-hidden">{{ chainLabel }} tools</h2>
    <AppTabNav v-model="active" :tabs="tabs" id-prefix="blockchain" variant="raised" size="lg" flush class="tabs" :aria-label="`${chainLabel} tools`" />

    <UiTabPanel id-prefix="blockchain" :tab="active" class="content">
      <KeepAlive>
        <component :is="activeComp" :key="active" />
      </KeepAlive>
    </UiTabPanel>
  </section>
</template>

<style scoped>
.blockchain-view {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* The tool tabs stay in view under the sticky header while the page scrolls. */
.tabs {
  position: sticky;
  top: var(--mw-header-height);
  z-index: var(--z-raised);
  background: var(--bg);
}

/* The content column is centred and capped at the tool width; the inline padding grows with the spare width. */
.content {
  flex: 1;
  padding-block: var(--space-lg) var(--space-md);
  padding-inline: max(var(--space-sm), calc((100% - var(--mw-tool-content-max)) / 2 + var(--space-sm)));
}
</style>
