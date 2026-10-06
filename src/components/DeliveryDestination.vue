<script setup>
// Responsabilidad: mostrar la dirección a la que va el pedido a domicilio.

defineProps({
  address: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="delivery-destination" aria-labelledby="delivery-destination-title">
    <h3 id="delivery-destination-title" class="delivery-destination__title">
      Destino de entrega
    </h3>

    <address class="delivery-destination__address">
      <span>{{ address.street }}</span>
      <span>{{ address.postalCode }} {{ address.city }}</span>
    </address>

    <p v-if="address.instructions" class="delivery-destination__instructions">
      Indicaciones: {{ address.instructions }}
    </p>
  </section>
</template>

<style scoped>
@reference "../style.css";

.delivery-destination {
  @apply mt-6 rounded-lg border border-outline-variant p-4;
}

.delivery-destination__title {
  @apply mb-2 text-lg font-semibold;
}

.delivery-destination__address {
  @apply flex flex-col not-italic;
}

.delivery-destination__instructions {
  @apply mt-2 text-sm text-on-surface-variant;
}
</style>