<script setup>
import { computed } from 'vue'
import OrderStatusTracker from './OrderStatusTracker.vue'
import DeliveryDestination from './DeliveryDestination.vue'
import OrderSummary from './OrderSummary.vue'
import { formatCurrency } from '../utils/formatCurrency'

// Responsabilidad: componer el ticket detallado del pedido (cabecera con estado
// de pago, seguimiento, líneas, destino y resumen) a partir de los datos ya
// adaptados por mapTicket.

const ONSITE_CHANNEL = 'ONSITE'

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
})

const channelLabel = computed(() =>
  props.ticket.channel === ONSITE_CHANNEL
    ? `Mesa ${props.ticket.tableNumber}`
    : 'A domicilio',
)
</script>

<template>
  <section class="order-ticket" aria-labelledby="order-ticket-title">
    <header class="order-ticket__header">
      <div>
        <p class="order-ticket__eyebrow">Ticket Manifest</p>
        <h2 id="order-ticket-title" class="order-ticket__title">Pedido #{{ ticket.id }}</h2>
        <p class="order-ticket__channel">{{ channelLabel }}</p>
      </div>

      <span
        class="order-ticket__badge"
        :class="ticket.isPaid ? 'order-ticket__badge--paid' : 'order-ticket__badge--pending'"
      >
        {{ ticket.paymentStatusLabel }}
      </span>
    </header>

    <OrderStatusTracker :status="ticket.status" :channel="ticket.channel" />

    <ul class="order-ticket__items">
      <li v-for="item in ticket.items" :key="item.id" class="order-ticket__item">
        <div>
          <p class="order-ticket__item-name">{{ item.name }}</p>
          <p class="order-ticket__item-detail">
            {{ item.quantity }} × {{ formatCurrency(item.unitPrice) }}
          </p>
        </div>

        <p class="order-ticket__item-total">{{ formatCurrency(item.lineTotal) }}</p>
      </li>
    </ul>

    <DeliveryDestination v-if="ticket.deliveryAddress" :address="ticket.deliveryAddress" />

    <OrderSummary
      :subtotal="ticket.subtotal"
      :discount-amount="ticket.discountAmount"
      :vat-rate="ticket.vatRate"
      :vat-amount="ticket.vatAmount"
      :delivery-fee="ticket.deliveryFee"
      :total="ticket.total"
      :payment-method="ticket.paymentMethodLabel"
      :is-paid="ticket.isPaid"
    />
  </section>
</template>

<style scoped>
@reference "../style.css";

.order-ticket {
  @apply mx-auto mt-8 max-w-4xl rounded-xl border border-outline-variant bg-surface-container p-4 sm:p-6;
}

.order-ticket__header {
  @apply mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-4;
}

.order-ticket__eyebrow {
  @apply text-xs font-semibold uppercase tracking-widest text-primary;
}

.order-ticket__title {
  @apply mt-1 text-xl font-bold font-heading;
}

.order-ticket__channel {
  @apply text-sm text-on-surface-variant;
}

.order-ticket__badge {
  @apply rounded-full px-3 py-1 text-sm font-medium;
}

.order-ticket__badge--paid {
  @apply bg-secondary-container text-on-secondary-container;
}

.order-ticket__badge--pending {
  @apply bg-primary-container text-on-primary-container;
}

.order-ticket__items {
  @apply flex flex-col gap-3;
}

.order-ticket__item {
  @apply flex items-center justify-between rounded-lg border border-outline-variant p-4;
}

.order-ticket__item-name {
  @apply font-semibold;
}

.order-ticket__item-detail {
  @apply mt-1 text-sm text-on-surface-variant;
}

.order-ticket__item-total {
  @apply font-semibold;
}
</style>