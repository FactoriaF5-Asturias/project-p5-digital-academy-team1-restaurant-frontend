<script setup>
defineProps({
  order: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="card p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm text-on-surface-variant">
          Comanda
        </p>

        <h3 class="text-xl font-bold text-on-surface">
          #{{ order.id }}
        </h3>
      </div>

      <span class="text-sm text-on-surface-variant">
        {{ order.elapsedTime }} min
      </span>
    </div>

    <ul class="mt-4 space-y-2">
      <li
        v-for="product in order.products"
        :key="product.name"
        class="flex justify-between gap-4 text-on-surface"
      >
        <span>{{ product.name }}</span>
        <span>x{{ product.quantity }}</span>
      </li>
    </ul>
  </article>
</template>