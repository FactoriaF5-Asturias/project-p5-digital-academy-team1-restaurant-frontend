// src/utils/mapTicket.js
import { getPaymentStatusLabel } from '../constants/paymentMethods'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  UNKNOWN_LABEL,
  getLabel,
} from '../constants/invoiceLabels'

// Responsabilidad: convertir el TicketDTOResponse del backend en los datos que
// pinta Mi pedido (importes como números y textos en español).

const PAID_LABEL = 'Pagado'

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// El backend pone paymentStatus a null cuando el pedido ya está cobrado.
function getPaymentLabel(paymentStatus) {
  if (paymentStatus == null) return PAID_LABEL
  return capitalize(getPaymentStatusLabel(paymentStatus) ?? UNKNOWN_LABEL)
}

function mapItem(item, index) {
  return {
    id: index,
    name: item.productName,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.lineTotal),
  }
}
// El backend envía la dirección con prefijo (deliveryStreet, deliveryCity...).
function mapAddress(address) {
  if (!address) return null
  return {
    street: address.deliveryStreet,
    city: address.deliveryCity,
    postalCode: address.deliveryPostalCode,
    instructions: address.deliveryInstructions ?? null,
  }
}

export function mapTicket(ticket) {
  return {
    id: ticket.id,
    status: ticket.status,
    statusLabel: getLabel(ORDER_STATUS_LABELS, ticket.status),
    channel: ticket.channel,
    tableNumber: ticket.tableNumber ?? null,
    isPaid: ticket.paymentStatus == null,
    paymentStatusLabel: getPaymentLabel(ticket.paymentStatus),
    paymentMethodLabel: getLabel(PAYMENT_METHOD_LABELS, ticket.paymentMethod),
    items: ticket.items.map(mapItem),
    subtotal: Number(ticket.subtotal),
    discountAmount: Number(ticket.discountAmount ?? 0),
    vatRate: ticket.vatRate,
    vatAmount: Number(ticket.vatAmount),
    deliveryFee: Number(ticket.deliveryFee ?? 0),
    total: Number(ticket.total),
    deliveryAddress: mapAddress(ticket.deliveryAddress),
  }
}