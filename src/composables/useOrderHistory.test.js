import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useAuthStore } from '../stores/auth'
import { useOrderHistory } from './useOrderHistory'
import { getOrderHistory } from '../services/orderHistory.service'

vi.mock('../services/orderHistory.service', () => ({
  getOrderHistory: vi.fn(),
}))

const emptyPage = {
  items: [],
  page: 1,
  size: 3,
  totalItems: 0,
  totalPages: 1,
}

let scopes = []

function createHistory() {
  const scope = effectScope()
  scopes.push(scope)

  return scope.run(() => useOrderHistory())
}

describe('useOrderHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())

    useAuthStore().user = {
      id: 'test-user',
    }

    getOrderHistory.mockResolvedValue({ ...emptyPage })
  })

  afterEach(() => {
    scopes.forEach((scope) => scope.stop())
    scopes = []
  })

  it('sets isLoading while fetching and clears it when finished', async () => {
    const { isLoading, fetchHistory } = createHistory()

    const promise = fetchHistory()

    expect(isLoading.value).toBe(true)

    await promise

    expect(isLoading.value).toBe(false)
  })

  it('requests the authenticated user history with the page size', async () => {
    const { fetchHistory } = createHistory()

    await fetchHistory(2)

    expect(getOrderHistory).toHaveBeenCalledWith(
      'test-user',
      {
        page: 2,
        size: 3,
      },
    )
  })

  it('stores fetched orders and pagination on success', async () => {
    const order = {
      id: 101,
      date: '2026-09-20T21:10:00',
      items: [],
      total: 17.5,
    }

    getOrderHistory.mockResolvedValue({
      items: [order],
      page: 2,
      size: 3,
      totalItems: 5,
      totalPages: 2,
    })

    const {
      orders,
      currentPage,
      totalPages,
      totalItems,
      fetchHistory,
    } = createHistory()

    await fetchHistory(2)

    expect(orders.value).toEqual([order])
    expect(currentPage.value).toBe(2)
    expect(totalPages.value).toBe(2)
    expect(totalItems.value).toBe(5)
  })

  it('stores an error message when the request fails', async () => {
    getOrderHistory.mockRejectedValue(
      new Error('Network error'),
    )

    const { error, isLoading, fetchHistory } = createHistory()

    await fetchHistory()

    expect(error.value).toBe(
      'No se ha podido cargar tu historial de pedidos. Inténtalo de nuevo más tarde.',
    )

    expect(isLoading.value).toBe(false)
  })

  it('does not fetch pages outside the range or the current page', async () => {
    getOrderHistory.mockResolvedValue({
      ...emptyPage,
      totalPages: 2,
    })

    const {
      fetchHistory,
      goToPage,
      totalPages,
      currentPage,
    } = createHistory()

    await fetchHistory()
    getOrderHistory.mockClear()

    goToPage(0)
    goToPage(totalPages.value + 1)
    goToPage(currentPage.value)

    expect(getOrderHistory).not.toHaveBeenCalled()
  })

  it('fetches a valid page when navigating', async () => {
    getOrderHistory.mockResolvedValueOnce({
      ...emptyPage,
      totalPages: 2,
    })

    const { fetchHistory, goToPage, currentPage } = createHistory()

    await fetchHistory()

    getOrderHistory.mockResolvedValueOnce({
      ...emptyPage,
      page: 2,
      totalPages: 2,
    })

    await goToPage(2)

    expect(getOrderHistory).toHaveBeenLastCalledWith(
      'test-user',
      {
        page: 2,
        size: 3,
      },
    )

    expect(currentPage.value).toBe(2)
  })

  it('does not fetch without an authenticated user', async () => {
    useAuthStore().user = null

    const {
      orders,
      isLoading,
      totalItems,
      fetchHistory,
    } = createHistory()

    await fetchHistory()

    expect(getOrderHistory).not.toHaveBeenCalled()
    expect(orders.value).toEqual([])
    expect(totalItems.value).toBe(0)
    expect(isLoading.value).toBe(false)
  })

  it('loads history when the user becomes available', async () => {
    const authStore = useAuthStore()
    authStore.user = null

    createHistory()

    authStore.user = {
      id: 'loaded-user',
    }

    await nextTick()
    await flushPromises()

    expect(getOrderHistory).toHaveBeenCalledWith(
      'loaded-user',
      {
        page: 1,
        size: 3,
      },
    )
  })

  it('clears history when the user logs out', async () => {
    getOrderHistory.mockResolvedValue({
      items: [{ id: 101 }],
      page: 2,
      size: 3,
      totalItems: 5,
      totalPages: 2,
    })

    const {
      orders,
      currentPage,
      totalPages,
      totalItems,
      fetchHistory,
    } = createHistory()

    await fetchHistory(2)

    useAuthStore().clearSession()

    await nextTick()

    expect(orders.value).toEqual([])
    expect(currentPage.value).toBe(1)
    expect(totalPages.value).toBe(1)
    expect(totalItems.value).toBe(0)
  })

  it('ignores an old response after the user logs out', async () => {
    let resolveRequest

    getOrderHistory.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const { orders, isLoading, fetchHistory } = createHistory()

    const promise = fetchHistory()

    useAuthStore().clearSession()

    await nextTick()

    resolveRequest({
      ...emptyPage,
      items: [{ id: 101 }],
      totalItems: 1,
    })

    await promise

    expect(orders.value).toEqual([])
    expect(isLoading.value).toBe(false)
  })
})