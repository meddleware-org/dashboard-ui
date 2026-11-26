<script setup lang="ts">
// Network selector for the dashboard sidebar. Reads and writes the shared useNetwork() singleton so every embedded tool view reacts to the
// chosen network immediately. Mainnet is selectable only when the deployment records say it is live (`src/network.ts`); until then it is
// listed, disabled and marked "not available yet".
// Vue, the form components, the shared network state and the option list.
import { ref, watch } from 'vue'
import { UiFormField, UiSelect, UiTextField } from '@meddleware/ui'
import { useNetwork, type MwNetwork } from '@meddleware/wallet-adapter'
import { networkOptions } from '../network.js'

// The shared network singleton: the choice and, for a local network, its address.
const { network, localnetRpc, setNetwork, setLocalnetRpc } = useNetwork()

// The text field's working copy of the local network address.
const localnetInput = ref(localnetRpc.value)
// Sync the input when the singleton changes externally (for example another tab, through a storage event).
watch(localnetRpc, (v) => {
  localnetInput.value = v
})

/** Apply the choice made in the select to the shared network. */
function onNetworkChange(e: Event): void {
  setNetwork((e.target as HTMLSelectElement).value as MwNetwork)
}

/** Store the typed local address when it is not empty (on blur and on Enter). */
function commitLocalnetUrl(): void {
  const url = localnetInput.value.trim()
  if (url) setLocalnetRpc(url)
}

// The options, computed once from the deployment records.
const options = networkOptions()
</script>

<template>
  <section class="network" aria-label="Network">
    <UiFormField id="ns-select" label="Network">
      <template #default="{ attrs }">
        <UiSelect :id="attrs.id" :model-value="network" @change="onNetworkChange">
          <option v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
        </UiSelect>
      </template>
    </UiFormField>
    <!-- The local node's address; shown only for the local network. -->
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
/* A band between the sidebar groups, ruled above and below. */
.network {
  padding: var(--space-2xs) var(--space-sm) var(--space-xs);
  border-block: 1px solid var(--border);
}
</style>
