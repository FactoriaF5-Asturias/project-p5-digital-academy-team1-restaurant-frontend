<script setup>
import { formatCurrency } from '../utils/formatCurrency'

// Responsabilidad: desglose de importes del ticket y método de pago.

defineProps({
  subtotal: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  vatRate: {
    type: Number,
    required: true,
  },
  vatAmount: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section class="order-summary" aria-labelledby="order-summary-title">
    <h3 id="order-summary-title" class="order-summary__title">Resumen del pago</h3>

    <dl class="order-summary__rows">
      <div class="order-summary__row">
        <dt>Subtotal</dt>
        <dd>{{ formatCurrency(subtotal) }}</dd>
      </div>

      <div v-if="discountAmount > 0" class="order-summary__row order-summary__row--discount">
        <dt>Descuento</dt>
        <dd>-{{ formatCurrency(discountAmount) }}</dd>
      </div>

      <div class="order-summary__row">
        <dt>IVA ({{ vatRate }} %)</dt>
        <dd>{{ formatCurrency(vatAmount) }}</dd>
      </div>

      <div v-if="deliveryFee > 0" class="order-summary__row order-summary__row--delivery">
        <dt>Gastos de entrega</dt>
        <dd>{{ formatCurrency(deliveryFee) }}</dd>
      </div>

      <div class="order-summary__row order-summary__row--total">
        <dt>{{ isPaid ? 'Total abonado' : 'Total a pagar' }}</dt>
        <dd>{{ formatCurrency(total) }}</dd>
      </div>

      <div class="order-summary__row order-summary__row--method">
        <dt>Método de pago</dt>
        <dd>{{ paymentMethod }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
@reference "../style.css";

.order-summary {
  @apply mt-6 border-t border-outline-variant pt-6;
}

.order-summary__title {
  @apply mb-4 text-lg font-semibold;
}

.order-summary__rows {
  @apply flex flex-col gap-2 text-sm;
}

.order-summary__row {
  @apply flex justify-between;
}

.order-summary__row dt {
  @apply text-on-surface-variant;
}

.order-summary__row--discount dd {
  @apply text-secondary;
}

.order-summary__row--total {
  @apply border-t border-outline-variant pt-3 text-base font-bold;
}

.order-summary__row--total dt {
  @apply text-on-surface;
}

.order-summary__row--method {
  @apply pt-2;
}
</style>