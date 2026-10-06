<script setup>
import { ref } from 'vue'
import { updateKitchenOrderStatus } from '../services/kitchen.service'
import { ORDER_STATUS_LABELS, getLabel } from '../constants/invoiceLabels'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

// Avisa a la vista de que el estado ha cambiado para que refresque las métricas.
const emit = defineEmits(['status-changed'])

const currentStatus = ref(props.order.status ?? 'PROCESSING')
const isUpdating = ref(false)
const error = ref(null)

async function changeStatus(status) {
  if (currentStatus.value === status || isUpdating.value) {
    return
  }

  isUpdating.value = true
  error.value = null

  try {
    await updateKitchenOrderStatus(props.order.id, status)
    currentStatus.value = status
    emit('status-changed', { id: props.order.id, status })

  } catch {
    error.value = 'No se ha podido actualizar el estado.'
  } finally {
    isUpdating.value = false
  }
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

      <span
        v-if="order.elapsedTime !== undefined"
        class="text-sm text-on-surface-variant"
      >
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

    <div
      v-if="order.priorityNote"
      class="mt-4 rounded-lg border border-error bg-error-container p-4"
    >
      <p class="text-sm font-bold text-error">
        ⚠ Nota de comanda prioritaria
      </p>

      <p class="mt-1 font-medium text-on-error-container">
        {{ order.priorityNote }}
      </p>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        type="button"
        class="btn-secondary"
        :disabled="currentStatus === 'PROCESSING' || isUpdating"
        @click="changeStatus('PROCESSING')"
      >
        En curso
      </button>

      <button
        type="button"
        class="btn-secondary"
        :disabled="currentStatus === 'DELAYED' || isUpdating"
        @click="changeStatus('DELAYED')"
      >
        Con retraso
      </button>

      <button
        type="button"
        class="btn-primary"
        :disabled="currentStatus === 'READY' || isUpdating"
        @click="changeStatus('READY')"
      >
        Listo pase
      </button>
    </div>

    <p class="mt-4 text-sm text-on-surface-variant">
      Estado: {{ getLabel(ORDER_STATUS_LABELS, currentStatus) }}
    </p>

    <p
      v-if="error"
      class="mt-2 text-sm text-error"
    >
      {{ error }}
    </p>
  </article>
</template>