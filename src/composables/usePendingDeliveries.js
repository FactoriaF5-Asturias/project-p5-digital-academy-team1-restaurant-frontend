import { onUnmounted, ref } from 'vue'
import {
  getPendingDeliveries,
  assignOrderToSelf,
  markOrderInTransit,
} from '../services/delivery.service'

const REFRESH_INTERVAL = 10_000

export function usePendingDeliveries() {
  const orders = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  const acceptError = ref(null)
  const acceptingOrderId = ref(null)

  let timer = null
  let disposed = false
  let requestId = 0

  function scheduleRefresh() {
    clearTimeout(timer)

    if (!disposed) {
      timer = setTimeout(() => {
        fetchOrders({ silent: true })
      }, REFRESH_INTERVAL)
    }
  }

  async function fetchOrders({ silent = false } = {}) {
    if (disposed) return

    const currentRequest = ++requestId

    clearTimeout(timer)

    if (!silent) {
      isLoading.value = true
    }

    error.value = null

    try {
      const result = await getPendingDeliveries()

      if (disposed || currentRequest !== requestId) return

      orders.value = result
    } catch {
      if (disposed || currentRequest !== requestId) return

      error.value =
        'No se han podido cargar los pedidos pendientes de reparto.'
    } finally {
      if (!disposed && currentRequest === requestId) {
        isLoading.value = false
        scheduleRefresh()
      }
    }
  }

  async function acceptOrder(order) {
    if (disposed || acceptingOrderId.value !== null) return false

    acceptError.value = null
    acceptingOrderId.value = order.id

    let assigned = false

    try {
      await assignOrderToSelf(order.id)
      assigned = true

      await markOrderInTransit(order.id)

      if (disposed) return false

      // Invalida una consulta anterior que pudiera devolver este pedido.
      requestId += 1
      isLoading.value = false
      orders.value = orders.value.filter(
        (item) => item.id !== order.id,
      )

      await fetchOrders({ silent: true })

      return true
    } catch (err) {
      if (disposed) return false

      if (assigned) {
        acceptError.value =
          'El pedido se ha asignado a ti, pero no se ha podido marcar en tránsito. Comprueba su estado antes de salir.'
      } else if (err.response?.status === 409) {
        acceptError.value =
          'Este pedido ya está asignado a otro repartidor.'
      } else {
        acceptError.value =
          'No se ha podido aceptar el pedido. Inténtalo de nuevo.'
      }

      await fetchOrders({ silent: true })

      return false
    } finally {
      if (!disposed) {
        acceptingOrderId.value = null
      }
    }
  }

  onUnmounted(() => {
    disposed = true
    requestId += 1
    clearTimeout(timer)
  })

  return {
    orders,
    isLoading,
    error,
    acceptError,
    acceptingOrderId,
    fetchOrders,
    acceptOrder,
  }
}