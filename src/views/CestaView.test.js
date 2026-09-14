import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import CestaView from './CestaView.vue'
import CartSummary from '../components/CartSummary.vue'
import ChannelSelector from '../components/ChannelSelector.vue'
import ChefNoteField from '../components/ChefNoteField.vue'
import { useCartStore } from '../stores/cart'

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/cesta', name: 'cesta', component: CestaView },
]

async function mountCestaView() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/cesta')
  await router.isReady()

  setActivePinia(createPinia())
  const cartStore = useCartStore()

  const wrapper = mount(CestaView, {
    global: { plugins: [router] },
  })

  return { wrapper, cartStore }
}

describe('CestaView', () => {
  it('renders the page title', async () => {
    const { wrapper } = await mountCestaView()

    expect(wrapper.find('.cesta-view__title').text()).toBe('Tu cesta')
  })

  it('renders the CartSummary widget', async () => {
    const { wrapper } = await mountCestaView()

    expect(wrapper.findComponent(CartSummary).exists()).toBe(true)
  })

  it('renders the ChannelSelector widget', async () => {
    const { wrapper } = await mountCestaView()

    expect(wrapper.findComponent(ChannelSelector).exists()).toBe(true)
  })

  it('renders the ChefNoteField widget', async () => {
    const { wrapper } = await mountCestaView()

    expect(wrapper.findComponent(ChefNoteField).exists()).toBe(true)
  })

  it('shows the empty-cart state when there are no products', async () => {
    const { wrapper } = await mountCestaView()

    expect(wrapper.text()).toContain('Tu cesta está vacía')
  })

  it('shows the cart contents when the store has products', async () => {
    const { wrapper, cartStore } = await mountCestaView()
    cartStore.addProduct({ id: 1, name: 'Salmon Roll', price: 10 })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Salmon Roll')
  })
})
