import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderTicket from './OrderTicket.vue'
import OrderStatusTracker from './OrderStatusTracker.vue'
import DeliveryDestination from './DeliveryDestination.vue'
import OrderSummary from './OrderSummary.vue'
import { formatCurrency } from '../utils/formatCurrency'

const HOME_DELIVERY_TICKET = {
  id: 42,
  status: 'ONTHEWAY',
  statusLabel: 'En reparto',
  channel: 'ONLINE',
  tableNumber: null,
  isPaid: false,
  paymentStatusLabel: 'Pendiente de cobro por el repartidor',
  paymentMethodLabel: 'Efectivo a la entrega',
  items: [{ id: 0, name: 'Pull Nigiri', quantity: 2, unitPrice: 8.5, lineTotal: 17 }],
  subtotal: 17,
  discountAmount: 0,
  vatRate: 10,
  vatAmount: 1.7,
  deliveryFee: 2.5,
  total: 21.2,
  deliveryAddress: { street: 'Calle Mayor 1', city: 'Avilés', postalCode: '33400', instructions: null },
}

const ONSITE_PAID_TICKET = {
  ...HOME_DELIVERY_TICKET,
  status: 'READY',
  channel: 'ONSITE',
  tableNumber: 3,
  isPaid: true,
  paymentStatusLabel: 'Pagado',
  deliveryFee: 0,
  deliveryAddress: null,
}

function mountTicket(ticket) {
  return mount(OrderTicket, { props: { ticket } })
}

describe('OrderTicket', () => {
  it('shows the real order number and the pending payment badge', () => {
    const wrapper = mountTicket(HOME_DELIVERY_TICKET)

    expect(wrapper.find('.order-ticket__title').text()).toBe('Pedido #42')
    const badge = wrapper.find('.order-ticket__badge')
    expect(badge.text()).toBe('Pendiente de cobro por el repartidor')
    expect(badge.classes()).toContain('order-ticket__badge--pending')
  })

  it('shows the paid badge and the table for an order in the restaurant', () => {
    const wrapper = mountTicket(ONSITE_PAID_TICKET)

    expect(wrapper.find('.order-ticket__badge').classes()).toContain('order-ticket__badge--paid')
    expect(wrapper.find('.order-ticket__channel').text()).toBe('Mesa 3')
  })

  it('shows each line with quantity, unit price and line total', () => {
    const wrapper = mountTicket(HOME_DELIVERY_TICKET)
    const item = wrapper.find('.order-ticket__item')

    expect(item.find('.order-ticket__item-name').text()).toBe('Pull Nigiri')
    expect(item.find('.order-ticket__item-detail').text()).toBe(`2 × ${formatCurrency(8.5)}`)
    expect(item.find('.order-ticket__item-total').text()).toBe(formatCurrency(17))
  })

  it('passes the status and channel to the tracker', () => {
    const tracker = mountTicket(HOME_DELIVERY_TICKET).findComponent(OrderStatusTracker)

    expect(tracker.props()).toEqual({ status: 'ONTHEWAY', channel: 'ONLINE' })
  })

  it('shows the delivery destination only for home delivery orders', () => {
    expect(mountTicket(HOME_DELIVERY_TICKET).findComponent(DeliveryDestination).exists()).toBe(true)
    expect(mountTicket(ONSITE_PAID_TICKET).findComponent(DeliveryDestination).exists()).toBe(false)
  })

  it('passes the amounts and the translated payment method to the summary', () => {
    const summary = mountTicket(HOME_DELIVERY_TICKET).findComponent(OrderSummary)

    expect(summary.props()).toMatchObject({
      subtotal: 17,
      vatRate: 10,
      vatAmount: 1.7,
      deliveryFee: 2.5,
      total: 21.2,
      paymentMethod: 'Efectivo a la entrega',
      isPaid: false,
    })
  })
})