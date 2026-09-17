<script setup>
defineProps({
  orderNumber: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section>
    <h2>Ticket Manifest</h2>

    <div>
      <p>Pedido #{{ orderNumber }}</p>
      <p>Estado del pago: {{ paymentStatus }}</p>
    </div>
  </section>
</template>