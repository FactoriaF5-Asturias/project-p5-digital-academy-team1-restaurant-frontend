<script setup>
import { computed, onMounted } from 'vue'
import { useCheckoutStore } from '../stores/checkout'
import { useTableDetection } from '../composables/useTableDetection'

const checkoutStore = useCheckoutStore()
const { isLoading: isDetectingTable, error: tableDetectionError, detectTable } = useTableDetection()

// Solo se intenta detectar la mesa al cargar la Cesta: si el canal ya es
// "sala" y todavía no hay ningún número de mesa guardado (ni manual ni
// auto-detectado de una visita anterior en esta misma sesión).
onMounted(() => {
  if (checkoutStore.channel === 'sala' && !checkoutStore.tableNumber) {
    detectTable()
  }
})

// Cada campo se expone como un computed con get/set: lee del store
// y, al escribir (por ejemplo desde v-model), llama a la acción correspondiente.
const tableNumber = computed({
  get: () => checkoutStore.tableNumber ?? '',
  set: (value) => checkoutStore.setTableNumber(value),
})

function updateAddressField(field, value) {
  checkoutStore.setAddress({ ...(checkoutStore.address ?? {}), [field]: value })
}

const street = computed({
  get: () => checkoutStore.address?.street ?? '',
  set: (value) => updateAddressField('street', value),
})

const city = computed({
  get: () => checkoutStore.address?.city ?? '',
  set: (value) => updateAddressField('city', value),
})

const postalCode = computed({
  get: () => checkoutStore.address?.postalCode ?? '',
  set: (value) => updateAddressField('postalCode', value),
})
</script>

<template>
  <section class="channel-selector" aria-label="Canal de pedido">
    <div class="channel-selector__toggle" role="group" aria-label="Elige cómo quieres tu pedido">
      <button
        type="button"
        class="channel-selector__toggle-btn"
        :class="{ 'channel-selector__toggle-btn--active': checkoutStore.channel === 'sala' }"
        :aria-pressed="checkoutStore.channel === 'sala'"
        @click="checkoutStore.setChannel('sala')"
      >
        En sala
      </button>
      <button
        type="button"
        class="channel-selector__toggle-btn"
        :class="{ 'channel-selector__toggle-btn--active': checkoutStore.channel === 'domicilio' }"
        :aria-pressed="checkoutStore.channel === 'domicilio'"
        @click="checkoutStore.setChannel('domicilio')"
      >
        A domicilio
      </button>
    </div>

     <div v-if="checkoutStore.channel === 'sala'" class="channel-selector__field">
      <label for="table-number" class="channel-selector__label">
        Número de mesa
        <span v-if="checkoutStore.isTableAutoDetected" class="channel-selector__badge">
          Auto-detectada
        </span>
      </label>

      <p v-if="isDetectingTable" class="channel-selector__hint">
        Detectando la mesa de tu dispositivo...
      </p>
      <p v-else-if="tableDetectionError" class="channel-selector__hint channel-selector__hint--error">
        {{ tableDetectionError }} Puedes introducirla manualmente.
      </p>

      <input
        id="table-number"
        v-model="tableNumber"
        type="text"
        class="channel-selector__input"
        placeholder="Ej. 12"
      />
    </div>

    <div v-else class="channel-selector__address">
      <div class="channel-selector__field">
        <label for="address-street" class="channel-selector__label">Calle y número</label>
        <input id="address-street" v-model="street" type="text" class="channel-selector__input" />
      </div>
      <div class="channel-selector__field">
        <label for="address-city" class="channel-selector__label">Ciudad</label>
        <input id="address-city" v-model="city" type="text" class="channel-selector__input" />
      </div>
      <div class="channel-selector__field">
        <label for="address-postal-code" class="channel-selector__label">Código postal</label>
        <input
          id="address-postal-code"
          v-model="postalCode"
          type="text"
          class="channel-selector__input"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "../style.css";

.channel-selector {
  @apply flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface p-4;
}
.channel-selector__toggle {
  @apply flex gap-2 rounded-full border border-outline-variant p-1;
}
.channel-selector__toggle-btn {
  @apply flex-1 rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-primary-container;
}
.channel-selector__toggle-btn--active {
  @apply bg-primary text-on-primary hover:opacity-90;
}
.channel-selector__field {
  @apply flex flex-col gap-1;
}
.channel-selector__label {
  @apply text-sm font-medium text-on-surface-variant;
}
.channel-selector__badge {
  @apply rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary;
}
.channel-selector__hint {
  @apply text-xs text-on-surface-variant;
}
.channel-selector__hint--error {
  @apply text-error;
}
.channel-selector__input {
  @apply rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary;
}
.channel-selector__address {
  @apply flex flex-col gap-3;
}
</style>
