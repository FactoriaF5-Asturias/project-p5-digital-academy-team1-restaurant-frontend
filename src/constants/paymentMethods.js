// src/constants/paymentMethods.js

// Métodos de pago válidos cuando el canal del pedido es "en sala".
// Los métodos de "a domicilio" (tarjeta online, efectivo a la entrega) son
// responsabilidad de otra parte y no se incluyen aquí.
// `backendValue` es el valor real del enum PaymentMethod que espera el
// backend.
// `backendPaymentStatus` es el valor real del enum PaymentStatus que
// devuelve el backend tras confirmar el pedido.
export const DINE_IN_PAYMENT_METHODS = Object.freeze([
  {
    value: 'cashier',
    backendValue: 'CASH_ONSITE',
    backendPaymentStatus: 'PENDING_CASH',
    label: 'Pago en caja',
    pendingStatusLabel: 'pendiente de cobro en caja',
    collectLabel: 'Cobrado en caja',
  },
  {
    value: 'cardOnTable',
    backendValue: 'CARD_ONSITE',
    backendPaymentStatus: 'PENDING_CARD_TERMINAL',
    label: 'Tarjeta en mesa',
    pendingStatusLabel: 'pago pendiente en mesa',
    collectLabel: 'Cobrado con datáfono',
  },
])

// Métodos de pago válidos cuando el canal del pedido es "a domicilio".
// `backendPaymentStatus` ya tiene los valores reales del enum PaymentStatus
// para domicilio.
// `onlineCard` en la práctica no llega a mostrar este estado en pantalla,
// porque OrderConfirmation.vue redirige a Stripe antes de mostrar el
// mensaje de estado de pago — se deja aquí por completitud del contrato.
export const HOME_DELIVERY_PAYMENT_METHODS = Object.freeze([
  {
    value: 'onlineCard',
    backendValue: 'ONLINE_CARD',
    backendPaymentStatus: 'PENDING_ONLINE_PAYMENT',
    label: 'Tarjeta online',
    pendingStatusLabel: 'pendiente de pago online',
  },
  {
    value: 'cashOnDelivery',
    backendValue: 'CASH_ON_DELIVERY',
    backendPaymentStatus: 'PENDING_CASH_ON_DELIVERY',
    label: 'Efectivo a la entrega',
    pendingStatusLabel: 'pendiente de cobro por el repartidor',
  },
])

const ALL_PAYMENT_METHODS = [...DINE_IN_PAYMENT_METHODS, ...HOME_DELIVERY_PAYMENT_METHODS]

// Traduce el valor interno del frontend (p. ej. 'cashier') al valor real
// del enum PaymentMethod que espera el backend (p. ej. 'CASH_ONSITE').
// Devuelve null si no encuentra el método, para no enviar un valor inválido.
export function getBackendPaymentMethod(value) {
  const method = ALL_PAYMENT_METHODS.find((method) => method.value === value)
  return method ? method.backendValue : null
}

// Traduce el paymentStatus real que devuelve el backend al confirmar un
// pedido (p. ej. 'PENDING_CASH') al texto en español que se muestra en el
// resumen del pedido. Devuelve null si no lo reconoce.
export function getPaymentStatusLabel(paymentStatus) {
  if (!paymentStatus) return null

  const method = ALL_PAYMENT_METHODS.find(
    (method) => method.backendPaymentStatus === paymentStatus
  )
  return method ? method.pendingStatusLabel : null
}

// Texto del botón con el que el personal confirma que ha cobrado un pedido de
// sala (p. ej. 'PENDING_CASH' → 'Cobrado en caja'). Null si no se cobra en sala.
export function getCollectPaymentLabel(paymentStatus) {
  const method = DINE_IN_PAYMENT_METHODS.find(
    (method) => method.backendPaymentStatus === paymentStatus
  )
  return method ? method.collectLabel : null
}
