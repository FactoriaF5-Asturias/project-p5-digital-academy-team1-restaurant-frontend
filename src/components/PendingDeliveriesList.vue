<script setup>
import { onMounted } from 'vue'
import { usePendingDeliveries } from '../composables/usePendingDeliveries'

const {
  orders,
  isLoading,
  error,
  acceptError,
  acceptingOrderId,
  fetchOrders,
  acceptOrder,
} = usePendingDeliveries()

const emit = defineEmits(['order-accepted'])

onMounted(fetchOrders)

async function handleAccept(order) {
  await acceptOrder(order)

  if (!acceptError.value) {
    emit('order-accepted')
  }
}
</script>

<template>
  <section class="pending-deliveries" aria-label="Pedidos listos para repartir">
    <h2 class="pending-deliveries__title">Pedidos listos para repartir</h2>

    <p v-if="isLoading" role="status">Cargando pedidos pendientes de reparto…</p>

    <p v-else-if="error" role="alert" class="pending-deliveries__error">
      {{ error }}
    </p>

    <template v-else>
      <p v-if="orders.length === 0" role="status">
        No hay pedidos listos para repartir ahora mismo.
      </p>

      <template v-else>
        <p v-if="acceptError" role="alert" class="pending-deliveries__error">
          {{ acceptError }}
        </p>

        <ul class="pending-deliveries__list">
          <li v-for="order in orders" :key="order.id" class="pending-deliveries__item">
            <div class="pending-deliveries__info">
              <p class="pending-deliveries__order-id">Pedido #{{ order.id }}</p>
              <p class="pending-deliveries__address">
                {{ order.address ?? 'Sin dirección registrada' }}
              </p>
            </div>

            <button
              type="button"
              class="pending-deliveries__accept-btn"
              :disabled="acceptingOrderId === order.id"
              @click="handleAccept(order)"
            >
              {{ acceptingOrderId === order.id ? 'Aceptando…' : 'Aceptar y salir a repartir' }}
            </button>
          </li>
        </ul>
      </template>
    </template>
  </section>
</template>

<style scoped>
@reference "../style.css";

.pending-deliveries {
  @apply flex flex-col gap-4 rounded-xl border border-outline bg-surface-container p-5;
}

.pending-deliveries__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.pending-deliveries__error {
  @apply text-error;
}

.pending-deliveries__list {
  @apply flex flex-col gap-3;
}

.pending-deliveries__item {
  @apply flex items-center justify-between gap-3 border-b border-outline-variant pb-3;
}

.pending-deliveries__order-id {
  @apply font-medium text-on-surface;
}

.pending-deliveries__address {
  @apply text-sm text-on-surface-variant;
}

.pending-deliveries__accept-btn {
  @apply cursor-pointer rounded-full bg-primary px-4 py-2
    text-sm font-semibold text-on-primary transition-opacity
    hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50;
}
</style>
