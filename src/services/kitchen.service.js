import api from './api'

const KITCHEN_ENDPOINT = '/api/v1/kitchen'

export async function getKitchenOrders(channel = 'ALL') {
  const params = channel === 'ALL' ? {} : { channel }

  const { data } = await api.get(`${KITCHEN_ENDPOINT}/orders`, {
    params,
  })

  return data.map((order) => ({
    id: order.id,
    status: order.status,
    channel: order.channel,
    priorityNote: order.chefNote,
    isDelayed: order.isDelayed,
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    products: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
    })),
  }))
}

export async function getKitchenChannelCounts() {
  const { data } = await api.get(
    `${KITCHEN_ENDPOINT}/orders/counts`,
  )

  return data
}

export async function getKitchenMetrics() {
  const { data } = await api.get(`${KITCHEN_ENDPOINT}/metrics`)

  return data
}

export async function updateKitchenOrderStatus(orderId, status) {
  const { data } = await api.patch(
    `${KITCHEN_ENDPOINT}/orders/${orderId}/status`,
    { status },
  )

  return data
}