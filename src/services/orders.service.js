// src/services/orders.service.js
import api from './api'

const ORDERS_ENDPOINT = '/orders'

// Traduce el canal interno del frontend ('sala'/'domicilio') al valor real
// del enum OrderChannel que espera el backend ('ONSITE'/'ONLINE').
const CHANNEL_TO_BACKEND = {
  sala: 'ONSITE',
  domicilio: 'ONLINE',
}

export async function createOrder({ items, chefNote, channel, paymentMethod }) {
  const response = await api.post(ORDERS_ENDPOINT, {
    items,
    chefNote,
    channel: CHANNEL_TO_BACKEND[channel] ?? channel,
    paymentMethod,
  })
  return response.data
}
