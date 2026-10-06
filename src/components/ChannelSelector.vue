<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckoutStore } from '../stores/checkout'
import { useAuthStore } from '../stores/auth'
import { useTableDetection } from '../composables/useTableDetection'
import { TABLE_NUMBERS } from '../constants/tables'

import {
  ADDRESS_FIELD_ERRORS,
  getMissingAddressFields,
  getProfileAddress,
} from '../utils/deliveryAddress'

// Campos de la dirección de entrega (los id los usan también los tests E2E).
const ADDRESS_FIELDS = Object.freeze([
  { key: 'street', id: 'address-street', label: 'Calle y número' },
  { key: 'city', id: 'address-city', label: 'Ciudad' },
  { key: 'postalCode', id: 'address-postal-code', label: 'Código postal' },
])

const checkoutStore = useCheckoutStore()
const authStore = useAuthStore()
const router = useRouter()
const { isLoading: isDetectingTable, error: tableDetectionError, detectTable } = useTableDetection()

// Solo se intenta detectar la mesa al cargar la Cesta: si el canal ya es
// "sala" y todavía no hay ningún número de mesa guardado (ni manual ni
// auto-detectado de una visita anterior en esta misma sesión).
onMounted(() => {
  if (checkoutStore.channel === 'sala' && !checkoutStore.tableNumber) {
    detectTable()
  }
})

// Pedir a domicilio exige cuenta: si no hay sesión, se redirige a login en
// vez de cambiar el canal. Con sesión, el comportamiento es el de siempre.
function selectHomeDeliveryChannel() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
    return
  }
  checkoutStore.setChannel('domicilio')
  // Se sugiere la dirección del perfil, si está completa y aún no se ha escrito otra.
  if (profileAddress.value && !checkoutStore.address) {
    checkoutStore.useProfileAddress(profileAddress.value)
  }
}

const profileAddress = computed(() => getProfileAddress(authStore.user))
const isUsingProfileAddress = computed(() => checkoutStore.addressSource === 'profile')

// Los errores solo se ven después de intentar confirmar el pedido.
const missingAddressFields = computed(() =>
  checkoutStore.showAddressErrors ? getMissingAddressFields(checkoutStore.address) : [],
)

function getFieldError(field) {
  return missingAddressFields.value.includes(field) ? ADDRESS_FIELD_ERRORS[field] : null
}

// Cada campo se expone como un computed con get/set: lee del store
// y, al escribir (por ejemplo desde v-model), llama a la acción correspondiente.
const tableNumber = computed({
  get: () => checkoutStore.tableNumber ?? '',
  set: (value) => checkoutStore.setTableNumber(value),
})

function updateAddressField(field, value) {
  checkoutStore.setAddress({ ...(checkoutStore.address ?? {}), [field]: value })
}

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
        @click="selectHomeDeliveryChannel"
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
        {{ tableDetectionError }} Elígela en la lista.
      </p>

    <select id="table-number" v-model="tableNumber" class="channel-selector__input">
        <option value="" disabled>Elige tu mesa</option>
        <option v-for="number in TABLE_NUMBERS" :key="number" :value="number">
          {{ number }}
        </option>
      </select>
    </div>

    <div v-else class="channel-selector__address">
      <div
        v-if="profileAddress"
        class="channel-selector__address-options"
        role="radiogroup"
        aria-label="Dirección de entrega"
      >
        <button
          type="button"
          role="radio"
          class="channel-selector__address-option"
          :class="{ 'channel-selector__address-option--active': isUsingProfileAddress }"
          :aria-checked="isUsingProfileAddress"
          @click="checkoutStore.useProfileAddress(profileAddress)"
        >
          <span class="channel-selector__address-option-title">Mi dirección del perfil</span>
          <span class="channel-selector__address-option-detail">
            {{ profileAddress.street }} · {{ profileAddress.postalCode }} {{ profileAddress.city }}
          </span>
        </button>
        <button
          type="button"
          role="radio"
          class="channel-selector__address-option"
          :class="{ 'channel-selector__address-option--active': !isUsingProfileAddress }"
          :aria-checked="!isUsingProfileAddress"
          @click="checkoutStore.useOtherAddress()"
        >
          <span class="channel-selector__address-option-title">Otra dirección</span>
          <span class="channel-selector__address-option-detail">Solo para este pedido</span>
        </button>
      </div>

      <template v-if="!profileAddress || !isUsingProfileAddress">
        <div v-for="field in ADDRESS_FIELDS" :key="field.key" class="channel-selector__field">
          <label :for="field.id" class="channel-selector__label">
            {{ field.label }}
            <span class="channel-selector__required" aria-hidden="true">*</span>
          </label>
          <input
            :id="field.id"
            :value="checkoutStore.address?.[field.key] ?? ''"
            type="text"
            required
            class="channel-selector__input"
            :class="{ 'channel-selector__input--error': getFieldError(field.key) }"
            :aria-invalid="Boolean(getFieldError(field.key))"
            :aria-describedby="getFieldError(field.key) ? `${field.id}-error` : undefined"
            @input="updateAddressField(field.key, $event.target.value)"
          />
          <p
            v-if="getFieldError(field.key)"
            :id="`${field.id}-error`"
            class="channel-selector__field-error"
          >
            {{ getFieldError(field.key) }}
          </p>
        </div>
      </template>
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
.channel-selector__address-options {
  @apply flex flex-col gap-2;
}
.channel-selector__address-option {
  @apply flex flex-col items-start gap-0.5 rounded-lg border border-outline-variant px-3 py-2 text-left text-sm transition-colors hover:bg-primary-container;
}
.channel-selector__address-option--active {
  @apply border-2 border-primary;
}
.channel-selector__address-option-title {
  @apply font-semibold text-on-surface;
}
.channel-selector__address-option-detail {
  @apply text-xs text-on-surface-variant;
}
.channel-selector__required {
  @apply text-primary;
}
.channel-selector__input--error {
  @apply border-2 border-error;
}
.channel-selector__field-error {
  @apply text-xs text-error;
}
</style>
