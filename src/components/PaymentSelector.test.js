import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PaymentSelector from './PaymentSelector.vue'
import { useCheckoutStore } from '../stores/checkout'

function mountPaymentSelector() {
  const wrapper = mount(PaymentSelector)
  const checkoutStore = useCheckoutStore()

  return { wrapper, checkoutStore }
}

describe('PaymentSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not render when the channel is domicilio', async () => {
    const { wrapper, checkoutStore } = mountPaymentSelector()
    checkoutStore.channel = 'domicilio'
    await flushPromises()

    expect(wrapper.find('.payment-selector').exists()).toBe(false)
  })

  it('renders both dine-in payment options when the channel is sala', () => {
    const { wrapper } = mountPaymentSelector()

    const options = wrapper.findAll('.payment-selector__option')
    expect(options).toHaveLength(2)
    expect(options[0].text()).toBe('Pago en caja')
    expect(options[1].text()).toBe('Tarjeta en mesa')
  })

  it('shows a hint instead of a status when no payment method is selected yet', () => {
    const { wrapper } = mountPaymentSelector()

    expect(wrapper.find('.payment-selector__hint').exists()).toBe(true)
    expect(wrapper.find('.payment-selector__status').exists()).toBe(false)
  })

  it('selects a payment method and updates the store when an option is clicked', async () => {
    const { wrapper, checkoutStore } = mountPaymentSelector()

    const options = wrapper.findAll('.payment-selector__option')
    await options[0].trigger('click')

    expect(checkoutStore.paymentMethod).toBe('cashier')
  })

  it('shows the pending status label for the selected payment method', async () => {
    const { wrapper } = mountPaymentSelector()

    const options = wrapper.findAll('.payment-selector__option')
    await options[1].trigger('click')

    expect(wrapper.find('.payment-selector__status').text()).toBe(
      'Se marcará como: pago pendiente en mesa',
    )
  })
})
