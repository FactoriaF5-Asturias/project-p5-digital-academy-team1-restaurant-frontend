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
  items: {
    type: Array,
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

    <div>
      <article
        v-for="item in items"
        :key="item.id"
      >
        <p>{{ item.name }}</p>
        <p>Cantidad: {{ item.quantity }}</p>
        <p>Precio: {{ item.price }} €</p>
      </article>
    </div>
  </section>
</template>