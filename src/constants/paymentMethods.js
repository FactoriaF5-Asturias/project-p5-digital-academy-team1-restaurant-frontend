// src/constants/paymentMethods.js

// Métodos de pago válidos cuando el canal del pedido es "en sala".
// Los métodos de "a domicilio" (tarjeta online, efectivo a la entrega) son
// responsabilidad de otra parte y no se incluyen aquí.
// `backendValue` es el valor real del enum PaymentMethod que espera el
// backend (dev.team1.enums.PaymentMethod)
export const DINE_IN_PAYMENT_METHODS = Object.freeze([
  {
    value: 'cashier',
    backendValue: 'CASH_ONSITE',
    label: 'Pago en caja',
    pendingStatusLabel: 'pendiente de cobro en caja',
  },
  {
    value: 'cardOnTable',
    backendValue: 'CARD_ONSITE',
    label: 'Tarjeta en mesa',
    pendingStatusLabel: 'pago pendiente en mesa',
  },
])

// Traduce el valor interno del frontend (p. ej. 'cashier') al valor real
// del enum PaymentMethod que espera el backend (p. ej. 'CASH_ONSITE').
// Devuelve null si no encuentra el método, para no enviar un valor inválido.
export function getBackendPaymentMethod(value) {
  const method = DINE_IN_PAYMENT_METHODS.find((method) => method.value === value)
  return method ? method.backendValue : null
}
