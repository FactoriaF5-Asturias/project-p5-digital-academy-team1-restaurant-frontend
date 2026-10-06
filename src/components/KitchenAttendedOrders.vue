<script setup>
import { onMounted, ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { getAttendedOrders } from '../services/kitchen.service'
import { ORDER_STATUS_LABELS, getLabel } from '../constants/invoiceLabels'
import { formatCurrency } from '../utils/formatCurrency'
import { useAutoRefresh } from '../composables/useAutoRefresh'

// Responsabilidad: listar las comandas que cocina ya terminó (listas, en reparto
// y entregadas) para poder consultarlas sin pedírselas al administrador.

const ONSITE_CHANNEL = 'ONSITE'
const LOAD_ERROR_MESSAGE = 'No se han podido cargar las comandas atendidas.'

const orders = ref([])
const isLoading = ref(true)
const loadError = ref('')

function getChannelLabel(order) {
  if (order.channel !== ONSITE_CHANNEL) return 'A domicilio'
  return order.tableNumber ? `Sala · Mesa ${order.tableNumber}` : 'Sala'
}

function getBadgeModifier(status) {
  return `kitchen-attended__badge--${status.toLowerCase()}`
}

async function loadOrders() {
  try {
    orders.value = await getAttendedOrders()
    loadError.value = ''
  } catch (err) {
    loadError.value = LOAD_ERROR_MESSAGE
    console.error('[KitchenAttendedOrders] Error al cargar las comandas atendidas:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)
useAutoRefresh(loadOrders)
</script>

<template>
  <LoadingSpinner v-if="isLoading" class="card" label="Cargando comandas atendidas..." />

  <p v-else-if="loadError" class="card p-6 text-error" role="alert">
    {{ loadError }}
  </p>

  <p v-else-if="orders.length === 0" class="card p-6 text-on-surface-variant">
    Todavía no hay comandas atendidas.
  </p>

  <div v-else class="kitchen-attended card">
    <table class="kitchen-attended__table">
      <thead>
        <tr>
          <th scope="col">Pedido</th>
          <th scope="col">Canal</th>
          <th scope="col">Estado</th>
          <th scope="col" class="kitchen-attended__total">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td class="kitchen-attended__id">#{{ order.id }}</td>
          <td>{{ getChannelLabel(order) }}</td>
          <td>
            <span class="kitchen-attended__badge" :class="getBadgeModifier(order.status)">
              {{ getLabel(ORDER_STATUS_LABELS, order.status) }}
            </span>
          </td>
          <td class="kitchen-attended__total">{{ formatCurrency(order.total) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@reference "../style.css";

/* En móvil la tabla se desplaza en horizontal en vez de romper la página */
.kitchen-attended {
  @apply overflow-x-auto p-0;
}

.kitchen-attended__table {
  @apply w-full text-sm;
}

.kitchen-attended__table th {
  @apply px-4 py-3 text-left text-xs font-medium text-on-surface-variant;
}

.kitchen-attended__table td {
  @apply border-t border-outline-variant px-4 py-3 text-on-surface;
}

.kitchen-attended__id {
  @apply font-semibold;
}

.kitchen-attended__total {
  @apply text-right;
}

.kitchen-attended__badge {
  @apply inline-block rounded-full px-3 py-0.5 text-xs font-medium;
}

.kitchen-attended__badge--ready {
  @apply bg-tertiary-container text-on-tertiary-container;
}

.kitchen-attended__badge--ontheway {
  @apply bg-primary-container text-on-primary-container;
}

.kitchen-attended__badge--delivered {
  @apply bg-secondary-container text-on-secondary-container;
}
</style>
