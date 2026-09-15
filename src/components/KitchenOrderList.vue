<script setup>
import { ref, computed } from 'vue'
import KitchenOrderCard from './KitchenOrderCard.vue'

const props = defineProps({
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

const selectedChannel = ref('ALL')

const filteredOrders = computed(() => {
  if (selectedChannel.value === 'ALL') {
    return props.orders
  }

  return props.orders.filter(
    order => order.channel === selectedChannel.value
  )
})
</script>

<template>
  <section>
    <h2 class="mb-4">
      Comandas activas
    </h2>
    <div class="mb-4 flex flex-wrap gap-2">
  <button
  type="button"
  :class="
    selectedChannel === 'ALL'
      ? 'btn-primary'
      : 'btn-secondary'
  "
  @click="selectedChannel = 'ALL'"
>
  Todos
</button>

<button
  type="button"
  :class="
    selectedChannel === 'IN_STORE'
      ? 'btn-primary'
      : 'btn-secondary'
  "
  @click="selectedChannel = 'IN_STORE'"
>
  En Sala
</button>

<button
  type="button"
  :class="
    selectedChannel === 'DELIVERY'
      ? 'btn-primary'
      : 'btn-secondary'
  "
  @click="selectedChannel = 'DELIVERY'"
>
  A Domicilio
</button>
</div>

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
  v-for="order in filteredOrders"
  :key="order.id"
  :order="order"
/>
    </div>
  </section>
</template>