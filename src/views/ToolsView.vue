<script setup lang="ts">
// The dashboard's first screen: the tools available now, each card opening the tool here (copy review 2, approved 2026-11-20). The
// platform is not defined by these tools; the list grows.
import { useRouter } from 'vue-router'
import { UiCard } from '@meddleware/ui'
import { useNetwork } from '@meddleware/wallet-adapter'
import { TOOLS, networkWords } from '../tools.js'

const router = useRouter()
const { network } = useNetwork()

/** A card's address: absolute, because UiCard accepts only an absolute http(s) URL (safeHref). */
const toolHref = (id: string): string => new URL(`/tools/${id}`, window.location.origin).href

/** A card's link is a plain anchor (one tab stop per card); open a dashboard link in place, without reloading the page. */
function openInPlace(e: MouseEvent): void {
  const a = (e.target as HTMLElement | null)?.closest('a')
  if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const url = new URL(a.href)
  if (url.origin !== window.location.origin) return
  e.preventDefault()
  void router.push(url.pathname)
}
</script>

<template>
  <section class="tools" aria-labelledby="tools-heading">
    <header class="intro">
      <h2 id="tools-heading">Tools</h2>
      <p>Open tools you can use here, take everything when you leave, and run yourself. More are on the way.</p>
    </header>
    <!-- Delegated: one listener for the cards' links. -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <ul class="grid" role="list" @click="openInPlace">
      <UiCard v-for="tool in TOOLS" :key="tool.id" as="li" plain :level="3" :title="tool.title" :href="toolHref(tool.id)">
        <template #icon><span aria-hidden="true">{{ tool.icon }}</span></template>
        <p>{{ tool.description }}</p>
        <p class="meta">{{ tool.name }} · runs on {{ tool.runsOn }} · {{ networkWords(network) }}</p>
      </UiCard>
    </ul>
    <p class="new-here">New here? <a href="https://meddleware.co.uk/#for-people">Choose your path</a>.</p>
  </section>
</template>

<style scoped>
.tools {
  max-width: var(--mw-tool-content-max);
  margin-inline: auto;
  padding: var(--space-lg) var(--space-sm);
}

.intro {
  margin-bottom: var(--space-md);
}

.intro h2 {
  margin: 0 0 var(--space-2xs);
}

.intro p,
.meta {
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
}

.grid :deep(.mw-card__title) {
  font-size: var(--font-size-md);
}

.meta {
  margin: var(--space-2xs) 0 0;
  font-size: var(--font-size-sm);
}

.new-here {
  margin-top: var(--space-md);
}
</style>
