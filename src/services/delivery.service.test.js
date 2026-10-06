import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import {
  getDeliveryMetrics,
  getPendingDeliveries,
  assignOrderToSelf,
  markOrderInTransit,
  markOrderAsDelivered,
} from './delivery.service'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('delivery.service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches the metrics and returns the backend response', async () => {
    const metrics = {
      readyCount: 4,
      inTransitCount: 2,
      deliveredTodayCount: 7,
      averageDeliveryMinutes: 18.5,
    }

    api.get.mockResolvedValue({ data: metrics })

    const result = await getDeliveryMetrics()

    expect(api.get).toHaveBeenCalledWith('/api/v1/delivery/metrics')
    expect(result).toEqual(metrics)
  })

  it('keeps the zero values when there are no orders', async () => {
    const metrics = {
      readyCount: 0,
      inTransitCount: 0,
      deliveredTodayCount: 0,
      averageDeliveryMinutes: 0,
    }

    api.get.mockResolvedValue({ data: metrics })

    expect(await getDeliveryMetrics()).toEqual(metrics)
  })

  it('propagates the error so the view can handle it', async () => {
    const error = new Error('No se pueden cargar las métricas')
    api.get.mockRejectedValue(error)

    await expect(getDeliveryMetrics()).rejects.toBe(error)
  })

  it('requests the orders that are ready for delivery and still unassigned', async () => {
    const pending = [{ id: 9, address: 'Calle Falsa 123' }]
    api.get.mockResolvedValue({ data: pending })

    const result = await getPendingDeliveries()

    expect(api.get).toHaveBeenCalledWith('/api/v1/delivery/orders/pending')
    expect(result).toEqual(pending)
  })

  it('assigns the authenticated deliveryman to an order', async () => {
    const updatedOrder = { id: 9, status: 'READY' }
    api.patch.mockResolvedValue({ data: updatedOrder })

    const result = await assignOrderToSelf(9)

    expect(api.patch).toHaveBeenCalledWith('/api/v1/delivery/orders/9/assign')
    expect(result).toEqual(updatedOrder)
  })

  it('propagates the error when the order is already assigned to someone else', async () => {
    const error = new Error('Order is already assigned to a deliveryman')
    api.patch.mockRejectedValue(error)

    await expect(assignOrderToSelf(9)).rejects.toBe(error)
  })

  it('marks an assigned order as in transit', async () => {
    const updatedOrder = { id: 9, status: 'ONTHEWAY' }
    api.patch.mockResolvedValue({ data: updatedOrder })

    const result = await markOrderInTransit(9)

    expect(api.patch).toHaveBeenCalledWith('/api/v1/delivery/orders/9/in-transit')
    expect(result).toEqual(updatedOrder)
  })

  it('propagates the error when the order has no deliveryman assigned yet', async () => {
    const error = new Error('Order must be assigned to a deliveryman before it can be marked as in transit')
    api.patch.mockRejectedValue(error)

    await expect(markOrderInTransit(9)).rejects.toBe(error)
  })

  it('marks an order as delivered with the cash collected flag', async () => {
    const updatedOrder = { id: 12, status: 'DELIVERED' }
    api.patch.mockResolvedValue({ data: updatedOrder })

    const result = await markOrderAsDelivered(12, { cashCollected: true })

    expect(api.patch).toHaveBeenCalledWith('/api/v1/delivery/orders/12/status', {
      cashCollected: true,
    })
    expect(result).toEqual(updatedOrder)
  })

  it('propagates the error when marking as delivered fails', async () => {
    const error = new Error('Cannot mark as delivered')
    api.patch.mockRejectedValue(error)

    await expect(markOrderAsDelivered(12, { cashCollected: false })).rejects.toBe(error)
  })
})
