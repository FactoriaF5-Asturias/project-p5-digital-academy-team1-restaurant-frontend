import { ref } from 'vue'
import { getProducts, DEFAULT_PAGE_SIZE } from '../services/products.service'

export function useProducts() {
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  async function fetchProducts(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const result = await getProducts({ page, size: DEFAULT_PAGE_SIZE })
      products.value = result.items
      currentPage.value = result.page
      totalPages.value = result.totalPages
      totalItems.value = result.totalItems
    } catch (err) {
      error.value = 'No se ha podido cargar la carta. Inténtalo de nuevo más tarde.'
      console.error('[useProducts] Error al obtener los productos:', err)
    } finally {
      isLoading.value = false
    }
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    fetchProducts(page)
  }

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    fetchProducts,
    goToPage,
  }
}
