// src/services/products.service.js
//
// Punto unico de acceso a los datos de productos de la Carta.
// Ahora mismo usa datos mock; cuando exista GET /products,
// solo hay que cambiar el interior de getProducts() por la llamada real,
// sin tocar nada de lo que lo consume.

import { mockProducts } from '../mocks/products.mock'

// Simula la latencia de una llamada real para poder probar los estados
// de carga sin depender todavia del backend.
const simulateNetworkDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export async function getProducts() {
  // TODO: sustituir por la llamada real cuando exista el endpoint, p. ej.:
  // import api from './api'
  // const { data } = await api.get('/products')
  // return data

  await simulateNetworkDelay()
  return mockProducts.filter((product) => product.active)
}
