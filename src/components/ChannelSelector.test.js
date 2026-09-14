import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChannelSelector from './ChannelSelector.vue'
import { useCheckoutStore } from '../stores/checkout'
import * as tablesMock from '../mocks/tables.mock'

let detectSpy

function mountChannelSelector(configureStore) {
  setActivePinia(createPinia())
  const checkoutStore = useCheckoutStore()
  if (configureStore) configureStore(checkoutStore)

  const wrapper = mount(ChannelSelector)

  return { wrapper, checkoutStore }
}

describe('ChannelSelector', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Por defecto, la detección se deja "colgada" (nunca resuelve), para que
    // los tests que no dependen de ella no se vean afectados por su resultado.
    detectSpy = vi.spyOn(tablesMock, 'getLinkedTableMock').mockReturnValue(new Promise(() => {}))
  })

  it('shows "En sala" as active and the table number field by default', () => {
    const { wrapper } = mountChannelSelector()

    expect(wrapper.find('#table-number').exists()).toBe(true)
    expect(wrapper.find('#address-street').exists()).toBe(false)
    expect(
      wrapper.findAll('.channel-selector__toggle-btn').find((btn) => btn.text() === 'En sala')
        .attributes('aria-pressed')
    ).toBe('true')
  })

  it('switches to the address form when "A domicilio" is clicked', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()

    const domicilioBtn = wrapper
      .findAll('.channel-selector__toggle-btn')
      .find((btn) => btn.text() === 'A domicilio')
    await domicilioBtn.trigger('click')

    expect(checkoutStore.channel).toBe('domicilio')
    expect(wrapper.find('#table-number').exists()).toBe(false)
    expect(wrapper.find('#address-street').exists()).toBe(true)
  })

  it('updates the table number in the store when typed', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()

    await wrapper.find('#table-number').setValue('12')

    expect(checkoutStore.tableNumber).toBe('12')
  })

  it('updates each address field in the store without overwriting the others', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()
    const domicilioBtn = wrapper
      .findAll('.channel-selector__toggle-btn')
      .find((btn) => btn.text() === 'A domicilio')
    await domicilioBtn.trigger('click')

    await wrapper.find('#address-street').setValue('Calle Falsa 123')
    await wrapper.find('#address-city').setValue('Oviedo')
    await wrapper.find('#address-postal-code').setValue('33001')

    expect(checkoutStore.address).toEqual({
      street: 'Calle Falsa 123',
      city: 'Oviedo',
      postalCode: '33001',
    })
  })

  it('resets the payment method in the store when the channel changes', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()
    checkoutStore.paymentMethod = 'card'

    const domicilioBtn = wrapper
      .findAll('.channel-selector__toggle-btn')
      .find((btn) => btn.text() === 'A domicilio')
    await domicilioBtn.trigger('click')

    expect(checkoutStore.paymentMethod).toBeNull()
  })

  it('shows a detecting message while the table is being auto-detected', () => {
    const { wrapper } = mountChannelSelector()

    expect(wrapper.text()).toContain('Detectando la mesa de tu dispositivo')
  })

  it('prefills the table number and shows the "Auto-detectada" badge on successful detection', async () => {
    detectSpy.mockResolvedValue({ tableNumber: 5 })
    const { wrapper } = mountChannelSelector()

    await flushPromises()

    expect(wrapper.find('#table-number').element.value).toBe('5')
    expect(wrapper.text()).toContain('Auto-detectada')
  })

  it('shows an error and leaves the field editable when detection fails', async () => {
    detectSpy.mockRejectedValue(new Error('device not linked'))
    const { wrapper } = mountChannelSelector()

    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido detectar la mesa automáticamente')
    expect(wrapper.find('#table-number').element.value).toBe('')
  })

  it('does not trigger detection when the channel is already domicilio on mount', () => {
    mountChannelSelector((checkoutStore) => {
      checkoutStore.channel = 'domicilio'
    })

    expect(detectSpy).not.toHaveBeenCalled()
  })

  it('does not trigger detection when a table number is already set', () => {
    mountChannelSelector((checkoutStore) => {
      checkoutStore.tableNumber = 9
    })

    expect(detectSpy).not.toHaveBeenCalled()
  })
})
