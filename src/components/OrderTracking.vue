<script setup>
import OrderStatusItem from './OrderStatusItem.vue'

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
</script>

<template>
  <section class="page-container py-8">
    <h2 class="mb-6 text-left">
      Estado de tu Pedido
    </h2>

    <ul class="space-y-2">
      <OrderStatusItem
        v-for="status in orderStatuses"
        :key="status.name"
        :status="status"
        :active-status="activeStatus"
      />
    </ul>
  </section>
</template>