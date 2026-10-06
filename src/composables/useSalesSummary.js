import { computed, ref } from 'vue'
import { getSalesSummary } from '../services/reports.service'

// Responsabilidad: estado de los totales del periodo (carga, error y datos)
// y cálculo del ticket medio.

const LOAD_ERROR_MESSAGE = 'No se ha podido cargar el resumen de ventas. Inténtalo de nuevo más tarde.'

export function useSalesSummary() {
  const summary = ref(null)
  const isLoading = ref(false)
  const loadError = ref('')

  const averageTicket = computed(() => {
    if (!summary.value?.orders) return 0
    return summary.value.revenue / summary.value.orders
  })

  // Solo "cargando" la primera vez: al refrescar se mantienen los datos en pantalla.
  let hasLoaded = false

  async function loadSummary(period) {
    isLoading.value = !hasLoaded
    loadError.value = ''

    try {
      summary.value = await getSalesSummary(period)
    } catch (err) {
      summary.value = null
      loadError.value = LOAD_ERROR_MESSAGE
      console.error('[useSalesSummary] Error al obtener el resumen de ventas:', err)
    } finally {
      isLoading.value = false
      hasLoaded = true
    }
  }

  return {
    summary,
    isLoading,
    loadError,
    averageTicket,
    loadSummary,
  }
}