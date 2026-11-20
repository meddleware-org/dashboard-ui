<script setup lang="ts">
// One tool at a time, as tabs over every tool the dashboard hosts (`/tools/<id>`): the address names the open tool, and switching tabs
// updates it (replace, so the back button returns to where the visitor came from, not through every tab). Each tool view is lazy-loaded
// (its dependencies, the Walrus wasm included, load only when its tab is first opened) and kept alive so switching preserves its state.
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppTabNav, UiTabPanel, useStickyOffset, type AppTab } from '@meddleware/ui'
import { TOOLS, toolById } from '../tools.js'

const route = useRoute()
const router = useRouter()

const tabs = computed<AppTab[]>(() => TOOLS.map(({ id, name }) => ({ id, label: name })))
const fromRoute = (): string => (toolById(String(route.params.tool ?? ''))?.id ?? TOOLS[0]?.id ?? '')
const active = ref(fromRoute())

watch(() => route.params.tool, () => {
  active.value = fromRoute()
})
watch(active, (id) => {
  if (route.params.tool !== id) void router.replace({ name: 'tool', params: { tool: id } })
})

const activeComp = computed(() => toolById(active.value)?.view)

// The tab strip sticks under the header: publish its height so a focused field is never left behind either of them (WCAG 2.4.11).
const strip = ref<{ $el?: unknown } | null>(null)
useStickyOffset(strip, '--mw-sticky-extra')
</script>

<template>
  <section aria-labelledby="tools-console-title" class="tool-console">
    <h2 id="tools-console-title" class="mw-visually-hidden">Tools</h2>
    <AppTabNav v-model="active" :tabs="tabs" id-prefix="tools" variant="raised" size="lg" flush ref="strip" class="tabs" aria-label="Tools" />

    <UiTabPanel id-prefix="tools" :tab="active" class="content">
      <KeepAlive>
        <component :is="activeComp" :key="active" />
      </KeepAlive>
    </UiTabPanel>
  </section>
</template>

<style scoped>
.tool-console {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* The tool tabs stay in view under the sticky header while the page scrolls: under its real height, which is more than its minimum when
   the header wraps on a phone. */
.tabs {
  position: sticky;
  top: var(--mw-header-offset, var(--mw-header-height));
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
