// Textos en español para los valores de enum que envía el backend en las facturas
// (dev.team1.enums.OrderChannel, PaymentMethod y OrderStatus).

export const CHANNEL_LABELS = Object.freeze({
  ONSITE: 'Sala',
  ONLINE: 'A domicilio',
})

export const PAYMENT_METHOD_LABELS = Object.freeze({
  CASH_ONSITE: 'Efectivo en caja',
  CARD_ONSITE: 'Tarjeta en mesa',
  ONLINE_CARD: 'Tarjeta online',
  CASH_ON_DELIVERY: 'Efectivo a la entrega',
})

export const ORDER_STATUS_LABELS = Object.freeze({
  PLACED: 'Recibido',
  PROCESSING: 'En preparación',
  PAID: 'Pagado',
  DELAYED: 'Con retraso',
  READY: 'Listo',
  ONTHEWAY: 'En reparto',
  DELIVERED: 'Entregado',
})

// Se muestra cuando el backend envía un valor vacío o que todavía no conocemos.
export const UNKNOWN_LABEL = '—'

export function getLabel(labels, value) {
  return labels[value] ?? UNKNOWN_LABEL
}