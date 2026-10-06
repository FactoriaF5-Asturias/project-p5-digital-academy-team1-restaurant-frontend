<script setup>
import { onMounted, ref } from 'vue'
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import {
  getKitchenOrders,
  getKitchenChannelCounts,
  getKitchenMetrics,
} from '../services/kitchen.service'

const orders = ref([])
const metrics = ref(null)
const selectedChannel = ref('ALL')
const channelCounts = ref(null)

const isLoadingOrders = ref(true)
const isLoadingMetrics = ref(true)

const ordersError = ref(null)
const metricsError = ref(null)
const countsError = ref(null)

let ordersRequestId = 0

async function loadOrders() {
  const requestId = ++ordersRequestId

  isLoadingOrders.value = true
  ordersError.value = null

  try {
    const result = await getKitchenOrders(selectedChannel.value)

    if (requestId !== ordersRequestId) return

    orders.value = result
  } catch {
    if (requestId !== ordersRequestId) return

    orders.value = []
    ordersError.value = 'No se han podido cargar las comandas.'
  } finally {
    if (requestId === ordersRequestId) {
      isLoadingOrders.value = false
    }
  }
}

async function loadChannelCounts() {
  countsError.value = null

  try {
    channelCounts.value = await getKitchenChannelCounts()
  } catch {
    channelCounts.value = null
    countsError.value = 'No se han podido cargar los contadores.'
  }
}

async function loadMetrics() {
  isLoadingMetrics.value = true
  metricsError.value = null

  try {
    metrics.value = await getKitchenMetrics()
  } catch {
    metricsError.value = 'No se han podido cargar las métricas de cocina.'
  } finally {
    isLoadingMetrics.value = false
  }
}

function handleChannelChange(channel) {
  if (
    !['ALL', 'ONSITE', 'ONLINE'].includes(channel) ||
    channel === selectedChannel.value
  ) {
    return
  }

  selectedChannel.value = channel
  loadOrders()
  loadChannelCounts()
}

onMounted(() => {
  loadOrders()
  loadChannelCounts()
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
      <p
        v-if="countsError"
        class="mb-4 text-sm text-error"
        role="alert"
      >
        {{ countsError }}
      </p>

      <KitchenOrderList
        :orders="orders"
        :is-loading="isLoadingOrders"
        :error="ordersError"
        :selected-channel="selectedChannel"
        :channel-counts="channelCounts"
        @channel-change="handleChannelChange"
      />
    </div>
  </main>
</template>