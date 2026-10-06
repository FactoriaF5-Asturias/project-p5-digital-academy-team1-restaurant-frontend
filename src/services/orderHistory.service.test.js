// src/services/orderHistory.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { getOrderHistory, getRepeatOrderItems } from './orderHistory.service'

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}))

describe('orderHistory.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests the paginated order history for the given user', async () => {
    api.get.mockResolvedValue({
      data: {
        content: [{ id: 101, date: '2026-09-20T21:10:00', items: [], total: 17.5 }],
        page: { number: 1, size: 3, totalElements: 5, totalPages: 2 },
      },
    })

    const result = await getOrderHistory({ userId: 'user-1', page: 2, size: 3 })

    expect(api.get).toHaveBeenCalledWith('/api/v1/users/user-1/orders', {
      params: { page: 1, size: 3 },
    })
    expect(result).toEqual({
      items: [{ id: 101, date: '2026-09-20T21:10:00', items: [], total: 17.5 }],
      page: 2,
      size: 3,
      totalItems: 5,
      totalPages: 2,
    })
  })

  it('requests the repeatable lines of a previous order', async () => {
    api.get.mockResolvedValue({
      data: [{ productId: 3, name: 'Kaisen Init', price: 6.5, quantity: 2 }],
    })

    const result = await getRepeatOrderItems(101)

    expect(api.get).toHaveBeenCalledWith('/api/v1/orders/101/repeat')
    expect(result).toEqual([{ productId: 3, name: 'Kaisen Init', price: 6.5, quantity: 2 }])
  })
})
