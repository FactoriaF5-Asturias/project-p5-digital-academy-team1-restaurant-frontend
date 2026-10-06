<script setup>
import { computed } from 'vue'
import { useCheckoutStore } from '../stores/checkout'
import { DINE_IN_PAYMENT_METHODS, HOME_DELIVERY_PAYMENT_METHODS } from '../constants/paymentMethods'

const checkoutStore = useCheckoutStore()

// Según el canal elegido, la lista de métodos válidos es una u otra.
const availableMethods = computed(() =>
  checkoutStore.channel === 'sala' ? DINE_IN_PAYMENT_METHODS : HOME_DELIVERY_PAYMENT_METHODS,
)

const selectedPaymentMethod = computed({
  get: () => checkoutStore.paymentMethod,
  set: (value) => checkoutStore.setPaymentMethod(value),
})

const selectedMethodDetails = computed(() =>
   availableMethods.value.find((method) => method.value === selectedPaymentMethod.value),
)
</script>

<template>
  <section class="payment-selector" aria-label="Método de pago">
    <h2 class="payment-selector__title">Método de pago</h2>
    <div class="payment-selector__options" role="radiogroup" aria-label="Selecciona un método de pago">
      <button
        v-for="method in availableMethods"
        :key="method.value"
        type="button"
        class="payment-selector__option"
        :class="{ 'payment-selector__option--selected': selectedPaymentMethod === method.value }"
        role="radio"
        :aria-checked="selectedPaymentMethod === method.value"
        @click="selectedPaymentMethod = method.value"
      >
        {{ method.label }}
      </button>
    </div>
    <p v-if="selectedMethodDetails" class="payment-selector__status">
      Se marcará como: {{ selectedMethodDetails.pendingStatusLabel }}
    </p>
    <p v-else class="payment-selector__hint">Selecciona un método de pago para continuar.</p>
  </section>
</template>

<style scoped>
@reference "../style.css";

.payment-selector {
  @apply flex flex-col gap-2;
}

.payment-selector__title {
  @apply text-lg font-semibold;
}

.payment-selector__options {
  @apply flex flex-wrap gap-2;
}

.payment-selector__option {
  @apply rounded-full border border-neutral-300 px-4 py-2 text-sm transition-colors;
}

.payment-selector__option--selected {
  @apply border-primary bg-primary/10 font-semibold text-primary;
}

.payment-selector__status {
  @apply text-sm text-neutral-600;
}

.payment-selector__hint {
  @apply text-sm text-neutral-400;
}
</style>
