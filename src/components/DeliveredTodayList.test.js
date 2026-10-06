import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeliveredTodayList from './DeliveredTodayList.vue'
import * as ordersService from '../services/orders.service'

describe('DeliveredTodayList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading message while the orders are being fetched', async () => {
    vi.spyOn(ordersService, 'getOrdersByStatus').mockReturnValue(
      new Promise(() => {}),
    )

    const wrapper = mount(DeliveredTodayList)

    expect(wrapper.text()).toContain('Cargando pedidos entregados')
  })

  it('shows an empty state when no order has been delivered today', async () => {
    vi.spyOn(ordersService, 'getOrdersByStatus').mockResolvedValue([])

    const wrapper = mount(DeliveredTodayList)
    await flushPromises()

    expect(wrapper.text()).toContain(
      'Todavía no se ha entregado ningún pedido hoy.',
    )
  })

  it('shows an error message when the orders fail to load', async () => {
    vi.spyOn(ordersService, 'getOrdersByStatus').mockRejectedValue(
      new Error('network error'),
    )

    const wrapper = mount(DeliveredTodayList)
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'No se han podido cargar los pedidos entregados hoy.',
    )
  })

  it("lists today's delivered orders with their payment method, total and time", async () => {
    const deliveredAt = new Date()
    deliveredAt.setHours(14, 30, 0, 0)

    vi.spyOn(ordersService, 'getOrdersByStatus').mockResolvedValue([
      {
        id: 12,
        paymentMethod: 'CASH_ON_DELIVERY',
        total: 21.5,
        deliveredAt: deliveredAt.toISOString(),
      },
    ])

    const wrapper = mount(DeliveredTodayList)
    await flushPromises()

    expect(wrapper.text()).toContain('Pedido #12')
    expect(wrapper.text()).toContain('Efectivo a la entrega')
    expect(wrapper.text()).toContain('21,50')
    expect(wrapper.text()).toContain('14:30')
  })

  it('refetches the orders when the exposed refresh method is called', async () => {
    const spy = vi
      .spyOn(ordersService, 'getOrdersByStatus')
      .mockResolvedValue([])

    const wrapper = mount(DeliveredTodayList)
    await flushPromises()
    expect(spy).toHaveBeenCalledTimes(1)

    await wrapper.vm.refresh()
    await flushPromises()

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
