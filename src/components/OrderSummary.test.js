import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderSummary from './OrderSummary.vue'
import { formatCurrency } from '../utils/formatCurrency'

const BASE_PROPS = {
  subtotal: 17,
  vatRate: 10,
  vatAmount: 1.7,
  total: 18.7,
  paymentMethod: 'Efectivo en caja',
}

function mountSummary(props = {}) {
  return mount(OrderSummary, { props: { ...BASE_PROPS, ...props } })
}

describe('OrderSummary', () => {
  it('shows the amounts in euros with the VAT rate', () => {
    const wrapper = mountSummary()

    expect(wrapper.text()).toContain(formatCurrency(17))
    expect(wrapper.text()).toContain('IVA (10 %)')
    expect(wrapper.text()).toContain(formatCurrency(1.7))
    expect(wrapper.find('.order-summary__row--total').text()).toContain(formatCurrency(18.7))
    expect(wrapper.find('.order-summary__row--method').text()).toContain('Efectivo en caja')
  })

  it('shows the delivery fee only when the order has one', () => {
    expect(mountSummary().find('.order-summary__row--delivery').exists()).toBe(false)

    const wrapper = mountSummary({ deliveryFee: 2.5 })
    expect(wrapper.find('.order-summary__row--delivery').text()).toContain(formatCurrency(2.5))
  })

  it('shows the discount only when an offer was applied', () => {
    expect(mountSummary().find('.order-summary__row--discount').exists()).toBe(false)

    const wrapper = mountSummary({ discountAmount: 3 })
    expect(wrapper.find('.order-summary__row--discount').text()).toContain(formatCurrency(3))
  })

  it('says "Total abonado" when paid and "Total a pagar" when pending', () => {
    expect(mountSummary({ isPaid: true }).find('.order-summary__row--total').text()).toContain(
      'Total abonado',
    )
    expect(mountSummary({ isPaid: false }).find('.order-summary__row--total').text()).toContain(
      'Total a pagar',
    )
  })
})