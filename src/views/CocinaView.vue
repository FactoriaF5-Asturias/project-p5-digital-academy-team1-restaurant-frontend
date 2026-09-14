<script setup>
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderCard from '../components/KitchenOrderCard.vue'

const order = {
  id: 1042,
  elapsedTime: 16,
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
</script>

<template>
  <main class="page-container py-8">
    <KitchenMetrics />

    <section class="mt-8">
      <h2 class="mb-4">
        Comandas activas
      </h2>

      <KitchenOrderCard :order="order" />
    </section>
  </main>
</template>