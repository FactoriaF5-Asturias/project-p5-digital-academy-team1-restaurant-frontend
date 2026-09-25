import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrderHistorySection from './OrderHistorySection.vue'
import PaginationControl from './PaginationControl.vue'
import * as orderHistoryMock from '../mocks/orderHistory.mock'
import { useCartStore } from '../stores/cart'

function buildResult(overrides = {}) {
  return {
    items: [
      {
        id: 101,
        date: '2026-09-20T21:10:00',
        items: [{ productId: 3, name: 'Kaisen Init', quantity: 2, price: 6.5 }],
        total: 13,
      },
    ],
    page: 1,
    size: 3,
    totalItems: 1,
    totalPages: 1,
    ...overrides,
  }
}

async function mountOrderHistorySection() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const cartStore = useCartStore()

  const wrapper = mount(OrderHistorySection, {
    global: { plugins: [pinia] },
  })

  return { wrapper, cartStore }
}

describe('OrderHistorySection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('shows a loading message while fetching', async () => {
    let resolveRequest
    const pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve
    })
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockReturnValue(pendingRequest)

    const { wrapper } = await mountOrderHistorySection()
    await flushPromises()

    expect(wrapper.text()).toContain('Cargando tu historial de pedidos')

    resolveRequest(buildResult())
    await flushPromises()
  })

  it('shows an error message when the request fails', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockRejectedValue(new Error('network error'))
    const { wrapper } = await mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido cargar tu historial de pedidos')
  })

  it('shows an empty message when there are no previous orders', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue(
      buildResult({ items: [], totalItems: 0 }),
    )
    const { wrapper } = await mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain('Todavía no tienes pedidos anteriores')
  })

  it('renders a summarised card for each previous order', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue(buildResult())
    const { wrapper } = await mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain('2× Kaisen Init')
  })

  it('hides the "show all" button when there are 3 or fewer orders in total', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue(buildResult({ totalItems: 3 }))
    const { wrapper } = await mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).not.toContain('Ver todos los pedidos anteriores')
  })

  it('reveals pagination controls after clicking "show all" when there is more than one page', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue(
      buildResult({ totalItems: 5, totalPages: 2 }),
    )
    const { wrapper } = await mountOrderHistorySection()
    await flushPromises()

    expect(wrapper.findComponent(PaginationControl).exists()).toBe(false)

    await wrapper.find('.order-history__show-all-btn').trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(PaginationControl).exists()).toBe(true)
  })

  it('adds each line of the repeated order to the cart with its original quantity', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue(buildResult())
    const { wrapper, cartStore } = await mountOrderHistorySection()
    await flushPromises()

    await wrapper.find('.order-history__repeat-btn').trigger('click')

    expect(cartStore.items).toEqual([
      {
        product: { id: 3, name: 'Kaisen Init', price: 6.5 },
        quantity: 2,
      },
    ])
  })
})
