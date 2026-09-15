import { ref } from 'vue'
import { getLinkedTable } from '../services/tables.service'
import { useCheckoutStore } from '../stores/checkout'

export function useTableDetection() {
  const checkoutStore = useCheckoutStore()
  const isLoading = ref(false)
  const error = ref(null)

  async function detectTable() {
    isLoading.value = true
    error.value = null
    try {
      const table = await getLinkedTable()
      checkoutStore.setAutoDetectedTable(table.tableNumber)
    } catch (err) {
      error.value = 'No se ha podido detectar la mesa automáticamente.'
      console.error('[useTableDetection] Error al detectar la mesa:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    detectTable,
  }
}
