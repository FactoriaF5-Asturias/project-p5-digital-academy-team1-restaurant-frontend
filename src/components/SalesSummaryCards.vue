<script setup>
import { formatCurrency } from '../utils/formatCurrency'

// Responsabilidad: mostrar los 3 indicadores del periodo
// (total vendido, pedidos pagados y ticket medio).

defineProps({
  revenue: {
    type: Number,
    required: true,
  },
  orders: {
    type: Number,
    required: true,
  },
  averageTicket: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <dl class="sales-summary">
    <div class="sales-summary__item">
      <dt class="sales-summary__label">Total vendido</dt>
      <dd class="sales-summary__value">{{ formatCurrency(revenue) }}</dd>
    </div>

    <div class="sales-summary__item">
      <dt class="sales-summary__label">Pedidos pagados</dt>
      <dd class="sales-summary__value">{{ orders }}</dd>
    </div>

    <div class="sales-summary__item">
      <dt class="sales-summary__label">Ticket medio</dt>
      <dd class="sales-summary__value">{{ formatCurrency(averageTicket) }}</dd>
    </div>
  </dl>
</template>

<style scoped>
@reference "../style.css";

.sales-summary {
  @apply grid grid-cols-1 gap-3 sm:grid-cols-3;
}

.sales-summary__item {
  @apply rounded-lg bg-surface-container-low p-4;
}

.sales-summary__label {
  @apply text-xs text-on-surface-variant;
}

.sales-summary__value {
  @apply mt-1 font-heading text-xl font-semibold text-on-surface;
}
</style>