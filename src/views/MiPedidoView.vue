<script setup>
import OrderTracking from '../components/OrderTracking.vue'
import OrderTicket from '../components/OrderTicket.vue'

const order = {
  orderNumber: 'GS-2026-00125',
  paymentStatus: 'Pagado',
  items: [
    {
      id: 1,
      name: 'Pull Nigiri',
      quantity: 2,
      price: 6.5,
    },
    {
      id: 2,
      name: 'Merge Maki',
      quantity: 1,
      price: 8.9,
    },
  ],
}
</script>

<template>
  <main>
    <OrderTracking />

    <OrderTicket
      :order-number="order.orderNumber"
      :payment-status="order.paymentStatus"
      :items="order.items"
    />
  </main>
</template>