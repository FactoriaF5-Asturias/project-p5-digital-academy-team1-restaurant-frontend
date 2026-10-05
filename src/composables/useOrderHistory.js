import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getOrderHistory } from '../services/orderHistory.service'

const PAGE_SIZE = 3

export function useOrderHistory() {
  const authStore = useAuthStore()

  const orders = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  let requestId = 0

  function resetHistory() {
    orders.value = []
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  async function fetchHistory(page = 1) {
    const userId = authStore.user?.id
    const currentRequest = ++requestId

    if (!userId) {
      resetHistory()
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await getOrderHistory(userId, {
        page,
        size: PAGE_SIZE,
      })

      if (currentRequest !== requestId) return

      orders.value = result.items
      currentPage.value = result.page
      totalPages.value = result.totalPages
      totalItems.value = result.totalItems
    } catch {
      if (currentRequest !== requestId) return

      error.value =
        'No se ha podido cargar tu historial de pedidos. Inténtalo de nuevo más tarde.'
    } finally {
      if (currentRequest === requestId) {
        isLoading.value = false
      }
    }
  }

  function goToPage(page) {
    if (
      isLoading.value ||
      page < 1 ||
      page > totalPages.value ||
      page === currentPage.value
    ) {
      return
    }

    return fetchHistory(page)
  }

  watch(
    () => authStore.user?.id,
    (userId) => {
      requestId++
      resetHistory()
      isLoading.value = false

      if (userId) {
        fetchHistory(1)
      }
    },
  )

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