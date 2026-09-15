<script setup>
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'

const orders = [
{
  id: 1042,
  elapsedTime: 16,
  status: 'PROCESSING',
  channel: 'IN_STORE',
  priorityNote: 'ALERGIA AL MARISCO - Preparar por separado',
  products: [
    {
      name: 'Pull Nigiri',
      quantity: 2
    },
    {
      name: 'Merge Maki',
      quantity: 1
    }
  ]
},
  {
    id: 1043,
    elapsedTime: 11,
    status: 'PROCESSING',
    channel: 'DELIVERY',
    products: [
      {
        name: 'Commit Roll',
        quantity: 3
      }
    ]
  }
]
</script>

<template>
  <main class="page-container py-8">
    <KitchenMetrics />

    <div class="mt-8">
      <KitchenOrderList :orders="orders" />
    </div>
  </main>
</template>