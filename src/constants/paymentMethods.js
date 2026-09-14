// src/constants/paymentMethods.js

// Métodos de pago válidos cuando el canal del pedido es "en sala".
// Los métodos de "a domicilio" (tarjeta online, efectivo a la entrega) son
// responsabilidad de otra parte y no se incluyen aquí.
export const DINE_IN_PAYMENT_METHODS = Object.freeze([
  {
    value: 'cashier',
    label: 'Pago en caja',
    pendingStatusLabel: 'pendiente de cobro en caja',
  },
  {
    value: 'cardOnTable',
    label: 'Tarjeta en mesa',
    pendingStatusLabel: 'pago pendiente en mesa',
  },
])
