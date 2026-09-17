<script setup>
defineProps({
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
})
</script>
<template>
  <section>
    <h3>Resumen del pago</h3>

    <div>
      <p>Subtotal: {{ subtotal }} €</p>
      <p>Gastos de entrega: {{ deliveryFee }} €</p>
      <p>Total abonado: {{ total }} €</p>
      <p>Método de pago: {{ paymentMethod }}</p>
    </div>
  </section>
</template>