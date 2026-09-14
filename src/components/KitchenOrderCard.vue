<script setup>
import { ref } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const currentStatus = ref(props.order.status ?? 'PROCESSING')

const changeStatus = (status) => {
  currentStatus.value = status
}
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
    <div class="mt-6 flex flex-wrap gap-2">
  <button
    type="button"
    class="btn-secondary"
    :disabled="currentStatus === 'PROCESSING'"
    @click="changeStatus('PROCESSING')"
  >
    En curso
  </button>

  <button
    type="button"
    class="btn-secondary"
    :disabled="currentStatus === 'DELAYED'"
    @click="changeStatus('DELAYED')"
  >
    Con retraso
  </button>

  <button
    type="button"
    class="btn-primary"
    :disabled="currentStatus === 'READY'"
    @click="changeStatus('READY')"
  >
    Listo pase
  </button>
  <p class="mt-4 text-sm text-on-surface-variant">
  Estado: {{ currentStatus }}
</p>
</div>
  </article>
</template>