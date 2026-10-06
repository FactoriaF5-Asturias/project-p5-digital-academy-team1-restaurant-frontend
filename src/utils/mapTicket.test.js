import { describe, it, expect } from 'vitest'
import { mapTicket } from './mapTicket'

const HOME_DELIVERY_TICKET = {
  id: 42,
  status: 'ONTHEWAY',
  channel: 'ONLINE',
  tableNumber: null,
  createdAt: '2026-10-05T20:10:00',
  paidAt: null,
  items: [
    { productName: 'Pull Nigiri', quantity: 2, unitPrice: 8.5, lineTotal: 17 },
  ],
  subtotal: 17,
  discountAmount: 0,
  vatRate: 10,
  vatAmount: 1.7,
  deliveryFee: 2.5,
  total: 21.2,
  paymentMethod: 'CASH_ON_DELIVERY',
  paymentStatus: 'PENDING_CASH_ON_DELIVERY',
    deliveryAddress: {
    deliveryStreet: 'Calle Mayor 1',
    deliveryCity: 'Avilés',
    deliveryPostalCode: '33400',
    deliveryInstructions: '2º B',
  },
}

describe('mapTicket', () => {
  it('maps the order data and the item lines', () => {
    const ticket = mapTicket(HOME_DELIVERY_TICKET)

    expect(ticket.id).toBe(42)
    expect(ticket.channel).toBe('ONLINE')
    expect(ticket.items).toEqual([
      { id: 0, name: 'Pull Nigiri', quantity: 2, unitPrice: 8.5, lineTotal: 17 },
    ])
  })
  
  it('maps the delivery address fields sent by the backend', () => {
    const ticket = mapTicket(HOME_DELIVERY_TICKET)

    expect(ticket.deliveryAddress).toEqual({
      street: 'Calle Mayor 1',
      city: 'Avilés',
      postalCode: '33400',
      instructions: '2º B',
    })
  })

  it('maps the amounts as numbers', () => {
    const ticket = mapTicket({ ...HOME_DELIVERY_TICKET, total: '21.20' })

    expect(ticket.subtotal).toBe(17)
    expect(ticket.vatRate).toBe(10)
    expect(ticket.vatAmount).toBe(1.7)
    expect(ticket.deliveryFee).toBe(2.5)
    expect(ticket.total).toBe(21.2)
  })

  it('translates the status, the payment method and a pending payment', () => {
    const ticket = mapTicket(HOME_DELIVERY_TICKET)

    expect(ticket.statusLabel).toBe('En reparto')
    expect(ticket.paymentMethodLabel).toBe('Efectivo a la entrega')
    expect(ticket.isPaid).toBe(false)
    expect(ticket.paymentStatusLabel).toBe('Pendiente de cobro por el repartidor')
  })

  it('shows the order as paid when the backend sends no payment status', () => {
    const ticket = mapTicket({ ...HOME_DELIVERY_TICKET, paymentStatus: null })

    expect(ticket.isPaid).toBe(true)
    expect(ticket.paymentStatusLabel).toBe('Pagado')
  })

  it('uses zero and null for the fields an order in the restaurant does not have', () => {
    const ticket = mapTicket({
      ...HOME_DELIVERY_TICKET,
      channel: 'ONSITE',
      tableNumber: 3,
      deliveryFee: null,
      discountAmount: null,
      deliveryAddress: null,
    })

    expect(ticket.tableNumber).toBe(3)
    expect(ticket.deliveryFee).toBe(0)
    expect(ticket.discountAmount).toBe(0)
    expect(ticket.deliveryAddress).toBeNull()
  })
})