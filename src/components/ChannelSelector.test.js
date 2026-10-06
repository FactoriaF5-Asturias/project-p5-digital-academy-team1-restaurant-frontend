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

    it('lets the customer choose only an existing table, from 1 to 10', async () => {
    const { wrapper, checkoutStore } = await mountChannelSelector()

    const options = wrapper.findAll('#table-number option').map((option) => option.text())
    expect(options).toEqual([
      'Elige tu mesa', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    ])

    await wrapper.find('#table-number').setValue(7)

    expect(checkoutStore.tableNumber).toBe(7)
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

  describe('delivery address', () => {
    const CUSTOMER_WITH_ADDRESS = {
      id: 1,
      address: 'Calle Mayor 1',
      city: 'Avilés',
      postalCode: '33400',
    }

    function findOption(wrapper, title) {
      return wrapper
        .findAll('.channel-selector__address-option')
        .find((option) => option.text().includes(title))
    }

    it('suggests the profile address when the customer has a complete one', async () => {
      const { wrapper, checkoutStore } = await mountChannelSelector((_, authStore) => {
        authStore.user = CUSTOMER_WITH_ADDRESS
      })

      await findDomicilioBtn(wrapper).trigger('click')

      const profileOption = findOption(wrapper, 'Mi dirección del perfil')
      expect(profileOption.attributes('aria-checked')).toBe('true')
      expect(profileOption.text()).toContain('Calle Mayor 1 · 33400 Avilés')
      expect(checkoutStore.address).toEqual({
        street: 'Calle Mayor 1',
        city: 'Avilés',
        postalCode: '33400',
      })
      expect(wrapper.find('#address-street').exists()).toBe(false)
    })

    it('shows empty required fields when the customer chooses another address', async () => {
      const { wrapper, checkoutStore } = await mountChannelSelector((_, authStore) => {
        authStore.user = CUSTOMER_WITH_ADDRESS
      })
      await findDomicilioBtn(wrapper).trigger('click')

      await findOption(wrapper, 'Otra dirección').trigger('click')

      expect(checkoutStore.address).toBeNull()
      expect(wrapper.find('#address-street').element.value).toBe('')
      expect(wrapper.find('#address-street').attributes('required')).toBeDefined()
      expect(wrapper.findAll('.channel-selector__required')).toHaveLength(3)
    })

    it('does not offer the profile address when it is incomplete', async () => {
      const { wrapper } = await mountChannelSelector((_, authStore) => {
        authStore.user = { id: 1, address: 'Calle Mayor 1', city: '', postalCode: '' }
      })

      await findDomicilioBtn(wrapper).trigger('click')

      expect(wrapper.find('.channel-selector__address-options').exists()).toBe(false)
      expect(wrapper.find('#address-street').exists()).toBe(true)
    })

    it('marks in red each missing field after trying to confirm, and clears it once typed', async () => {
      const { wrapper, checkoutStore } = await mountChannelSelector((_, authStore) => {
        authStore.user = { id: 1 }
      })
      await findDomicilioBtn(wrapper).trigger('click')
      await wrapper.find('#address-street').setValue('Calle Uría 10')

      checkoutStore.revealAddressErrors()
      await flushPromises()

      expect(wrapper.find('#address-street-error').exists()).toBe(false)
      expect(wrapper.find('#address-city-error').text()).toBe('Indica la ciudad.')
      expect(wrapper.find('#address-postal-code-error').text()).toBe('Indica el código postal.')
      expect(wrapper.find('#address-city').attributes('aria-invalid')).toBe('true')

      await wrapper.find('#address-city').setValue('Oviedo')

      expect(wrapper.find('#address-city-error').exists()).toBe(false)
    })
  })
})
