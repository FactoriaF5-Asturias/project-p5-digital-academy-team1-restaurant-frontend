import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder } from './orders.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('orders.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the items and chefNote to the orders endpoint', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    const items = [{ productId: 1, quantity: 2 }]

    await createOrder({ items, chefNote: 'Sin wasabi' })

    expect(api.post).toHaveBeenCalledWith('/orders', { items, chefNote: 'Sin wasabi' })
  })

  it('returns the response data as-is', async () => {
    const orderResponse = { id: 42, status: 'PLACED' }
    api.post.mockResolvedValue({ data: orderResponse })

    const result = await createOrder({ items: [], chefNote: '' })

    expect(result).toEqual(orderResponse)
  })

  it('propagates the error when the request fails', async () => {
    api.post.mockRejectedValue(new Error('network error'))

    await expect(createOrder({ items: [], chefNote: '' })).rejects.toThrow('network error')
  })
})
