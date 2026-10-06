import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDeliveredTodayOrders } from './useDeliveredTodayOrders'
import * as ordersService from '../services/orders.service'

describe('useDeliveredTodayOrders', () => {
    // Hora fija a mediodía: "hace 2 horas" sigue siendo hoy, se ejecute cuando se ejecute.
  const FIXED_NOW = new Date(2026, 9, 6, 12, 0, 0)

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps only the orders delivered today', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    vi.spyOn(ordersService, 'getOrdersByStatus').mockResolvedValue([
      { id: 1, deliveredAt: today.toISOString() },
      { id: 2, deliveredAt: yesterday.toISOString() },
    ])

    const { orders, fetchOrders } = useDeliveredTodayOrders()
    await fetchOrders()

    expect(orders.value).toHaveLength(1)
    expect(orders.value[0].id).toBe(1)
  })

  it('sorts the orders with the most recently delivered first', async () => {
    const earlier = new Date()
    earlier.setHours(earlier.getHours() - 2)
    const later = new Date()

    vi.spyOn(ordersService, 'getOrdersByStatus').mockResolvedValue([
      { id: 1, deliveredAt: earlier.toISOString() },
      { id: 2, deliveredAt: later.toISOString() },
    ])

    const { orders, fetchOrders } = useDeliveredTodayOrders()
    await fetchOrders()

    expect(orders.value.map((order) => order.id)).toEqual([2, 1])
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(ordersService, 'getOrdersByStatus').mockResolvedValue([])
    const { isLoading, fetchOrders } = useDeliveredTodayOrders()

    const promise = fetchOrders()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores an error message when the request fails', async () => {
    vi.spyOn(ordersService, 'getOrdersByStatus').mockRejectedValue(
      new Error('network error'),
    )
    const { error, fetchOrders } = useDeliveredTodayOrders()

    await fetchOrders()

    expect(error.value).toBe(
      'No se han podido cargar los pedidos entregados hoy.',
    )
  })
})
