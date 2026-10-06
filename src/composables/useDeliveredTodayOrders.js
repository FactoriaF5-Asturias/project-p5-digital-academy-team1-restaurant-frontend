import { ref } from 'vue'
import { getOrdersByStatus } from '../services/orders.service'

function isToday(isoDateTime) {
  const deliveredDate = new Date(isoDateTime)
  const today = new Date()

  return (
    deliveredDate.getFullYear() === today.getFullYear() &&
    deliveredDate.getMonth() === today.getMonth() &&
    deliveredDate.getDate() === today.getDate()
  )
}

export function useDeliveredTodayOrders() {
  const orders = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  // Solo "cargando" la primera vez: al refrescar se mantienen los datos en pantalla.
  let hasLoaded = false

  async function fetchOrders() {
    isLoading.value = !hasLoaded
    error.value = null

    try {
      const deliveredOrders = await getOrdersByStatus('DELIVERED')

      orders.value = deliveredOrders
        .filter((order) => order.deliveredAt && isToday(order.deliveredAt))
        .sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt))
    } catch (err) {
      error.value = 'No se han podido cargar los pedidos entregados hoy.'
      console.error('[useDeliveredTodayOrders] Error al cargar los pedidos:', err)
    } finally {
      isLoading.value = false
      hasLoaded = true
    }
  }

  return { orders, isLoading, error, fetchOrders }
}
