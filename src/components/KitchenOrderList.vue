<script setup>
import { ref } from 'vue'
import KitchenOrderCard from './KitchenOrderCard.vue'
import KitchenAttendedOrders from './KitchenAttendedOrders.vue'
import LoadingSpinner from './LoadingSpinner.vue'

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

const emit = defineEmits(['channel-change', 'status-changed'])
const isShowingAttended = ref(false)

const channels = [
  { value: 'ALL', label: 'Todos', countKey: 'total' },
  { value: 'ONSITE', label: 'En Sala', countKey: 'inStore' },
  { value: 'ONLINE', label: 'A Domicilio', countKey: 'delivery' },
]

function selectChannel(channel) {
  isShowingAttended.value = false
  emit('channel-change', channel)
}
</script>

<template>
  <section :aria-busy="!isShowingAttended && isLoading">
    <h2 class="mb-4">
      {{ isShowingAttended ? 'Comandas atendidas' : 'Comandas activas' }}
    </h2>

    <div
      class="mb-4 flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar comandas"
    >
      <button
        v-for="channel in channels"
        :key="channel.value"
        type="button"
        :class="
          !isShowingAttended && selectedChannel === channel.value
            ? 'btn-primary'
            : 'btn-secondary'
        "
        :aria-pressed="
          !isShowingAttended && selectedChannel === channel.value
        "
        @click="selectChannel(channel.value)"
      >
        {{ channel.label }}
        <span v-if="channelCounts">
          ({{ channelCounts[channel.countKey] }})
        </span>
      </button>

      <button
        type="button"
        :class="isShowingAttended ? 'btn-primary' : 'btn-secondary'"
        :aria-pressed="isShowingAttended"
        @click="isShowingAttended = true"
      >
        Atendidas
      </button>
    </div>

    <KitchenAttendedOrders v-if="isShowingAttended" />

    <LoadingSpinner
      v-else-if="isLoading"
      class="card"
      label="Cargando comandas..."
    />

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
        @status-changed="emit('status-changed', $event)"
      />
    </div>
  </section>
</template>