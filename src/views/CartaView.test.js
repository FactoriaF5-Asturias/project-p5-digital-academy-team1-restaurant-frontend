import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import CartaView from './CartaView.vue'
import ProductCard from '../components/ProductCard.vue'
import PaginationControl from '../components/PaginationControl.vue'
import * as productsService from '../services/products.service'
import { useCartStore } from '../stores/cart'

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/mi-pedido', name: 'mi-pedido', component: { template: '<div>Mi pedido</div>' } },
]

function buildResult(overrides = {}) {
  return {
    items: [
      { id: 1, name: 'Salmon Roll', description: 'Roll fresco', price: 8.5, imageUrl: 'salmon.png' },
    ],
    page: 1,
    size: 12,
    totalItems: 1,
    totalPages: 1,
    isFirstPage: true,
    isLastPage: true,
    ...overrides,
  }
}

async function mountCartaView() {
  const router = createRouter({ history: createWebHistory(), routes })
  router.push('/')
  await router.isReady()

  const pinia = createPinia()
  setActivePinia(pinia)
  const cartStore = useCartStore()

  const wrapper = mount(CartaView, {
    global: { plugins: [router, pinia] },
  })

  return { wrapper, cartStore }
}

describe('CartaView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading message while fetching', async () => {
    let resolveRequest
    const pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve
    })
    vi.spyOn(productsService, 'getProducts').mockReturnValue(pendingRequest)

    const { wrapper } = await mountCartaView()
    await flushPromises()

    expect(wrapper.text()).toContain('Cargando la carta')

    resolveRequest(buildResult())
    await flushPromises()
  })

  it('shows an error message when the request fails', async () => {
    vi.spyOn(productsService, 'getProducts').mockRejectedValue(new Error('network error'))
    const { wrapper } = await mountCartaView()

    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido cargar la carta')
  })

  it('renders a product card for each item on the current page', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue(buildResult())
    const { wrapper } = await mountCartaView()

    await flushPromises()

    expect(wrapper.findComponent(ProductCard).exists()).toBe(true)
  })

  it('shows an empty message when there are no products', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue(buildResult({ items: [] }))
    const { wrapper } = await mountCartaView()

    await flushPromises()

    expect(wrapper.text()).toContain('No hay productos disponibles')
  })

  it('hides pagination controls when there is only one page', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue(buildResult({ totalPages: 1 }))
    const { wrapper } = await mountCartaView()

    await flushPromises()

    expect(wrapper.findComponent(PaginationControl).exists()).toBe(false)
  })

  it('requests the next page when the pagination control emits change-page', async () => {
    const spy = vi.spyOn(productsService, 'getProducts').mockResolvedValue(
      buildResult({ totalPages: 3, isLastPage: false })
    )
    const { wrapper } = await mountCartaView()
    await flushPromises()

    await wrapper.findComponent(PaginationControl).vm.$emit('change-page', 2)
    await flushPromises()

    expect(spy).toHaveBeenLastCalledWith({ page: 2, size: 12 })
  })

  it('adds the product to the cart store when ProductCard emits add-to-cart', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue(buildResult())
    const { wrapper, cartStore } = await mountCartaView()
    await flushPromises()

    const product = { id: 1, name: 'Salmon Roll', price: 8.5 }
    await wrapper.findComponent(ProductCard).vm.$emit('add-to-cart', { product, quantity: 1 })

    expect(cartStore.items).toEqual([{ product, quantity: 1 }])
  })

  it('increments the quantity as many times as requested when adding a new product', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue(buildResult())
    const { wrapper, cartStore } = await mountCartaView()
    await flushPromises()

    const product = { id: 1, name: 'Salmon Roll', price: 8.5 }
    await wrapper.findComponent(ProductCard).vm.$emit('add-to-cart', { product, quantity: 3 })

    expect(cartStore.items[0].quantity).toBe(3)
  })
})
