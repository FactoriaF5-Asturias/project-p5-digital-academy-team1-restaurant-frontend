// src/composables/useOrderTicket.js
import { ref } from 'vue'
import { getTicket } from '../services/tickets.service'
import { mapTicket } from '../utils/mapTicket'
import { FINAL_ORDER_STATUS } from '../constants/orderTracking'

// Responsabilidad: cargar el ticket real del pedido en curso y refrescarlo cada
// cierto tiempo para que el cliente vea cómo cambia el estado que marca cocina
// y reparto. `reference` es { id, token } o null si no hay pedido.

export const REFRESH_INTERVAL_MS = 10000

const LOAD_ERROR_MESSAGE = 'No se ha podido cargar tu pedido. Inténtalo de nuevo más tarde.'

export function useOrderTicket(reference) {
  const ticket = ref(null)
  const isLoading = ref(false)
  const loadError = ref('')
  const hasOrder = Boolean(reference?.id)
  let refreshTimer = null

  async function fetchTicket() {
    if (!hasOrder) return

    // Solo se muestra "cargando" la primera vez: en los refrescos se mantiene el ticket.
    isLoading.value = ticket.value === null
    loadError.value = ''

    try {
      ticket.value = mapTicket(await getTicket(reference.id, reference.token))
    } catch (err) {
      if (ticket.value === null) loadError.value = LOAD_ERROR_MESSAGE
      console.error('[useOrderTicket] Error al obtener el ticket:', err)
    } finally {
      isLoading.value = false
    }
  }

  function stopAutoRefresh() {
    clearInterval(refreshTimer)
    refreshTimer = null
  }

  function startAutoRefresh() {
    if (!hasOrder) return

    stopAutoRefresh()
    refreshTimer = setInterval(() => {
      if (ticket.value?.status === FINAL_ORDER_STATUS) {
        stopAutoRefresh()
        return
      }
      fetchTicket()
    }, REFRESH_INTERVAL_MS)
  }

  return {
    ticket,
    isLoading,
    loadError,
    hasOrder,
    fetchTicket,
    startAutoRefresh,
    stopAutoRefresh,
  }
}