// src/composables/useProducts.js
//
// Composable de Vue que encapsula el estado de carga de los productos
// (loading / error / products), para que cualquier vista que necesite
// la carta solo llame a useProducts() sin repetir la logica asincrona.

import { ref } from 'vue'
import { getProducts } from '../services/products.service'

export function useProducts() {
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    isLoading.value = true
    error.value = null
    try {
      products.value = await getProducts()
    } catch (err) {
      error.value = 'No se ha podido cargar la carta. Inténtalo de nuevo más tarde.'
      console.error('[useProducts] Error al obtener los productos:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { products, isLoading, error, fetchProducts }
}
