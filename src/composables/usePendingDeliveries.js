import { ref } from 'vue'
import {
  getPendingDeliveries,
  assignOrderToSelf,
  markOrderInTransit,
} from '../services/delivery.service'

// Aceptar un pedido asigna el repartidor y lo pone en tránsito en la misma
// acción.
export function usePendingDeliveries() {
  const orders = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  const acceptError = ref(null)
  const acceptingOrderId = ref(null)

  async function fetchOrders() {
    isLoading.value = true
    error.value = null

    try {
      orders.value = await getPendingDeliveries()
    } catch (err) {
      error.value = 'No se han podido cargar los pedidos pendientes de reparto.'
      console.error('[usePendingDeliveries] Error al cargar los pedidos:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function acceptOrder(order) {
    acceptError.value = null
    acceptingOrderId.value = order.id

    try {
      await assignOrderToSelf(order.id)
      await markOrderInTransit(order.id)
      orders.value = orders.value.filter((item) => item.id !== order.id)
    } catch (err) {
      acceptError.value =
        'No se ha podido aceptar este pedido. Puede que ya lo haya tomado otro repartidor.'
      console.error('[usePendingDeliveries] Error al aceptar el pedido:', err)
    } finally {
      acceptingOrderId.value = null
    }
  }

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
