import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PerfilView from './PerfilView.vue'
import ExclusiveOffersCard from '../components/ExclusiveOffersCard.vue'
import * as offersService from '../services/offers.service'
import { useAuthStore } from '../stores/auth'

async function mountAs(role) {
  useAuthStore().role = role
  const wrapper = mount(PerfilView)
  await flushPromises()
  return wrapper
}

describe('PerfilView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([])
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    const wrapper = await mountAs('ROLE_CUSTOMER')

    expect(wrapper.find('.perfil-view__title').text()).toBe('Mi Perfil')
  })

  it('renders the ExclusiveOffersCard widget for a customer', async () => {
    const wrapper = await mountAs('ROLE_CUSTOMER')

    expect(wrapper.findComponent(ExclusiveOffersCard).exists()).toBe(true)
  })

  it.each(['ROLE_ADMIN', 'ROLE_COOK', 'ROLE_DELIVERYMAN'])(
    'does not render the exclusive offers nor request them for %s',
    async (role) => {
      const wrapper = await mountAs(role)

      expect(wrapper.findComponent(ExclusiveOffersCard).exists()).toBe(false)
      expect(offersService.getExclusiveOffers).not.toHaveBeenCalled()
    }
  )
})