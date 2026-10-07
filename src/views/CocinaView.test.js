import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CocinaView from './CocinaView.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import {
  getKitchenOrders,
  getKitchenChannelCounts,
  getKitchenMetrics,
} from '../services/kitchen.service'
import { AUTO_REFRESH_INTERVAL_MS } from '../constants/autoRefresh'

vi.mock('../services/kitchen.service', () => ({
  getKitchenOrders: vi.fn(),
  getKitchenChannelCounts: vi.fn(),
  getKitchenMetrics: vi.fn(),
}))

let wrappers = []

function mountView() {
  const wrapper = mount(CocinaView, {
    global: {
      stubs: {
        KitchenMetrics: true,
        KitchenAttendedOrders: true,
        KitchenOrderCard: {
          props: ['order'],
          emits: ['status-changed'],
          template: '<article>Comanda #{{ order.id }}</article>',
        },
        LoadingSpinner: {
          props: ['label'],
          template: '<p role="status">{{ label }}</p>',
        },
      },
    },
  })

  wrappers.push(wrapper)
  return wrapper
}

describe('CocinaView', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    getKitchenOrders.mockResolvedValue([])
    getKitchenChannelCounts.mockResolvedValue({
      total: 5,
      inStore: 3,
      delivery: 2,
    })
    getKitchenMetrics.mockResolvedValue({})
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []
    vi.useRealTimers()
  })

  it('loads orders, counters and metrics on mount', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(getKitchenOrders).toHaveBeenCalledWith('ALL')
    expect(getKitchenChannelCounts).toHaveBeenCalledTimes(1)
    expect(getKitchenMetrics).toHaveBeenCalledTimes(1)

    expect(
      wrapper.getComponent(KitchenOrderList).props('channelCounts'),
    ).toEqual({ total: 5, inStore: 3, delivery: 2 })
  })

  it('shows loading while orders are being fetched', async () => {
    let resolveRequest

    getKitchenOrders.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const wrapper = mountView()

    expect(wrapper.text()).toContain('Cargando comandas...')

    resolveRequest([])
    await flushPromises()

    expect(wrapper.text()).not.toContain('Cargando comandas...')
  })

  it.each([
    ['ONSITE', 1],
    ['ONLINE', 2],
  ])(
    'requests channel %s and shows its orders',
    async (channel, buttonIndex) => {
      const wrapper = mountView()
      await flushPromises()

      getKitchenOrders.mockResolvedValueOnce([{ id: 42, channel }])

      await wrapper
        .getComponent(KitchenOrderList)
        .findAll('button')[buttonIndex]
        .trigger('click')

      await flushPromises()

      expect(getKitchenOrders).toHaveBeenLastCalledWith(channel)
      expect(getKitchenChannelCounts).toHaveBeenCalledTimes(2)
      expect(wrapper.text()).toContain('Comanda #42')
      expect(
        wrapper.getComponent(KitchenOrderList).props('selectedChannel'),
      ).toBe(channel)
    },
  )

  it('does not reload when clicking the selected channel', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper
      .getComponent(KitchenOrderList)
      .findAll('button')[0]
      .trigger('click')

    expect(getKitchenOrders).toHaveBeenCalledTimes(1)
    expect(getKitchenChannelCounts).toHaveBeenCalledTimes(1)
  })

  it('shows an empty state for the selected channel', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper
      .getComponent(KitchenOrderList)
      .findAll('button')[1]
      .trigger('click')

    await flushPromises()

    expect(wrapper.text()).toContain(
      'No hay comandas activas para este canal.',
    )
  })

  it('shows an error when orders cannot be loaded', async () => {
    getKitchenOrders.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se han podido cargar las comandas.',
    )
    expect(
      wrapper.getComponent(KitchenOrderList).props('isLoading'),
    ).toBe(false)
  })

  it('keeps orders visible when loading counters fails', async () => {
    getKitchenOrders.mockResolvedValueOnce([{ id: 42 }])
    getKitchenChannelCounts.mockRejectedValueOnce(
      new Error('Network error'),
    )

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Comanda #42')
    expect(wrapper.text()).toContain(
      'No se han podido cargar los contadores.',
    )
    expect(
      wrapper.getComponent(KitchenOrderList).props('channelCounts'),
    ).toBeNull()
  })

  it('ignores an older response after changing channel', async () => {
    let resolveInitialRequest

    getKitchenOrders.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveInitialRequest = resolve
      }),
    )

    const wrapper = mountView()

    getKitchenOrders.mockResolvedValueOnce([
      { id: 99, channel: 'ONLINE' },
    ])

    await wrapper
      .getComponent(KitchenOrderList)
      .findAll('button')[2]
      .trigger('click')

    await flushPromises()

    resolveInitialRequest([{ id: 1, channel: 'ONSITE' }])
    await flushPromises()

    expect(wrapper.text()).toContain('Comanda #99')
    expect(wrapper.text()).not.toContain('Comanda #1')
  })

  it('refreshes orders, counters and metrics after a status change', async () => {
    getKitchenOrders.mockResolvedValueOnce([{ id: 42 }])

    const wrapper = mountView()
    await flushPromises()

    getKitchenOrders.mockResolvedValueOnce([])
    getKitchenChannelCounts.mockResolvedValueOnce({
      total: 0,
      inStore: 0,
      delivery: 0,
    })

    wrapper.getComponent(KitchenOrderList).vm.$emit(
      'status-changed',
      { id: 42, status: 'READY' },
    )

    await flushPromises()

    expect(getKitchenOrders).toHaveBeenCalledTimes(2)
    expect(getKitchenChannelCounts).toHaveBeenCalledTimes(2)
    expect(getKitchenMetrics).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Comanda #42')
    expect(
      wrapper.getComponent(KitchenOrderList).props('channelCounts'),
    ).toEqual({ total: 0, inStore: 0, delivery: 0 })
  })

  it('refreshes automatically without hiding existing orders', async () => {
    vi.useFakeTimers()

    getKitchenOrders.mockResolvedValueOnce([{ id: 42 }])

    const wrapper = mountView()
    await flushPromises()

    let resolveRefresh

    getKitchenOrders.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve
      }),
    )

    await vi.advanceTimersByTimeAsync(AUTO_REFRESH_INTERVAL_MS)

    expect(
      wrapper.getComponent(KitchenOrderList).props('isLoading'),
    ).toBe(false)
    expect(wrapper.text()).toContain('Comanda #42')

    resolveRefresh([{ id: 42 }, { id: 43 }])
    await flushPromises()

    expect(getKitchenOrders).toHaveBeenCalledTimes(2)
    expect(getKitchenChannelCounts).toHaveBeenCalledTimes(2)
    expect(getKitchenMetrics).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Comanda #43')
  })

  it('stops automatic refresh when unmounted', async () => {
    vi.useFakeTimers()

    const wrapper = mountView()
    await flushPromises()

    wrapper.unmount()
    wrappers = []

    await vi.advanceTimersByTimeAsync(AUTO_REFRESH_INTERVAL_MS * 2)

    expect(getKitchenOrders).toHaveBeenCalledTimes(1)
    expect(getKitchenChannelCounts).toHaveBeenCalledTimes(1)
    expect(getKitchenMetrics).toHaveBeenCalledTimes(1)
  })
})