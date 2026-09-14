<script setup>
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'

const orders = [
  {
    id: 1042,
    elapsedTime: 16,
    status: 'PROCESSING',
    products: [
      {
        name: 'Pull Nigiri',
        quantity: 2
      },
      {
        name: 'Merge Maki',
        quantity: 1
      },
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