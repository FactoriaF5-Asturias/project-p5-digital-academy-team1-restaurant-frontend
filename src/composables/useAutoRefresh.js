// src/composables/useAutoRefresh.js
import { onMounted, onUnmounted } from 'vue'
import { AUTO_REFRESH_INTERVAL_MS } from '../constants/autoRefresh'

// Responsabilidad: volver a ejecutar `refresh` cada cierto tiempo mientras la
// vista está abierta. La primera carga la sigue haciendo cada vista al montarse.
export function useAutoRefresh(refresh, intervalMs = AUTO_REFRESH_INTERVAL_MS) {
  let timer = null

  onMounted(() => {
    timer = setInterval(refresh, intervalMs)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })
}
