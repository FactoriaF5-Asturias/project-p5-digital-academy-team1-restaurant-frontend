import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrderHistorySection from './OrderHistorySection.vue'
import PaginationControl from './PaginationControl.vue'
import { getOrderHistory } from '../services/orderHistory.service'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

vi.mock('../services/orderHistory.service', () => ({
  getOrderHistory: vi.fn(),
}))

let wrappers = []

function buildResult(overrides = {}) {
  return {
    items: [
      {
        id: 101,
        date: '2026-09-20T21:10:00',
        items: [
          {
            productId: 3,
            name: 'Kaisen Init',
            quantity: 2,
            price: 6.5,
            available: true,
          },
        ],
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

function buildResultWithUnavailableProduct() {
  return buildResult({
    items: [
      {
        id: 101,
        date: '2026-09-20T21:10:00',
        items: [
          {
            productId: 3,
            name: 'Kaisen Init',
            quantity: 2,
            price: 6.5,
            available: true,
          },
          {
            productId: 27,
            name: 'Caesar Commit',
            quantity: 1,
            price: 6.9,
            available: false,
          },
        ],
        total: 19.9,
      },
    ],
  })
}

function mountOrderHistorySection() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStore = useAuthStore()

  authStore.user = {
    id: 'test-user',
    firstName: 'Ana',
    roles: ['ROLE_CUSTOMER'],
  }

  const cartStore = useCartStore()

  const wrapper = mount(OrderHistorySection, {
    global: {
      plugins: [pinia],
    },
  })

  wrappers.push(wrapper)

  return { wrapper, cartStore }
}

describe('OrderHistorySection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()

    getOrderHistory.mockResolvedValue(buildResult())
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []
  })

  it('requests the authenticated user history', async () => {
    mountOrderHistorySection()

    await flushPromises()

    expect(getOrderHistory).toHaveBeenCalledWith(
      'test-user',
      {
        page: 1,
        size: 3,
      },
    )
  })

  it('shows a loading message while fetching', async () => {
    let resolveRequest

    getOrderHistory.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'Cargando tu historial de pedidos',
    )

    resolveRequest(buildResult())

    await flushPromises()

    expect(wrapper.text()).not.toContain(
      'Cargando tu historial de pedidos',
    )
  })

  it('shows an error message when the request fails', async () => {
    getOrderHistory.mockRejectedValue(
      new Error('Network error'),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se ha podido cargar tu historial de pedidos',
    )
  })

  it('shows an empty message when there are no previous orders', async () => {
    getOrderHistory.mockResolvedValue(
      buildResult({
        items: [],
        totalItems: 0,
      }),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'Todavía no tienes pedidos anteriores',
    )
  })

  it('renders a summarised card for each previous order', async () => {
    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).toContain('2× Kaisen Init')
  })

  it('hides the show-all button when there are 3 or fewer orders', async () => {
    getOrderHistory.mockResolvedValue(
      buildResult({
        totalItems: 3,
      }),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(wrapper.text()).not.toContain(
      'Ver todos los pedidos anteriores',
    )
  })

  it('reveals pagination after clicking show all', async () => {
    getOrderHistory.mockResolvedValue(
      buildResult({
        totalItems: 5,
        totalPages: 2,
      }),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(
      wrapper.findComponent(PaginationControl).exists(),
    ).toBe(false)

    await wrapper
      .get('.order-history__show-all-btn')
      .trigger('click')

    await flushPromises()

    expect(
      wrapper.findComponent(PaginationControl).exists(),
    ).toBe(true)
  })

  it('fetches the selected page from the pagination control', async () => {
    getOrderHistory.mockResolvedValueOnce(
      buildResult({
        totalItems: 5,
        totalPages: 2,
      }),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    await wrapper
      .get('.order-history__show-all-btn')
      .trigger('click')

    getOrderHistory.mockResolvedValueOnce(
      buildResult({
        page: 2,
        totalItems: 5,
        totalPages: 2,
      }),
    )

    wrapper
      .getComponent(PaginationControl)
      .vm.$emit('change-page', 2)

    await flushPromises()

    expect(getOrderHistory).toHaveBeenLastCalledWith(
      'test-user',
      {
        page: 2,
        size: 3,
      },
    )

    expect(
      wrapper.getComponent(PaginationControl).props('currentPage'),
    ).toBe(2)
  })

  it('adds repeated order lines to the cart with their quantities', async () => {
    const { wrapper, cartStore } = mountOrderHistorySection()

    await flushPromises()

    await wrapper
      .get('.order-history__repeat-btn')
      .trigger('click')

    expect(cartStore.items).toEqual([
      {
        product: {
          id: 3,
          name: 'Kaisen Init',
          price: 6.5,
        },
        quantity: 2,
      },
    ])
  })

  it('does not warn when every product is available', async () => {
    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(
      wrapper.find('.order-history__unavailable-warning').exists(),
    ).toBe(false)
  })

  it('warns when an order includes an unavailable product', async () => {
    getOrderHistory.mockResolvedValue(
      buildResultWithUnavailableProduct(),
    )

    const { wrapper } = mountOrderHistorySection()

    await flushPromises()

    expect(
      wrapper.find('.order-history__unavailable-warning').exists(),
    ).toBe(true)
  })

  it('excludes unavailable products when repeating an order', async () => {
    getOrderHistory.mockResolvedValue(
      buildResultWithUnavailableProduct(),
    )

    const { wrapper, cartStore } = mountOrderHistorySection()

    await flushPromises()

    await wrapper
      .get('.order-history__repeat-btn')
      .trigger('click')

    expect(cartStore.items).toEqual([
      {
        product: {
          id: 3,
          name: 'Kaisen Init',
          price: 6.5,
        },
        quantity: 2,
      },
    ])
  })
})