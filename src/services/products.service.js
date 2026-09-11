// src/services/products.service.js
//
// Punto unico de acceso a los datos de productos de la Carta.
// Ahora mismo usa datos mock; cuando exista GET /products,
// solo hay que cambiar el interior de getProducts() por la llamada real,
// sin tocar nada de lo que lo consume.

import { mockProducts } from '../mocks/products.mock'

const simulateNetworkDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export async function getProducts({ page = 1, size = 10 } = {}) {
  // TODO: sustituir por la llamada real cuando exista el endpoint, p. ej.:
  // import api from './api'
  // const { data } = await api.get('/products', { params: { page, size } })
  // return data

  await simulateNetworkDelay()

  const activeProducts = mockProducts.filter((product) => product.active)
  const total = activeProducts.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const start = (page - 1) * size
  const items = activeProducts.slice(start, start + size)

  return { items, total, totalPages, page, size }
}
