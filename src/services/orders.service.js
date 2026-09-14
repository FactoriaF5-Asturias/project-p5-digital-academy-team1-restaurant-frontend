// src/services/orders.service.js
import api from './api'

const ORDERS_ENDPOINT = '/orders'

export async function createOrder({ items, chefNote }) {
  const response = await api.post(ORDERS_ENDPOINT, { items, chefNote })
  return response.data
}
