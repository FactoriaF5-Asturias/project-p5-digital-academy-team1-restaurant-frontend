<script setup>
import { onMounted, ref } from 'vue'
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import {
  getKitchenOrders,
  getKitchenChannelCounts,
  getKitchenMetrics,
} from '../services/kitchen.service'
import { useAutoRefresh } from '../composables/useAutoRefresh'

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
let countsRequestId = 0
let metricsRequestId = 0

async function loadOrders({ silent = false } = {}) {
  const requestId = ++ordersRequestId
  const channel = selectedChannel.value

  if (!silent) {
    isLoadingOrders.value = true
  }

  ordersError.value = null

  try {
    const result = await getKitchenOrders(channel)

    if (requestId !== ordersRequestId) return

    orders.value = result
  } catch {
    if (requestId !== ordersRequestId) return

    if (!silent) {
      orders.value = []
    }

    ordersError.value = 'No se han podido cargar las comandas.'
  } finally {
    if (requestId === ordersRequestId) {
      isLoadingOrders.value = false
    }
  }
}

async function loadChannelCounts() {
  const requestId = ++countsRequestId

  countsError.value = null

  try {
    const result = await getKitchenChannelCounts()

    if (requestId !== countsRequestId) return

    channelCounts.value = result
  } catch {
    if (requestId !== countsRequestId) return

    countsError.value = 'No se han podido cargar los contadores.'
  }
}

async function loadMetrics({ silent = false } = {}) {
  const requestId = ++metricsRequestId

  if (!silent) {
    isLoadingMetrics.value = true
  }

  metricsError.value = null

  try {
    const result = await getKitchenMetrics()

    if (requestId !== metricsRequestId) return

    metrics.value = result
  } catch {
    if (requestId !== metricsRequestId) return

    metricsError.value = 'No se han podido cargar las métricas de cocina.'
  } finally {
    if (requestId === metricsRequestId) {
      isLoadingMetrics.value = false
    }
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

function handleStatusChanged() {
  return Promise.all([
    loadOrders({ silent: true }),
    loadChannelCounts(),
    loadMetrics({ silent: true }),
  ])
}

onMounted(() => {
  loadOrders()
  loadChannelCounts()
  loadMetrics()
})

useAutoRefresh(handleStatusChanged)
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
        @status-changed="handleStatusChanged"
      />
    </div>
  </main>
</template>