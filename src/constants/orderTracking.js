// src/constants/orderTracking.js

// Responsabilidad: pasos del seguimiento que ve el cliente en Mi pedido según
// el canal, y en qué paso cae cada OrderStatus que envía el backend.

export const ONSITE_TRACKING_STEPS = Object.freeze(['PLACED', 'PROCESSING', 'READY'])

export const ONLINE_TRACKING_STEPS = Object.freeze([
  'PLACED',
  'PROCESSING',
  'READY',
  'ONTHEWAY',
  'DELIVERED',
])

export const DELAYED_ORDER_STATUS = 'DELAYED'
export const FINAL_ORDER_STATUS = 'DELIVERED'

const ONLINE_CHANNEL = 'ONLINE'

// PAID solo llega desde PLACED (pago online confirmado): para el cliente el
// pedido sigue "Recibido". DELAYED sigue en preparación (se avisa aparte).
const STEP_FOR_STATUS = Object.freeze({
  PAID: 'PLACED',
  [DELAYED_ORDER_STATUS]: 'PROCESSING',
})

export function getTrackingSteps(channel) {
  return channel === ONLINE_CHANNEL ? ONLINE_TRACKING_STEPS : ONSITE_TRACKING_STEPS
}

// Devuelve -1 si el estado no pertenece a los pasos de ese canal.
export function getCurrentStepIndex(steps, status) {
  return steps.indexOf(STEP_FOR_STATUS[status] ?? status)
}