import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import KitchenOrderCard from './KitchenOrderCard.vue'
import { markOrderAsPaid, updateKitchenOrderStatus } from '../services/kitchen.service'

vi.mock('../services/kitchen.service', () => ({
  updateKitchenOrderStatus: vi.fn(),
  markOrderAsPaid: vi.fn(),
}))

const order = {
  id: 1042,
  elapsedTime: 16,
  status: 'PROCESSING',
  products: [
    {
      name: 'Pull Nigiri',
      quantity: 2,
    },
    {
      name: 'Merge Maki',
      quantity: 1,
    },
  ],
}

describe('KitchenOrderCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateKitchenOrderStatus.mockResolvedValue({})
  })

  it('shows the order information', () => {
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    expect(wrapper.text()).toContain('#1042')
    expect(wrapper.text()).toContain('16 min')
    expect(wrapper.text()).toContain('Pull Nigiri')
    expect(wrapper.text()).toContain('x2')
    expect(wrapper.text()).toContain('Merge Maki')
    expect(wrapper.text()).toContain('x1')
  })

  it('shows the current order status', () => {
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    expect(wrapper.text()).toContain('Estado: En preparación')
  })

  it('updates the order status to delayed through the API', async () => {
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    const buttons = wrapper.findAll('button')

    await buttons[1].trigger('click')
    await flushPromises()

    expect(updateKitchenOrderStatus).toHaveBeenCalledWith(1042, 'DELAYED')
    expect(wrapper.text()).toContain('Estado: Con retraso')
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('updates the order status to ready through the API', async () => {
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    const buttons = wrapper.findAll('button')

    await buttons[2].trigger('click')
    await flushPromises()

    expect(updateKitchenOrderStatus).toHaveBeenCalledWith(1042, 'READY')
    expect(wrapper.text()).toContain('Estado: Listo')
    expect(buttons[2].attributes('disabled')).toBeDefined()
  })

  it('shows an error and keeps the previous status when the API fails', async () => {
    updateKitchenOrderStatus.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    const buttons = wrapper.findAll('button')

    await buttons[2].trigger('click')
    await flushPromises()

    expect(updateKitchenOrderStatus).toHaveBeenCalledWith(1042, 'READY')
    expect(wrapper.text()).toContain('Estado: En preparación')
    expect(wrapper.text()).toContain(
      'No se ha podido actualizar el estado.'
    )
  })

  it('shows the priority note when the order has one', () => {
    const orderWithPriorityNote = {
      ...order,
      priorityNote: 'ALERGIA AL MARISCO - Preparar por separado',
    }

    const wrapper = mount(KitchenOrderCard, {
      props: { order: orderWithPriorityNote },
    })

    expect(wrapper.text()).toContain('Nota de comanda prioritaria')
    expect(wrapper.text()).toContain(
      'ALERGIA AL MARISCO - Preparar por separado'
    )
  })

  it('does not show a priority note when the order has none', () => {
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    expect(wrapper.text()).not.toContain('Nota de comanda prioritaria')
  })

  it('keeps the priority note visible after changing the order status', async () => {
    const orderWithPriorityNote = {
      ...order,
      priorityNote: 'ALERGIA AL MARISCO - Preparar por separado',
    }

    const wrapper = mount(KitchenOrderCard, {
      props: { order: orderWithPriorityNote },
    })

    const buttons = wrapper.findAll('button')

    await buttons[2].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Estado: Listo')
    expect(wrapper.text()).toContain('Nota de comanda prioritaria')
    expect(wrapper.text()).toContain(
      'ALERGIA AL MARISCO - Preparar por separado'
    )
  })
  
  it('notifies the new status after updating it, so the metrics can refresh', async () => {
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    await wrapper.findAll('button')[2].trigger('click')
    await flushPromises()

    expect(wrapper.emitted('status-changed')).toEqual([[{ id: 1042, status: 'READY' }]])
  })

  it('does not notify a status change when the API fails', async () => {
    updateKitchenOrderStatus.mockRejectedValue(new Error('network error'))
    const wrapper = mount(KitchenOrderCard, {
      props: { order },
    })

    await wrapper.findAll('button')[2].trigger('click')
    await flushPromises()

    expect(wrapper.emitted('status-changed')).toBeUndefined()
  })

  describe('dine-in payment', () => {
    const unpaidOnsiteOrder = {
      ...order,
      status: 'PLACED',
      channel: 'ONSITE',
      paymentStatus: 'PENDING_CASH',
    }

    function findCollectButton(wrapper) {
      return wrapper.find('.kitchen-order-card__collect')
    }

    it('offers to register the cash payment of a dine-in order that has just arrived', () => {
      const wrapper = mount(KitchenOrderCard, { props: { order: unpaidOnsiteOrder } })

      expect(findCollectButton(wrapper).text()).toBe('Cobrado en caja')
    })

    it('names the button after the card terminal when the table pays by card', () => {
      const wrapper = mount(KitchenOrderCard, {
        props: { order: { ...unpaidOnsiteOrder, paymentStatus: 'PENDING_CARD_TERMINAL' } },
      })

      expect(findCollectButton(wrapper).text()).toBe('Cobrado con datáfono')
    })

    it('does not offer it for paid, home delivery or already started orders', () => {
      const paid = mount(KitchenOrderCard, {
        props: { order: { ...unpaidOnsiteOrder, paymentStatus: null } },
      })
      const homeDelivery = mount(KitchenOrderCard, {
        props: { order: { ...unpaidOnsiteOrder, channel: 'ONLINE', paymentStatus: 'PENDING_CASH_ON_DELIVERY' } },
      })
      const started = mount(KitchenOrderCard, {
        props: { order: { ...unpaidOnsiteOrder, status: 'PROCESSING' } },
      })

      expect(findCollectButton(paid).exists()).toBe(false)
      expect(findCollectButton(homeDelivery).exists()).toBe(false)
      expect(findCollectButton(started).exists()).toBe(false)
    })

    it('marks the order as paid, hides the button and notifies the view', async () => {
      markOrderAsPaid.mockResolvedValue({})
      const wrapper = mount(KitchenOrderCard, { props: { order: unpaidOnsiteOrder } })

      await findCollectButton(wrapper).trigger('click')
      await flushPromises()

      expect(markOrderAsPaid).toHaveBeenCalledWith(1042)
      expect(findCollectButton(wrapper).exists()).toBe(false)
      expect(wrapper.text()).toContain('Estado: Pagado')
      expect(wrapper.emitted('status-changed')).toEqual([[{ id: 1042, status: 'PAID' }]])
    })

    it('keeps the button and shows an error when the payment cannot be registered', async () => {
      markOrderAsPaid.mockRejectedValue(new Error('network error'))
      const wrapper = mount(KitchenOrderCard, { props: { order: unpaidOnsiteOrder } })

      await findCollectButton(wrapper).trigger('click')
      await flushPromises()

      expect(findCollectButton(wrapper).exists()).toBe(true)
      expect(wrapper.text()).toContain('No se ha podido registrar el cobro.')
    })
  })
})
