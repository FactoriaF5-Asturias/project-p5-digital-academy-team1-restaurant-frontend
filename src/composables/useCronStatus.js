// src/composables/useCronStatus.js
import { ref } from 'vue'
import { getCronStatus } from '../services/cronStatus.service'

// Responsabilidad: estado del "Cloud Automation Service" (datos, carga y error de red).

const LOAD_ERROR_MESSAGE =
  'No se ha podido comprobar el estado del servicio. Inténtalo de nuevo más tarde.'

export function useCronStatus() {
  const status = ref(null)
  const isLoading = ref(false)
  const loadError = ref('')

  async function fetchStatus() {
    isLoading.value = true
    loadError.value = ''

    try {
      status.value = await getCronStatus()
    } catch (err) {
      status.value = null
      loadError.value = LOAD_ERROR_MESSAGE
      console.error('[useCronStatus] Error al comprobar el estado del servicio:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    status,
    isLoading,
    loadError,
    fetchStatus,
  }
}
