import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getDeliveryMetrics } from '../services/delivery.service'

const REFRESH_INTERVAL = 10_000

export function useDeliveryMetrics() {
  const metrics = ref(null)
  const isLoading = ref(true)
  const isRefreshing = ref(false)
  const error = ref('')

  let timer = null
  let active = false
  let requestPending = false

  const isEmpty = computed(() => {
    if (!metrics.value) return false

    return (
      metrics.value.readyCount === 0 &&
      metrics.value.inTransitCount === 0 &&
      metrics.value.deliveredTodayCount === 0
    )
  })

  async function refresh() {
    if (!active || requestPending) return

    clearTimeout(timer)
    requestPending = true
    isLoading.value = metrics.value === null
    isRefreshing.value = true
    error.value = ''

    try {
      const data = await getDeliveryMetrics()

      if (active) {
        metrics.value = data
      }
    } catch {
      if (active) {
        error.value = metrics.value
          ? 'No se han podido actualizar los datos. Se muestran los últimos disponibles.'
          : 'No se han podido cargar los datos de reparto.'
      }
    } finally {
      requestPending = false

      if (active) {
        isLoading.value = false
        isRefreshing.value = false
        timer = setTimeout(refresh, REFRESH_INTERVAL)
      }
    }
  }

  onMounted(() => {
    active = true
    refresh()
  })

  onUnmounted(() => {
    active = false
    clearTimeout(timer)
  })

  return {
    metrics,
    isLoading,
    isRefreshing,
    error,
    isEmpty,
    refresh,
  }
}