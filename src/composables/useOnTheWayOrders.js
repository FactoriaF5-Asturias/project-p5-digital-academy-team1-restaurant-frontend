import { ref } from 'vue'
import { getOrdersByStatus } from '../services/orders.service'
import { markOrderAsDelivered } from '../services/delivery.service'

const CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'

// Lista provisional de pedidos "en tránsito": mientras no exista la
// asignación real de repartidor ni la acción de marcarlos "en
// tránsito", se piden todos los pedidos en ese estado con el
// endpoint genérico de pedidos, sin filtrar por repartidor asignado.
// Los pedidos en efectivo esperan a que el repartidor confirme el cobro.
export function useOnTheWayOrders() {
  const orders = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  // Pedido en efectivo pendiente de confirmar el cobro.
  const orderToConfirm = ref(null)

  async function fetchOrders() {
    isLoading.value = true
    error.value = null

    try {
      orders.value = await getOrdersByStatus('ONTHEWAY')
    } catch (err) {
      error.value = 'No se han podido cargar los pedidos en tránsito.'
      console.error('[useOnTheWayOrders] Error al cargar los pedidos:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function markDelivered(order) {
    try {
      await markOrderAsDelivered(order.id, {
        cashCollected: order.paymentMethod === CASH_ON_DELIVERY,
      })
      orders.value = orders.value.filter((item) => item.id !== order.id)
    } catch (err) {
      error.value = 'No se ha podido marcar el pedido como entregado.'
      console.error('[useOnTheWayOrders] Error al marcar como entregado:', err)
    }
  }

  function deliverOrder(order) {
    if (order.paymentMethod === CASH_ON_DELIVERY) {
      orderToConfirm.value = order
      return
    }
    return markDelivered(order)
  }

  function confirmCashCollected() {
    const order = orderToConfirm.value
    orderToConfirm.value = null
    return markDelivered(order)
  }

  function cancelCashConfirmation() {
    orderToConfirm.value = null
  }

  return {
    orders,
    isLoading,
    error,
    orderToConfirm,
    fetchOrders,
    deliverOrder,
    confirmCashCollected,
    cancelCashConfirmation,
  }
}