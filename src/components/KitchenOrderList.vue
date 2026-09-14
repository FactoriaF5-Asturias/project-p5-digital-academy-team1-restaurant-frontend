<script setup>
import KitchenOrderCard from './KitchenOrderCard.vue'

defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})
</script>

<template>
  <section>
    <h2 class="mb-4">
      Comandas activas
    </h2>

    <p
      v-if="isLoading"
      class="card p-6 text-on-surface-variant"
    >
      Cargando comandas...
    </p>

    <p
      v-else-if="error"
      class="card p-6 text-error"
    >
      {{ error }}
    </p>

    <p
      v-else-if="orders.length === 0"
      class="card p-6 text-on-surface-variant"
    >
      No hay comandas activas.
    </p>

    <div
      v-else
      class="grid gap-4"
    >
      <KitchenOrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </section>
</template>