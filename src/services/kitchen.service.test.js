import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import {
  getKitchenOrders,
  getKitchenChannelCounts,
  getKitchenMetrics,
  updateKitchenOrderStatus,
  getAttendedOrders,
  markOrderAsPaid,
} from './kitchen.service'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('kitchen.service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('requests all channels without a channel parameter', async () => {
    api.get.mockResolvedValue({ data: [] })

    await getKitchenOrders()

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/kitchen/orders',
      { params: {} },
    )
  })

  it.each(['ONSITE', 'ONLINE'])(
    'requests orders for channel %s',
    async (channel) => {
      api.get.mockResolvedValue({ data: [] })

      await getKitchenOrders(channel)

      expect(api.get).toHaveBeenCalledWith(
        '/api/v1/kitchen/orders',
        { params: { channel } },
      )
    },
  )

  it('maps backend orders and preserves their channel', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 42,
          status: 'PROCESSING',
          channel: 'ONSITE',
          chefNote: 'Sin sésamo',
          isDelayed: false,
          createdAt: '2026-10-06T01:00:00',
          paymentStatus: 'PAID',
          items: [
            { productName: 'Merge Maki', quantity: 2 },
          ],
        },
      ],
    })

    const orders = await getKitchenOrders()

    expect(orders).toEqual([
      {
        id: 42,
        status: 'PROCESSING',
        channel: 'ONSITE',
        priorityNote: 'Sin sésamo',
        isDelayed: false,
        createdAt: '2026-10-06T01:00:00',
        paymentStatus: 'PAID',
        products: [
          { name: 'Merge Maki', quantity: 2 },
        ],
      },
    ])
  })

  it('returns an empty list when there are no orders', async () => {
    api.get.mockResolvedValue({ data: [] })

    await expect(getKitchenOrders('ONLINE')).resolves.toEqual([])
  })

  it('propagates errors when orders cannot be loaded', async () => {
    const error = new Error('Network error')
    api.get.mockRejectedValue(error)

    await expect(getKitchenOrders()).rejects.toBe(error)
  })

  it('requests and returns channel counters', async () => {
    const counts = { total: 5, inStore: 3, delivery: 2 }
    api.get.mockResolvedValue({ data: counts })

    await expect(getKitchenChannelCounts()).resolves.toEqual(counts)

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/kitchen/orders/counts',
    )
  })

  it('propagates errors when counters cannot be loaded', async () => {
    const error = new Error('Network error')
    api.get.mockRejectedValue(error)

    await expect(getKitchenChannelCounts()).rejects.toBe(error)
  })

  it('requests and returns kitchen metrics', async () => {
    const metrics = { activeOrders: 5 }
    api.get.mockResolvedValue({ data: metrics })

    await expect(getKitchenMetrics()).resolves.toEqual(metrics)

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/kitchen/metrics',
    )
  })

  it('updates an order status and returns the backend response', async () => {
    const updatedOrder = { id: 42, status: 'READY' }
    api.patch.mockResolvedValue({ data: updatedOrder })

    await expect(
      updateKitchenOrderStatus(42, 'READY'),
    ).resolves.toEqual(updatedOrder)

    expect(api.patch).toHaveBeenCalledWith(
      '/api/v1/kitchen/orders/42/status',
      { status: 'READY' },
    )
  })

  it('propagates errors when updating an order fails', async () => {
    const error = new Error('Network error')
    api.patch.mockRejectedValue(error)

    await expect(
      updateKitchenOrderStatus(42, 'READY'),
    ).rejects.toBe(error)
  })

  it('combines attended orders and sorts them by descending id', async () => {
    const ordersByStatus = {
      READY: [
        {
          id: 5,
          status: 'READY',
          channel: 'ONSITE',
          tableNumber: 2,
          total: 8.99,
        },
      ],
      ONTHEWAY: [
        {
          id: 2,
          status: 'ONTHEWAY',
          channel: 'ONLINE',
          tableNumber: null,
          total: 8.99,
        },
      ],
      DELIVERED: [
        {
          id: 7,
          status: 'DELIVERED',
          channel: 'ONLINE',
          tableNumber: null,
          total: '11.55',
        },
      ],
    }

    api.get.mockImplementation((_url, { params }) =>
      Promise.resolve({
        data: ordersByStatus[params.status],
      }),
    )

    const result = await getAttendedOrders()

    for (const status of ['READY', 'ONTHEWAY', 'DELIVERED']) {
      expect(api.get).toHaveBeenCalledWith(
        '/api/v1/orders',
        { params: { status } },
      )
    }

    expect(result).toEqual([
      {
        id: 7,
        status: 'DELIVERED',
        channel: 'ONLINE',
        tableNumber: null,
        total: 11.55,
      },
      {
        id: 5,
        status: 'READY',
        channel: 'ONSITE',
        tableNumber: 2,
        total: 8.99,
      },
      {
        id: 2,
        status: 'ONTHEWAY',
        channel: 'ONLINE',
        tableNumber: null,
        total: 8.99,
      },
    ])
  })

  it('marks an order as paid', async () => {
    const updatedOrder = {
      id: 3,
      status: 'PAID',
      paymentStatus: null,
    }

    api.patch.mockResolvedValue({ data: updatedOrder })

    await expect(markOrderAsPaid(3)).resolves.toEqual(updatedOrder)

    expect(api.patch).toHaveBeenCalledWith(
      '/api/v1/orders/3/paid',
    )
  })
})