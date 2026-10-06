import { ref } from 'vue'
import { getSalesKpi } from '../services/kpi.service'

// Responsabilidad: estado de los KPI de ventas (datos, carga y error).

const LOAD_ERROR_MESSAGE = 'No se han podido cargar los KPI de ventas. Inténtalo de nuevo más tarde.'

export function useSalesKpi() {
  const kpi = ref(null)
  const isLoading = ref(false)
  const loadError = ref('')

  // Solo "cargando" la primera vez: al refrescar se mantienen los datos en pantalla.
  let hasLoaded = false

  async function loadKpi() {
    isLoading.value = !hasLoaded
    loadError.value = ''

    try {
      kpi.value = await getSalesKpi()
    } catch (err) {
      kpi.value = null
      loadError.value = LOAD_ERROR_MESSAGE
      console.error('[useSalesKpi] Error al obtener los KPI de ventas:', err)
    } finally {
      isLoading.value = false
      hasLoaded = true
    }
  }

  return {
    kpi,
    isLoading,
    loadError,
    loadKpi,
  }
}