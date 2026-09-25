import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOrderHistory } from './useOrderHistory'
import * as orderHistoryMock from '../mocks/orderHistory.mock'

describe('useOrderHistory', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue({
      items: [], page: 1, size: 3, totalItems: 0, totalPages: 1,
    })
    const { isLoading, fetchHistory } = useOrderHistory()

    const promise = fetchHistory()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores the fetched orders and pagination state on success', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue({
      items: [{ id: 101, date: '2026-09-20T21:10:00', items: [], total: 17.5 }],
      page: 2,
      size: 3,
      totalItems: 5,
      totalPages: 2,
    })
    const { orders, currentPage, totalPages, totalItems, fetchHistory } = useOrderHistory()

    await fetchHistory(2)

    expect(orders.value).toEqual([
      { id: 101, date: '2026-09-20T21:10:00', items: [], total: 17.5 },
    ])
    expect(currentPage.value).toBe(2)
    expect(totalPages.value).toBe(2)
    expect(totalItems.value).toBe(5)
  })

  it('stores an error message when the request fails', async () => {
    vi.spyOn(orderHistoryMock, 'getOrderHistory').mockRejectedValue(new Error('network error'))
    const { error, fetchHistory } = useOrderHistory()

    await fetchHistory()

    expect(error.value).toBe(
      'No se ha podido cargar tu historial de pedidos. Inténtalo de nuevo más tarde.',
    )
  })

  it('does not fetch when the requested page is out of range', async () => {
    const spy = vi.spyOn(orderHistoryMock, 'getOrderHistory').mockResolvedValue({
      items: [], page: 1, size: 3, totalItems: 0, totalPages: 2,
    })
    const { fetchHistory, goToPage, totalPages } = useOrderHistory()
    await fetchHistory()
    spy.mockClear()

    goToPage(0)
    goToPage(totalPages.value + 1)

    expect(spy).not.toHaveBeenCalled()
  })
})
