<script setup>
import { onMounted, ref } from 'vue'
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import {
  getKitchenOrders,
  getKitchenMetrics,
} from '../services/kitchen.service'

const orders = ref([])
const metrics = ref(null)

const isLoadingOrders = ref(true)
const isLoadingMetrics = ref(true)

const ordersError = ref(null)
const metricsError = ref(null)

async function loadOrders() {
  isLoadingOrders.value = true
  ordersError.value = null

  try {
    orders.value = await getKitchenOrders()
  } catch {
    ordersError.value = 'No se han podido cargar las comandas.'
  } finally {
    isLoadingOrders.value = false
  }
}

async function loadMetrics() {
  // Solo "cargando" la primera vez: al refrescar se mantienen las métricas en pantalla.
  isLoadingMetrics.value = metrics.value === null
  metricsError.value = null

  try {
    metrics.value = await getKitchenMetrics()
  } catch {
    metricsError.value = 'No se han podido cargar las métricas de cocina.'
  } finally {
    isLoadingMetrics.value = false
  }
}

onMounted(() => {
  loadOrders()
  loadMetrics()
})
</script>

<template>
  <main class="page-container py-8">
    <KitchenMetrics
      :metrics="metrics"
      :is-loading="isLoadingMetrics"
      :error="metricsError"
    />

    <div class="mt-8">
      <KitchenOrderList
        :orders="orders"
        :is-loading="isLoadingOrders"
        :error="ordersError"
        @status-changed="loadMetrics"
      />
    </div>
  </main>
</template>