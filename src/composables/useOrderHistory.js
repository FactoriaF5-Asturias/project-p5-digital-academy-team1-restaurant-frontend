import { ref } from 'vue'
import { getOrderHistory } from '../mocks/orderHistory.mock'

const PAGE_SIZE = 3

export function useOrderHistory() {
  const orders = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  async function fetchHistory(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const result = await getOrderHistory({ page, size: PAGE_SIZE })
      orders.value = result.items
      currentPage.value = result.page
      totalPages.value = result.totalPages
      totalItems.value = result.totalItems
    } catch (err) {
      error.value = 'No se ha podido cargar tu historial de pedidos. Inténtalo de nuevo más tarde.'
      console.error('[useOrderHistory] Error al obtener el historial:', err)
    } finally {
      isLoading.value = false
    }
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    fetchHistory(page)
  }

  return {
    orders,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    fetchHistory,
    goToPage,
  }
}
