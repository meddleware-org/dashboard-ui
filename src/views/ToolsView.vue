<script setup lang="ts">
// The dashboard's first screen: the tools available now, each card opening the tool here (copy review 2, approved 2026-11-20). The
// platform is not defined by these tools; the list grows.
// The router, the card component, the shared network and the tool list.
import { useRouter } from 'vue-router'
import { UiCard } from '@meddleware/ui'
import { useNetwork } from '@meddleware/wallet-adapter'
import { TOOLS, networkWords } from '../tools.js'

// The router (for in-place navigation) and the network (named on each card).
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
    <!-- What the dashboard is, in one sentence. -->
    <header class="intro">
      <h2 id="tools-heading">Tools</h2>
      <p>Open tools you can use here, take everything when you leave, and run yourself. More are on the way.</p>
    </header>
    <!-- Delegated: one listener for the cards' links. -->
    <!-- The card grid. -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <ul class="grid" role="list" @click="openInPlace">
      <!-- One card per tool: its heading, description and a line saying what it runs on and the network. -->
      <UiCard v-for="tool in TOOLS" :key="tool.id" as="li" plain :level="3" :title="tool.title" :href="toolHref(tool.id)">
        <!-- The icon is decoration only, so it is hidden from assistive technology. -->
        <template #icon><span aria-hidden="true">{{ tool.icon }}</span></template>
        <!-- The description is plain text from the tool list. -->
        <p>{{ tool.description }}</p>
        <p class="meta">{{ tool.name }} · runs on {{ tool.runsOn }} · {{ networkWords(network) }}</p>
      </UiCard>
    </ul>
    <!-- A link for visitors who do not know where to start (the landing page's role guide). -->
    <p class="new-here">New here? <a href="https://meddleware.co.uk/#for-people">Choose your path</a>.</p>
  </section>
</template>

<style scoped>
/* The screen is centred and capped at the tool width. */
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
/* The card's small print: the tool, what it runs on and the network. */
.meta {
  color: var(--muted);
}

/* A responsive grid: as many columns as fit at 20rem, no list markers. */
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

/* Space above the pointer. */
.new-here {
  margin-top: var(--space-md);
}
</style>
