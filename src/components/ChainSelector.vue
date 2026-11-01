<script setup lang="ts">
// The chain choice shown in the sidebar while the Blockchain section is open: one entry per chain in `CHAINS`, the chosen one marked as
// the current item. With a single chain it still names where the tools below belong.
import { SidebarGroup, SidebarItem } from '@meddleware/ui'
import { CHAINS, DEFAULT_CHAIN } from '../chains.js'

const model = defineModel<string>({ default: DEFAULT_CHAIN })
</script>

<template>
  <SidebarGroup :label="CHAINS.length > 1 ? 'Select chain' : 'Chain'" :level="1">
    <SidebarItem v-for="c in CHAINS" :key="c.id" :label="c.label" :icon="c.icon" :active="model === c.id" @click="model = c.id" />
  </SidebarGroup>
</template>
