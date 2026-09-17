<script setup>
defineProps({
  orderNumber: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="mx-auto mt-8 max-w-4xl rounded-xl border border-gray-200 bg-white p-6">
    <div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-red-500">
          Ticket Manifest
        </p>

        <h2 class="mt-1 text-xl font-bold">
          Pedido #{{ orderNumber }}
        </h2>
      </div>

      <span class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
        {{ paymentStatus }}
      </span>
    </div>

    <div class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between rounded-lg border border-gray-100 p-4"
      >
        <div>
          <p class="font-semibold">
            {{ item.name }}
          </p>

          <p class="mt-1 text-sm text-gray-500">
            Cantidad: {{ item.quantity }}
          </p>
        </div>

        <p class="font-semibold">
          {{ item.price }} €
        </p>
      </article>
    </div>
  </section>
</template>