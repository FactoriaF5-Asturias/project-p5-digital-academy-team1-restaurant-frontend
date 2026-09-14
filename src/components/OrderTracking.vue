<script setup>
import { ref } from 'vue'
import OrderStatusItem from './OrderStatusItem.vue'
import RiderInfo from './RiderInfo.vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const hasActiveOrder = ref(true)

const orderStatuses = [
  {
    name: 'Pedido recibido y Pagado',
    time: '20:42'
  },
  {
    name: 'Cocina preparando',
    time: '20:45'
  },
  {
    name: 'Listo en cocina',
    time: '21:03'
  },
  {
    name: 'En Tránsito con Motorista',
    time: '21:08'
  },
  {
    name: 'Entregado al destinatario',
    time: null
  }
]

const activeStatus = 'En Tránsito con Motorista'

const rider = {
  id: 'R-709',
  name: 'Clara Álvarez',
  vehicle: 'Moto Eco 01'
}
</script>

<template>
  <section class="page-container py-8">
    <h2 class="mb-6 text-left">
      Estado de tu Pedido
    </h2>

    <p
      v-if="props.isLoading"
      class="card p-4 text-left text-on-surface-variant"
    >
      Cargando seguimiento del pedido...
    </p>

    <p
      v-else-if="props.error"
      class="card p-4 text-left text-error"
    >
      {{ props.error }}
    </p>

    <p
      v-else-if="!hasActiveOrder"
      class="card p-4 text-left text-on-surface-variant"
    >
      No tienes ningún pedido activo.
    </p>

    <div v-else>
      <ul class="space-y-2">
        <OrderStatusItem
          v-for="status in orderStatuses"
          :key="status.name"
          :status="status"
          :active-status="activeStatus"
        />
      </ul>

      <RiderInfo
        v-if="activeStatus === 'En Tránsito con Motorista'"
        :rider="rider"
      />
    </div>
  </section>
</template>