import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PendingDeliveriesList from './PendingDeliveriesList.vue'
import * as deliveryService from '../services/delivery.service'

describe('PendingDeliveriesList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading message while the orders are being fetched', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockReturnValue(new Promise(() => {}))

    const wrapper = mount(PendingDeliveriesList)

    expect(wrapper.text()).toContain('Cargando pedidos pendientes de reparto')
  })

  it('shows an empty state when there are no orders ready for delivery', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([])

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    expect(wrapper.text()).toContain('No hay pedidos listos para repartir ahora mismo.')
  })

  it('shows an error message when the orders fail to load', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockRejectedValue(
      new Error('network error'),
    )

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'No se han podido cargar los pedidos pendientes de reparto.',
    )
  })

  it('lists the pending orders with their delivery address', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: 'Calle Falsa 123' },
    ])

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    expect(wrapper.text()).toContain('Pedido #9')
    expect(wrapper.text()).toContain('Calle Falsa 123')
  })

  it('shows a fallback text when the order has no registered address', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: null },
    ])

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    expect(wrapper.text()).toContain('Sin dirección registrada')
  })

  it('assigns and dispatches the order in a single action when accepted', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: 'Calle Falsa 123' },
    ])
    const assignSpy = vi.spyOn(deliveryService, 'assignOrderToSelf').mockResolvedValue({})
    const transitSpy = vi.spyOn(deliveryService, 'markOrderInTransit').mockResolvedValue({})

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    await wrapper.find('.pending-deliveries__accept-btn').trigger('click')
    await flushPromises()

    expect(assignSpy).toHaveBeenCalledWith(9)
    expect(transitSpy).toHaveBeenCalledWith(9)
    expect(wrapper.text()).toContain('No hay pedidos listos para repartir ahora mismo.')
  })

  it('disables the button and shows a pending label while accepting', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: 'Calle Falsa 123' },
    ])
    let resolveAssign
    vi.spyOn(deliveryService, 'assignOrderToSelf').mockReturnValue(
      new Promise((resolve) => {
        resolveAssign = resolve
      }),
    )
    vi.spyOn(deliveryService, 'markOrderInTransit').mockResolvedValue({})

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    const button = wrapper.find('.pending-deliveries__accept-btn')
    await button.trigger('click')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('Aceptando…')

    resolveAssign({})
    await flushPromises()
  })

  it('shows an error and keeps the order listed when accepting fails', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: 'Calle Falsa 123' },
    ])
    vi.spyOn(deliveryService, 'assignOrderToSelf').mockRejectedValue(
      new Error('Order is already assigned to a deliveryman'),
    )

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    await wrapper.find('.pending-deliveries__accept-btn').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No se ha podido aceptar este pedido')
    expect(wrapper.text()).toContain('Pedido #9')
  })

  it('emits order-accepted when the order is accepted successfully', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: 'Calle Falsa 123' },
    ])
    vi.spyOn(deliveryService, 'assignOrderToSelf').mockResolvedValue({})
    vi.spyOn(deliveryService, 'markOrderInTransit').mockResolvedValue({})

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    await wrapper.find('.pending-deliveries__accept-btn').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('order-accepted')).toHaveLength(1)
  })

  it('does not emit order-accepted when accepting fails', async () => {
    vi.spyOn(deliveryService, 'getPendingDeliveries').mockResolvedValue([
      { id: 9, address: 'Calle Falsa 123' },
    ])
    vi.spyOn(deliveryService, 'assignOrderToSelf').mockRejectedValue(
      new Error('Order is already assigned to a deliveryman'),
    )

    const wrapper = mount(PendingDeliveriesList)
    await flushPromises()

    await wrapper.find('.pending-deliveries__accept-btn').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('order-accepted')).toBeUndefined()
  })
})
