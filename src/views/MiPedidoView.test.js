import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MiPedidoView from './MiPedidoView.vue'
import OrderHistorySection from '../components/OrderHistorySection.vue'
import OrderTicket from '../components/OrderTicket.vue'
import { useAuthStore } from '../stores/auth'

describe('MiPedidoView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the order ticket regardless of session state', async () => {
    const wrapper = mount(MiPedidoView)
    await flushPromises()

    expect(wrapper.findComponent(OrderTicket).exists()).toBe(true)
  })

  it('does not render the order history section without a session', async () => {
    const wrapper = mount(MiPedidoView)
    await flushPromises()

    expect(wrapper.findComponent(OrderHistorySection).exists()).toBe(false)
  })

  it('renders the order history section when there is a session', async () => {
    const wrapper = mount(MiPedidoView)
    const authStore = useAuthStore()
    authStore.user = { id: 1 }
    await flushPromises()

    expect(wrapper.findComponent(OrderHistorySection).exists()).toBe(true)
  })
  
  it('wraps the ticket and the history in the container with side margins', async () => {
    const wrapper = mount(MiPedidoView)
    await flushPromises()

    expect(wrapper.find('main').classes()).toContain('mi-pedido-view')
  })
})
