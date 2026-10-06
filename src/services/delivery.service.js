import api from './api'

const DELIVERY_METRICS_ENDPOINT = '/api/v1/delivery/metrics'
const DELIVERY_ORDERS_ENDPOINT = '/api/v1/delivery/orders'

export async function getDeliveryMetrics() {
  const response = await api.get(DELIVERY_METRICS_ENDPOINT)
  return response.data
}

// Pedidos a domicilio ya listos para salir, que todavía no tienen ningún
// repartidor asignado.
export async function getPendingDeliveries() {
  const response = await api.get(`${DELIVERY_ORDERS_ENDPOINT}/pending`)
  return response.data
}

// El repartidor autenticado se asigna a sí mismo el pedido indicado.
export async function assignOrderToSelf(orderId) {
  const response = await api.patch(`${DELIVERY_ORDERS_ENDPOINT}/${orderId}/assign`)
  return response.data
}

// Marca como "en camino" un pedido que ya tiene repartidor asignado.
export async function markOrderInTransit(orderId) {
  const response = await api.patch(`${DELIVERY_ORDERS_ENDPOINT}/${orderId}/in-transit`)
  return response.data
}

// Marca un pedido en tránsito como entregado. `cashCollected` solo lo exige
// el backend (y solo entonces es obligatorio) para pedidos pagados en
// efectivo a la entrega.
export async function markOrderAsDelivered(orderId, { cashCollected } = {}) {
  const response = await api.patch(`${DELIVERY_ORDERS_ENDPOINT}/${orderId}/status`, {
    cashCollected,
  })
  return response.data
}
