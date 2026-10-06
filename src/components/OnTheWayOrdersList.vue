<script setup>
import { onMounted } from 'vue'
import { useOnTheWayOrders } from '../composables/useOnTheWayOrders'
import ConfirmDialog from './ConfirmDialog.vue'

const emit = defineEmits(['order-delivered'])

const {
  orders,
  isLoading,
  error,
  orderToConfirm,
  fetchOrders,
  deliverOrder,
  confirmCashCollected,
  cancelCashConfirmation,
} = useOnTheWayOrders()

onMounted(fetchOrders)

defineExpose({ refresh: fetchOrders })

// Envuelve deliverOrder/confirmCashCollected para avisar al padre (y así
// refrescar "Entregados hoy") solo cuando el pedido se ha marcado de
// verdad como entregado, nunca si ha fallado.
async function handleDeliver(order) {
  const delivered = await deliverOrder(order)
  if (delivered) emit('order-delivered')
}

async function handleConfirmCashCollected() {
  const delivered = await confirmCashCollected()
  if (delivered) emit('order-delivered')
}

const formatCurrency = (value) =>
  value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

const PAYMENT_METHOD_LABELS = {
  CASH_ONSITE: 'Pago en caja',
  CARD_ONSITE: 'Tarjeta en mesa',
  ONLINE_CARD: 'Tarjeta online',
  CASH_ON_DELIVERY: 'Efectivo a la entrega',
}
</script>

<template>
  <section class="on-the-way-orders" aria-label="Pedidos en tránsito">
    <h2 class="on-the-way-orders__title">Pedidos en tránsito</h2>

    <p v-if="isLoading" role="status">Cargando pedidos en tránsito…</p>

    <p v-else-if="error" role="alert" class="on-the-way-orders__error">
      {{ error }}
    </p>

    <p v-else-if="orders.length === 0" role="status">
      No hay pedidos en tránsito ahora mismo.
    </p>

    <ul v-else class="on-the-way-orders__list">
      <li
        v-for="order in orders"
        :key="order.id"
        class="on-the-way-orders__item"
      >
        <div class="on-the-way-orders__info">
          <p class="on-the-way-orders__order-id">Pedido #{{ order.id }}</p>
          <p class="on-the-way-orders__payment-method">
            {{ PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod }}
            · {{ formatCurrency(order.total) }}
          </p>
        </div>

        <button
          type="button"
          class="on-the-way-orders__deliver-btn"
          @click="handleDeliver(order)"
        >
          Marcar como ENTREGADO
        </button>
            </li>
    </ul>

    <ConfirmDialog
      v-if="orderToConfirm"
      title="Confirmar cobro"
      confirm-label="Sí, cobrado"
      variant="success"
      @confirm="handleConfirmCashCollected"
      @cancel="cancelCashConfirmation"
    >
      ¿Se han cobrado <strong>{{ formatCurrency(orderToConfirm.total) }}</strong> en efectivo
      por el pedido <strong>#{{ orderToConfirm.id }}</strong>?
    </ConfirmDialog>
  </section>
</template>

<style scoped>
@reference "../style.css";

.on-the-way-orders {
  @apply flex flex-col gap-4 rounded-xl border border-outline bg-surface-container p-5;
}

.on-the-way-orders__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.on-the-way-orders__error {
  @apply text-error;
}

.on-the-way-orders__list {
  @apply flex flex-col gap-3;
}

.on-the-way-orders__item {
  @apply flex items-center justify-between gap-3 border-b border-outline-variant pb-3;
}

.on-the-way-orders__order-id {
  @apply font-medium text-on-surface;
}

.on-the-way-orders__payment-method {
  @apply text-sm text-on-surface-variant;
}

.on-the-way-orders__deliver-btn {
  @apply cursor-pointer rounded-full bg-primary px-4 py-2
    text-sm font-semibold text-on-primary transition-opacity
    hover:opacity-90;
}
</style>
