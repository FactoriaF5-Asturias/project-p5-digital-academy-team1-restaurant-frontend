import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RepartoView from './RepartoView.vue'
import DeliveryMetrics from '../components/DeliveryMetrics.vue'
import { getDeliveryMetrics } from '../services/delivery.service'
import { getOrdersByStatus } from '../services/orders.service'
import { getPendingDeliveries } from '../services/delivery.service'

vi.mock('../services/orders.service', () => ({
  getOrdersByStatus: vi.fn(),
}))

vi.mock('../services/delivery.service', () => ({
  getDeliveryMetrics: vi.fn(),
  markOrderAsDelivered: vi.fn(),
  getPendingDeliveries: vi.fn(),
  assignOrderToSelf: vi.fn(),
  markOrderInTransit: vi.fn(),
}))

const metrics = {
  readyCount: 4,
  inTransitCount: 2,
  deliveredTodayCount: 7,
  averageDeliveryMinutes: 18.5,
}

describe('RepartoView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getOrdersByStatus.mockResolvedValue([])
    getPendingDeliveries.mockResolvedValue([])
  })

  it('shows loading until the metrics are received', async () => {
    let resolveRequest

    getDeliveryMetrics.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    const wrapper = mount(RepartoView)

    expect(wrapper.text()).toContain('Cargando datos de reparto…')
    expect(wrapper.findComponent(DeliveryMetrics).exists()).toBe(false)

    resolveRequest(metrics)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Cargando datos de reparto…')
    expect(wrapper.getComponent(DeliveryMetrics).props('metrics')).toEqual(
      metrics
    )
    expect(getDeliveryMetrics).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('shows the cards and a notice when there are no orders', async () => {
    getDeliveryMetrics.mockResolvedValue({
      readyCount: 0,
      inTransitCount: 0,
      deliveredTodayCount: 0,
      averageDeliveryMinutes: 0,
    })

    const wrapper = mount(RepartoView)
    await flushPromises()

    expect(wrapper.findComponent(DeliveryMetrics).exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'No hay pedidos listos, en tránsito ni entregados hoy.'
    )

    wrapper.unmount()
  })

  it('shows an error without presenting zeros as real data', async () => {
    getDeliveryMetrics.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(RepartoView)
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'No se han podido cargar los datos de reparto.'
    )
    expect(wrapper.findComponent(DeliveryMetrics).exists()).toBe(false)
    expect(wrapper.get('button').text()).toBe('Reintentar')

    wrapper.unmount()
  })

  it('allows retrying to load the data after an error', async () => {
    getDeliveryMetrics
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(metrics)

    const wrapper = mount(RepartoView)
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(getDeliveryMetrics).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.getComponent(DeliveryMetrics).props('metrics')).toEqual(
      metrics
    )

    wrapper.unmount()
  })

  it('automatically refreshes the cards without unmounting the view', async () => {
    vi.useFakeTimers()
    let wrapper

    try {
      getDeliveryMetrics
        .mockResolvedValueOnce(metrics)
        .mockResolvedValue({
          ...metrics,
          readyCount: 3,
          inTransitCount: 3,
        })

      wrapper = mount(RepartoView)
      await vi.advanceTimersByTimeAsync(0)

      expect(
        wrapper.getComponent(DeliveryMetrics).props('metrics').readyCount
      ).toBe(4)

      await vi.advanceTimersByTimeAsync(10_000)

      expect(getDeliveryMetrics).toHaveBeenCalledTimes(2)
      expect(
        wrapper.getComponent(DeliveryMetrics).props('metrics').readyCount
      ).toBe(3)
      expect(
        wrapper.getComponent(DeliveryMetrics).props('metrics').inTransitCount
      ).toBe(3)
    } finally {
      wrapper?.unmount()
      vi.useRealTimers()
    }
  })

  it('keeps the last data when a refresh fails and then recovers', async () => {
    vi.useFakeTimers()
    let wrapper

    try {
      getDeliveryMetrics
        .mockResolvedValueOnce(metrics)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ...metrics,
          deliveredTodayCount: 8,
        })

      wrapper = mount(RepartoView)
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(10_000)

      expect(wrapper.getComponent(DeliveryMetrics).props('metrics')).toEqual(
        metrics
      )
      expect(wrapper.get('[role="alert"]').text()).toContain(
        'Se muestran los últimos disponibles.'
      )

      await vi.advanceTimersByTimeAsync(10_000)

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(
        wrapper.getComponent(DeliveryMetrics).props('metrics')
          .deliveredTodayCount
      ).toBe(8)
    } finally {
      wrapper?.unmount()
      vi.useRealTimers()
    }
  })

  it('stops polling when leaving the view', async () => {
    vi.useFakeTimers()
    let wrapper

    try {
      getDeliveryMetrics.mockResolvedValue(metrics)

      wrapper = mount(RepartoView)
      await vi.advanceTimersByTimeAsync(0)

      expect(getDeliveryMetrics).toHaveBeenCalledTimes(1)

      wrapper.unmount()
      wrapper = null

      await vi.advanceTimersByTimeAsync(30_000)

      expect(getDeliveryMetrics).toHaveBeenCalledTimes(1)
    } finally {
      wrapper?.unmount()
      vi.useRealTimers()
    }
  })

  it('refreshes the in-transit list as soon as an order is accepted', async () => {
    const { getPendingDeliveries, assignOrderToSelf, markOrderInTransit } =
      await import('../services/delivery.service')

    getDeliveryMetrics.mockResolvedValue(metrics)
    getPendingDeliveries.mockResolvedValueOnce([
      { id: 9, address: 'Calle Falsa 123' },
    ])
    getPendingDeliveries.mockResolvedValue([])
    assignOrderToSelf.mockResolvedValue({})
    markOrderInTransit.mockResolvedValue({})
    getOrdersByStatus.mockResolvedValue([])

    const wrapper = mount(RepartoView)
    await flushPromises()

    // Una llamada para "en tránsito" (OnTheWayOrdersList) y otra para
    // "entregados hoy" (DeliveredTodayList), ambas al montar.
    expect(getOrdersByStatus).toHaveBeenCalledTimes(2)

    await wrapper.find('.pending-deliveries__accept-btn').trigger('click')
    await flushPromises()

    // Aceptar un pedido solo refresca la lista de "en tránsito".
    expect(getOrdersByStatus).toHaveBeenCalledTimes(3)

    wrapper.unmount()
  })

  it('refreshes the delivered-today list as soon as an order is marked as delivered', async () => {
    const { markOrderAsDelivered } = await import('../services/delivery.service')

    getDeliveryMetrics.mockResolvedValue(metrics)
    getOrdersByStatus.mockResolvedValueOnce([
      { id: 20, paymentMethod: 'ONLINE_CARD', total: 15 },
    ])
    getOrdersByStatus.mockResolvedValue([])
    markOrderAsDelivered.mockResolvedValue({})

    const wrapper = mount(RepartoView)
    await flushPromises()

    expect(getOrdersByStatus).toHaveBeenCalledTimes(2)

    await wrapper.find('.on-the-way-orders__deliver-btn').trigger('click')
    await flushPromises()

    // Una llamada más: refresca la lista de "entregados hoy".
    expect(getOrdersByStatus).toHaveBeenCalledTimes(3)

    wrapper.unmount()
  })
})
