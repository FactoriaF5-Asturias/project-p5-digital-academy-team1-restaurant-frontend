<script setup>
import { computed, ref } from 'vue'
import { markOrderAsPaid, updateKitchenOrderStatus } from '../services/kitchen.service'
import { getCollectPaymentLabel } from '../constants/paymentMethods'
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
const currentPaymentStatus = ref(props.order.paymentStatus ?? null)
const isUpdating = ref(false)
const error = ref(null)

const ONSITE_CHANNEL = 'ONSITE'
// El backend solo acepta el cobro mientras el pedido está recién recibido.
const COLLECTABLE_STATUS = 'PLACED'
const PAID_STATUS = 'PAID'

// Botón "Cobrado en caja / con datáfono": solo en pedidos de sala aún sin cobrar.
const collectPaymentLabel = computed(() => {
  if (props.order.channel !== ONSITE_CHANNEL) return null
  if (currentStatus.value !== COLLECTABLE_STATUS) return null
  return getCollectPaymentLabel(currentPaymentStatus.value)
})

async function collectPayment() {
  if (isUpdating.value) return

  isUpdating.value = true
  error.value = null

  try {
    await markOrderAsPaid(props.order.id)
    currentPaymentStatus.value = null
    currentStatus.value = PAID_STATUS
    emit('status-changed', { id: props.order.id, status: PAID_STATUS })
  } catch {
    error.value = 'No se ha podido registrar el cobro.'
  } finally {
    isUpdating.value = false
  }
}

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

    <button
      v-if="collectPaymentLabel"
      type="button"
      class="kitchen-order-card__collect"
      :disabled="isUpdating"
      @click="collectPayment"
    >
      {{ collectPaymentLabel }}
    </button>

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

<style scoped>
@reference "../style.css";

/* Cobro de un pedido de sala: verde para distinguirlo de los cambios de estado */
.kitchen-order-card__collect {
  @apply mt-4 w-full rounded-lg border border-secondary bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50;
}
</style>
