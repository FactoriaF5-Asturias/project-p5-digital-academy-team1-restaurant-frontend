<script setup>
defineProps({
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
})
</script>
<template>
  <section class="mt-6 border-t border-gray-200 pt-6">
    <h3 class="mb-4 text-lg font-semibold">
      Resumen del pago
    </h3>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-500">Subtotal</span>
        <span>{{ subtotal }} €</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-500">Gastos de entrega</span>
        <span>{{ deliveryFee }} €</span>
      </div>

      <div class="flex justify-between border-t border-gray-200 pt-3 font-bold">
        <span>Total abonado</span>
        <span>{{ total }} €</span>
      </div>

      <div class="flex justify-between pt-2">
        <span class="text-gray-500">Método de pago</span>
        <span>{{ paymentMethod }}</span>
      </div>
    </div>
  </section>
</template>