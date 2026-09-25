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

  it('sends the items, chefNote, channel and paymentMethod to the orders endpoint', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    const items = [{ productId: 1, quantity: 2 }]

    await createOrder({ items, chefNote: 'Sin wasabi', channel: 'sala', paymentMethod: 'CASH_ONSITE' })

    expect(api.post).toHaveBeenCalledWith('/orders', {
      items,
      chefNote: 'Sin wasabi',
      channel: 'ONSITE',
      paymentMethod: 'CASH_ONSITE',
    })
  })

  it('translates the "domicilio" channel to the backend "ONLINE" value', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })

    await createOrder({ items: [], chefNote: '', channel: 'domicilio', paymentMethod: 'ONLINE_CARD' })

    expect(api.post).toHaveBeenCalledWith('/orders', {
      items: [],
      chefNote: '',
      channel: 'ONLINE',
      paymentMethod: 'ONLINE_CARD',
    })
  })

  it('returns the response data as-is', async () => {
    const orderResponse = { id: 42, status: 'PLACED' }
    api.post.mockResolvedValue({ data: orderResponse })

    const result = await createOrder({ items: [], chefNote: '', channel: 'sala', paymentMethod: 'CASH_ONSITE' })

    expect(result).toEqual(orderResponse)
  })

  it('propagates the error when the request fails', async () => {
    api.post.mockRejectedValue(new Error('network error'))

    await expect(
      createOrder({ items: [], chefNote: '', channel: 'sala', paymentMethod: 'CASH_ONSITE' }),
    ).rejects.toThrow('network error')
  })
})
