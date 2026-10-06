import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import ChannelSelector from './ChannelSelector.vue'
import { useCheckoutStore } from '../stores/checkout'
import { useAuthStore } from '../stores/auth'
import * as tablesService from '../services/tables.service'

let detectSpy

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
]

async function mountChannelSelector(configureStore) {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/')
  await router.isReady()

  setActivePinia(createPinia())
  const checkoutStore = useCheckoutStore()
  const authStore = useAuthStore()
  if (configureStore) configureStore(checkoutStore, authStore)

  const wrapper = mount(ChannelSelector, {
    global: { plugins: [router] },
  })

  return { wrapper, checkoutStore, authStore, router }
}

function findDomicilioBtn(wrapper) {
  return wrapper
    .findAll('.channel-selector__toggle-btn')
    .find((btn) => btn.text() === 'A domicilio')
}

describe('ChannelSelector', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Por defecto, la detección se deja "colgada" (nunca resuelve), para que
    // los tests que no dependen de ella no se vean afectados por su resultado.
    detectSpy = vi.spyOn(tablesService, 'getLinkedTable').mockReturnValue(new Promise(() => {}))
  })

  it('shows "En sala" as active and the table number field by default', async () => {
    const { wrapper } = await mountChannelSelector()

    expect(wrapper.find('#table-number').exists()).toBe(true)
    expect(wrapper.find('#address-street').exists()).toBe(false)
    expect(
      wrapper.findAll('.channel-selector__toggle-btn').find((btn) => btn.text() === 'En sala')
        .attributes('aria-pressed')
    ).toBe('true')
  })

  it('switches to the address form when "A domicilio" is clicked with a session', async () => {
    const { wrapper, checkoutStore } = await mountChannelSelector((_, authStore) => {
      authStore.user = { id: 1 }
    })

    await findDomicilioBtn(wrapper).trigger('click')

    expect(checkoutStore.channel).toBe('domicilio')
    expect(wrapper.find('#table-number').exists()).toBe(false)
    expect(wrapper.find('#address-street').exists()).toBe(true)
  })

  it('redirects to login instead of switching channel when "A domicilio" is clicked without a session', async () => {
    const { wrapper, checkoutStore, router } = await mountChannelSelector()

    await findDomicilioBtn(wrapper).trigger('click')
    await flushPromises()

    expect(checkoutStore.channel).toBe('sala')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('updates the table number in the store when typed', async () => {
    const { wrapper, checkoutStore } = await mountChannelSelector()

    await wrapper.find('#table-number').setValue('12')

    expect(checkoutStore.tableNumber).toBe('12')
  })

  it('updates each address field in the store without overwriting the others', async () => {
    const { wrapper, checkoutStore } = await mountChannelSelector((_, authStore) => {
      authStore.user = { id: 1 }
    })
    await findDomicilioBtn(wrapper).trigger('click')

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
    const { wrapper, checkoutStore } = await mountChannelSelector((_, authStore) => {
      authStore.user = { id: 1 }
    })
    checkoutStore.paymentMethod = 'card'

    await findDomicilioBtn(wrapper).trigger('click')

    expect(checkoutStore.paymentMethod).toBeNull()
  })

  it('shows a detecting message while the table is being auto-detected', async () => {
    const { wrapper } = await mountChannelSelector()

    await flushPromises()

    expect(wrapper.text()).toContain('Detectando la mesa de tu dispositivo')
  })

  it('prefills the table number and shows the "Auto-detectada" badge on successful detection', async () => {
    detectSpy.mockResolvedValue({ tableNumber: 5 })
    const { wrapper } = await mountChannelSelector()

    await flushPromises()

    expect(wrapper.find('#table-number').element.value).toBe('5')
    expect(wrapper.text()).toContain('Auto-detectada')
  })

  it('shows an error and leaves the field editable when detection fails', async () => {
    detectSpy.mockRejectedValue(new Error('device not linked'))
    const { wrapper } = await mountChannelSelector()

    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido detectar la mesa automáticamente')
    expect(wrapper.find('#table-number').element.value).toBe('')
  })

  it('does not trigger detection when the channel is already domicilio on mount', async () => {
    await mountChannelSelector((checkoutStore) => {
      checkoutStore.channel = 'domicilio'
    })

    expect(detectSpy).not.toHaveBeenCalled()
  })

  it('does not trigger detection when a table number is already set', async () => {
    await mountChannelSelector((checkoutStore) => {
      checkoutStore.tableNumber = 9
    })

    expect(detectSpy).not.toHaveBeenCalled()
  })
})
