<script setup>
import OrderTracking from "../components/OrderTracking.vue";
import OrderTicket from "../components/OrderTicket.vue";
import OrderHistorySection from "../components/OrderHistorySection.vue";

const order = {
  orderNumber: "GS-2026-00125",
  paymentStatus: "Pagado",
  items: [
    {
      id: 1,
      name: "Pull Nigiri",
      quantity: 2,
      price: 6.5,
    },
    {
      id: 2,
      name: "Merge Maki",
      quantity: 1,
      price: 8.9,
    },
  ],
  subtotal: 21.9,
  deliveryFee: 2.5,
  total: 24.4,
  paymentMethod: "Tarjeta",
};
</script>

<template>
  <main>
    <OrderTracking />

    <OrderTicket
      :order-number="order.orderNumber"
      :payment-status="order.paymentStatus"
      :items="order.items"
      :subtotal="order.subtotal"
      :delivery-fee="order.deliveryFee"
      :total="order.total"
      :payment-method="order.paymentMethod"
    />

    <OrderHistorySection />
  </main>
</template>
