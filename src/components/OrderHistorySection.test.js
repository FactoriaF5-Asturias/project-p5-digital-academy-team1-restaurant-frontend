import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrderHistorySection from './OrderHistorySection.vue'
import PaginationControl from './PaginationControl.vue'
import {
  getOrderHistory,
  getRepeatOrderItems,
} from '../services/orderHistory.service'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

vi.mock('../services/orderHistory.service', () => ({
  getOrderHistory: vi.fn(),
  getRepeatOrderItems: vi.fn(),
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
  const result = buildResult()

  result.items[0].items.push({
    productId: 27,
    name: 'Caesar Commit',
    quantity: 1,
    price: 6.9,
    available: false,
  })

  result.items[0].total = 19.9

  return result
}

function mountSection() {
  const pinia = createPinia()
  setActivePinia(pinia)

  useAuthStore().user = {
    id: 'test-user',
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

    getRepeatOrderItems.mockResolvedValue([
      {
        productId: 3,
        name: 'Kaisen Init',
        price: 6.5,
        quantity: 2,
      },
    ])
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []

    vi.restoreAllMocks()
  })

  it('requests the authenticated user history', async () => {
    mountSection()

    await flushPromises()

    expect(getOrderHistory).toHaveBeenCalledWith({
      userId: 'test-user',
      page: 1,
      size: 3,
    })
  })

  it('shows loading while fetching', async () => {
    let resolveRequest

    getOrderHistory.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const { wrapper } = mountSection()

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

  it('shows an error when fetching fails', async () => {
    getOrderHistory.mockRejectedValue(
      new Error('Network error'),
    )

    const { wrapper } = mountSection()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se ha podido cargar tu historial de pedidos',
    )
  })

  it('shows the empty state when there are no orders', async () => {
    getOrderHistory.mockResolvedValue(
      buildResult({
        items: [],
        totalItems: 0,
      }),
    )

    const { wrapper } = mountSection()

    await flushPromises()

    expect(wrapper.text()).toContain(
      'Todavía no tienes pedidos anteriores',
    )
  })

  it('renders an order summary', async () => {
    const { wrapper } = mountSection()

    await flushPromises()

    expect(wrapper.text()).toContain('2× Kaisen Init')
  })

  it('hides show all when there are three or fewer orders', async () => {
    getOrderHistory.mockResolvedValue(
      buildResult({ totalItems: 3 }),
    )

    const { wrapper } = mountSection()

    await flushPromises()

    expect(
      wrapper.find('.order-history__show-all-btn').exists(),
    ).toBe(false)
  })

  it('reveals pagination after clicking show all', async () => {
    getOrderHistory.mockResolvedValue(
      buildResult({
        totalItems: 5,
        totalPages: 2,
      }),
    )

    const { wrapper } = mountSection()

    await flushPromises()

    expect(
      wrapper.findComponent(PaginationControl).exists(),
    ).toBe(false)

    await wrapper
      .get('.order-history__show-all-btn')
      .trigger('click')

    expect(
      wrapper.findComponent(PaginationControl).exists(),
    ).toBe(true)
  })

  it('fetches the page selected in pagination', async () => {
    getOrderHistory.mockResolvedValueOnce(
      buildResult({
        totalItems: 5,
        totalPages: 2,
      }),
    )

    const { wrapper } = mountSection()

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

    expect(getOrderHistory).toHaveBeenLastCalledWith({
      userId: 'test-user',
      page: 2,
      size: 3,
    })

    expect(
      wrapper.getComponent(PaginationControl).props('currentPage'),
    ).toBe(2)
  })

  it('repeats an order using current backend prices and quantities', async () => {
    getRepeatOrderItems.mockResolvedValue([
      {
        productId: 3,
        name: 'Kaisen Init',
        price: 7,
        quantity: 2,
      },
    ])

    const { wrapper, cartStore } = mountSection()

    await flushPromises()

    await wrapper.get('.order-history__repeat-btn').trigger('click')
    await flushPromises()

    expect(getRepeatOrderItems).toHaveBeenCalledWith(101)

    expect(cartStore.items).toEqual([
      {
        product: {
          id: 3,
          name: 'Kaisen Init',
          price: 7,
        },
        quantity: 2,
      },
    ])
  })

  it('shows a repeat error without changing the cart', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    getRepeatOrderItems.mockRejectedValue(
      new Error('Network error'),
    )

    const { wrapper, cartStore } = mountSection()

    cartStore.addProduct({
      id: 99,
      name: 'Existing product',
      price: 4,
    })

    const previousItems = JSON.parse(
      JSON.stringify(cartStore.items),
    )

    await flushPromises()

    await wrapper.get('.order-history__repeat-btn').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No se ha podido repetir este pedido',
    )

    expect(cartStore.items).toEqual(previousItems)
  })

  it('does not warn when every product is available', async () => {
    const { wrapper } = mountSection()

    await flushPromises()

    expect(
      wrapper.find('.order-history__unavailable-warning').exists(),
    ).toBe(false)
  })

  it('warns when an order contains an unavailable product', async () => {
    getOrderHistory.mockResolvedValue(
      buildResultWithUnavailableProduct(),
    )

    const { wrapper } = mountSection()

    await flushPromises()

    expect(
      wrapper.find('.order-history__unavailable-warning').exists(),
    ).toBe(true)
  })

  it('adds only the products returned by the repeat endpoint', async () => {
    getOrderHistory.mockResolvedValue(
      buildResultWithUnavailableProduct(),
    )

    const { wrapper, cartStore } = mountSection()

    await flushPromises()

    await wrapper.get('.order-history__repeat-btn').trigger('click')
    await flushPromises()

    expect(getRepeatOrderItems).toHaveBeenCalledWith(101)

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