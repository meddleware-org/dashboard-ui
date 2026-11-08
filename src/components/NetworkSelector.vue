<script setup lang="ts">
// Network selector for the dashboard sidebar. Reads and writes the shared useNetwork() singleton so every embedded tool view reacts to the
// chosen network immediately. Mainnet is selectable only when the deployment records say it is live (`src/network.ts`); until then it is
// listed, disabled, with what is missing.
import { ref, watch } from 'vue'
import { UiFormField, UiSelect, UiTextField } from '@meddleware/ui'
import { useNetwork, type MwNetwork } from '@meddleware/wallet-adapter'
import { networkOptions } from '../network.js'

const { network, localnetRpc, setNetwork, setLocalnetRpc } = useNetwork()

const localnetInput = ref(localnetRpc.value)
// Sync the input when the singleton changes externally (for example another tab, through a storage event).
watch(localnetRpc, (v) => {
  localnetInput.value = v
})

function onNetworkChange(e: Event): void {
  setNetwork((e.target as HTMLSelectElement).value as MwNetwork)
}

function commitLocalnetUrl(): void {
  const url = localnetInput.value.trim()
  if (url) setLocalnetRpc(url)
}

const options = networkOptions()
</script>

<template>
  <section class="network" aria-label="Network">
    <UiFormField id="ns-select" label="Network">
      <template #default="{ attrs }">
        <UiSelect :id="attrs.id" :model-value="network" @change="onNetworkChange">
          <option v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled" :title="o.title">{{ o.label }}</option>
        </UiSelect>
      </template>
    </UiFormField>
    <UiTextField
      v-if="network === 'localnet'"
      id="ns-localnet-url"
      v-model="localnetInput"
      type="url"
      label="RPC URL"
      placeholder="http://127.0.0.1:9000"
      @blur="commitLocalnetUrl"
      @keydown.enter="commitLocalnetUrl"
    />
  </section>
</template>

<style scoped>
.network {
  padding: var(--space-2xs) var(--space-sm) var(--space-xs);
  border-block: 1px solid var(--border);
}
</style>
