<script setup>
import { onMounted } from 'vue'
import { useDeliveredTodayOrders } from '../composables/useDeliveredTodayOrders'

const { orders, isLoading, error, fetchOrders } = useDeliveredTodayOrders()

onMounted(fetchOrders)

defineExpose({ refresh: fetchOrders })

const formatCurrency = (value) =>
  value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

const formatTime = (isoDateTime) =>
  new Date(isoDateTime).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

const PAYMENT_METHOD_LABELS = {
  CASH_ONSITE: 'Pago en caja',
  CARD_ONSITE: 'Tarjeta en mesa',
  ONLINE_CARD: 'Tarjeta online',
  CASH_ON_DELIVERY: 'Efectivo a la entrega',
}
</script>

<template>
  <section class="delivered-today" aria-label="Pedidos entregados hoy">
    <h2 class="delivered-today__title">Entregados hoy</h2>

    <p v-if="isLoading" role="status">Cargando pedidos entregados…</p>

    <p v-else-if="error" role="alert" class="delivered-today__error">
      {{ error }}
    </p>

    <p v-else-if="orders.length === 0" role="status">
      Todavía no se ha entregado ningún pedido hoy.
    </p>

    <ul v-else class="delivered-today__list">
      <li
        v-for="order in orders"
        :key="order.id"
        class="delivered-today__item"
      >
        <div class="delivered-today__info">
          <p class="delivered-today__order-id">Pedido #{{ order.id }}</p>
          <p class="delivered-today__payment-method">
            {{ PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod }}
            · {{ formatCurrency(order.total) }}
          </p>
        </div>

        <span class="delivered-today__time">{{ formatTime(order.deliveredAt) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
@reference "../style.css";

.delivered-today {
  @apply flex flex-col gap-4 rounded-xl border border-outline bg-surface-container p-5;
}

.delivered-today__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.delivered-today__error {
  @apply text-error;
}

.delivered-today__list {
  @apply flex flex-col gap-3;
}

.delivered-today__item {
  @apply flex items-center justify-between gap-3 border-b border-outline-variant pb-3;
}

.delivered-today__order-id {
  @apply font-medium text-on-surface;
}

.delivered-today__payment-method {
  @apply text-sm text-on-surface-variant;
}

.delivered-today__time {
  @apply text-sm font-semibold text-secondary;
}
</style>
