<script setup>
import KitchenOrderCard from './KitchenOrderCard.vue'

defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  selectedChannel: {
    type: String,
    default: 'ALL',
  },
  channelCounts: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['channel-change'])

const channels = [
  { value: 'ALL', label: 'Todos', countKey: 'total' },
  { value: 'ONSITE', label: 'En Sala', countKey: 'inStore' },
  { value: 'ONLINE', label: 'A Domicilio', countKey: 'delivery' },
]
</script>

<template>
  <section :aria-busy="isLoading">
    <h2 class="mb-4">Comandas activas</h2>

    <div
      class="mb-4 flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar comandas por canal"
    >
      <button
        v-for="channel in channels"
        :key="channel.value"
        type="button"
        :class="
          selectedChannel === channel.value
            ? 'btn-primary'
            : 'btn-secondary'
        "
        :aria-pressed="selectedChannel === channel.value"
        @click="emit('channel-change', channel.value)"
      >
        {{ channel.label }}
        <span v-if="channelCounts">
          ({{ channelCounts[channel.countKey] }})
        </span>
      </button>
    </div>

    <p
      v-if="isLoading"
      class="card p-6 text-on-surface-variant"
      role="status"
    >
      Cargando comandas...
    </p>

    <p
      v-else-if="error"
      class="card p-6 text-error"
      role="alert"
    >
      {{ error }}
    </p>

    <p
      v-else-if="orders.length === 0"
      class="card p-6 text-on-surface-variant"
      role="status"
    >
      {{
        selectedChannel === 'ALL'
          ? 'No hay comandas activas.'
          : 'No hay comandas activas para este canal.'
      }}
    </p>

    <div v-else class="grid gap-4">
      <KitchenOrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </section>
</template>