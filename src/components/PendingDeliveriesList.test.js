import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PendingDeliveriesList from './PendingDeliveriesList.vue'
import * as deliveryService from '../services/delivery.service'

const order = {
  id: 9,
  address: 'Calle Falsa 123',
}

let wrappers = []

function mountList() {
  const wrapper = mount(PendingDeliveriesList)
  wrappers.push(wrapper)
  return wrapper
}

describe('PendingDeliveriesList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    vi.spyOn(deliveryService, 'getPendingDeliveries')
      .mockResolvedValue([order])

    vi.spyOn(deliveryService, 'assignOrderToSelf')
      .mockResolvedValue({})

    vi.spyOn(deliveryService, 'markOrderInTransit')
      .mockResolvedValue({})
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []

    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows loading while orders are being fetched', async () => {
    let resolveRequest

    deliveryService.getPendingDeliveries.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const wrapper = mountList()

    expect(wrapper.text()).toContain(
      'Cargando pedidos pendientes de reparto',
    )

    resolveRequest([])
    await flushPromises()

    expect(wrapper.text()).not.toContain(
      'Cargando pedidos pendientes de reparto',
    )
  })

  it('shows an empty state when there are no pending orders', async () => {
    deliveryService.getPendingDeliveries.mockResolvedValue([])

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No hay pedidos listos para repartir ahora mismo.',
    )
  })

  it('shows an error when orders fail to load', async () => {
    deliveryService.getPendingDeliveries.mockRejectedValueOnce(
      new Error('Network error'),
    )

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'No se han podido cargar los pedidos pendientes de reparto.',
    )
  })

  it('allows retrying after a loading error', async () => {
    deliveryService.getPendingDeliveries.mockRejectedValueOnce(
      new Error('Network error'),
    )

    const wrapper = mountList()
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Pedido #9')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('lists the order number and delivery address', async () => {
    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.text()).toContain('Pedido #9')
    expect(wrapper.text()).toContain('Calle Falsa 123')
  })

  it('shows a fallback when the address is missing', async () => {
    deliveryService.getPendingDeliveries.mockResolvedValue([
      { ...order, address: null },
    ])

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.text()).toContain('Sin dirección registrada')
  })

  it('assigns the order before dispatching and refreshes the list', async () => {
    deliveryService.getPendingDeliveries
      .mockResolvedValueOnce([order])
      .mockResolvedValueOnce([])

    const wrapper = mountList()
    await flushPromises()

    await wrapper.get('.pending-deliveries__accept-btn')
      .trigger('click')
    await flushPromises()

    expect(deliveryService.assignOrderToSelf).toHaveBeenCalledWith(9)
    expect(deliveryService.markOrderInTransit).toHaveBeenCalledWith(9)

    expect(
      deliveryService.assignOrderToSelf.mock.invocationCallOrder[0],
    ).toBeLessThan(
      deliveryService.markOrderInTransit.mock.invocationCallOrder[0],
    )

    expect(deliveryService.getPendingDeliveries)
      .toHaveBeenCalledTimes(2)

    expect(wrapper.text()).toContain(
      'No hay pedidos listos para repartir ahora mismo.',
    )
    expect(wrapper.text()).not.toContain('Pedido #9')
    expect(wrapper.emitted('order-accepted')).toHaveLength(1)
  })

  it('blocks all accept buttons while an assignment is pending', async () => {
    deliveryService.getPendingDeliveries.mockResolvedValue([
      order,
      { id: 10, address: 'Calle Mayor 2' },
    ])

    let resolveAssign

    deliveryService.assignOrderToSelf.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAssign = resolve
      }),
    )

    const wrapper = mountList()
    await flushPromises()

    const buttons = wrapper.findAll('.pending-deliveries__accept-btn')

    await buttons[0].trigger('click')

    expect(buttons[0].text()).toBe('Aceptando…')

    buttons.forEach((button) => {
      expect(button.element.disabled).toBe(true)
    })

    expect(deliveryService.markOrderInTransit).not.toHaveBeenCalled()

    resolveAssign({})
    await flushPromises()
  })

  it('shows a generic error and retains orders returned by the backend', async () => {
    deliveryService.assignOrderToSelf.mockRejectedValueOnce(
      new Error('Network error'),
    )

    const wrapper = mountList()
    await flushPromises()

    await wrapper.get('.pending-deliveries__accept-btn')
      .trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se ha podido aceptar el pedido. Inténtalo de nuevo.',
    )
    expect(wrapper.text()).toContain('Pedido #9')
    expect(deliveryService.markOrderInTransit).not.toHaveBeenCalled()
    expect(wrapper.emitted('order-accepted')).toBeUndefined()
  })

  it('shows the 409 warning even when refreshing leaves the list empty', async () => {
    deliveryService.getPendingDeliveries
      .mockResolvedValueOnce([order])
      .mockResolvedValueOnce([])

    deliveryService.assignOrderToSelf.mockRejectedValueOnce({
      response: { status: 409 },
    })

    const wrapper = mountList()
    await flushPromises()

    await wrapper.get('.pending-deliveries__accept-btn')
      .trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'Este pedido ya está asignado a otro repartidor.',
    )
    expect(wrapper.text()).toContain(
      'No hay pedidos listos para repartir ahora mismo.',
    )
    expect(deliveryService.getPendingDeliveries)
      .toHaveBeenCalledTimes(2)
    expect(deliveryService.markOrderInTransit).not.toHaveBeenCalled()
    expect(wrapper.emitted('order-accepted')).toBeUndefined()
  })

  it('reports when assignment succeeds but dispatch fails', async () => {
    deliveryService.getPendingDeliveries
      .mockResolvedValueOnce([order])
      .mockResolvedValueOnce([])

    deliveryService.markOrderInTransit.mockRejectedValueOnce(
      new Error('Network error'),
    )

    const wrapper = mountList()
    await flushPromises()

    await wrapper.get('.pending-deliveries__accept-btn')
      .trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'El pedido se ha asignado a ti, pero no se ha podido marcar en tránsito. Comprueba su estado antes de salir.',
    )
    expect(wrapper.emitted('order-accepted')).toBeUndefined()
  })

  it('refreshes automatically after ten seconds', async () => {
    vi.useFakeTimers()

    deliveryService.getPendingDeliveries
      .mockResolvedValueOnce([order])
      .mockResolvedValueOnce([])

    const wrapper = mountList()
    await flushPromises()

    expect(wrapper.text()).toContain('Pedido #9')

    await vi.advanceTimersByTimeAsync(10_000)
    await flushPromises()

    expect(deliveryService.getPendingDeliveries)
      .toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Pedido #9')
    expect(wrapper.text()).toContain(
      'No hay pedidos listos para repartir ahora mismo.',
    )
  })

  it('stops automatic refresh when unmounted', async () => {
    vi.useFakeTimers()

    const wrapper = mountList()
    await flushPromises()

    wrapper.unmount()
    wrappers = []

    await vi.advanceTimersByTimeAsync(20_000)

    expect(deliveryService.getPendingDeliveries)
      .toHaveBeenCalledTimes(1)
  })
})