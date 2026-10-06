import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import KitchenAttendedOrders from './KitchenAttendedOrders.vue'
import { getAttendedOrders } from '../services/kitchen.service'
import { formatCurrency } from '../utils/formatCurrency'

vi.mock('../services/kitchen.service', () => ({
  getAttendedOrders: vi.fn(),
}))

const ATTENDED_ORDERS = [
  { id: 5, status: 'READY', channel: 'ONSITE', tableNumber: 2, total: 8.99 },
  { id: 2, status: 'ONTHEWAY', channel: 'ONLINE', tableNumber: null, total: 8.99 },
  { id: 1, status: 'DELIVERED', channel: 'ONLINE', tableNumber: null, total: 11.55 },
]

describe('KitchenAttendedOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('shows a loading message while the orders are on their way', () => {
    getAttendedOrders.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(KitchenAttendedOrders)

    expect(wrapper.text()).toContain('Cargando comandas atendidas...')
  })

  it('shows one row per attended order with channel, status and total', async () => {
    getAttendedOrders.mockResolvedValue(ATTENDED_ORDERS)

    const wrapper = mount(KitchenAttendedOrders)
    await flushPromises()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
    expect(rows[0].text()).toContain('#5')
    expect(rows[0].text()).toContain('Sala · Mesa 2')
    expect(rows[0].text()).toContain('Listo')
    expect(rows[0].text()).toContain(formatCurrency(8.99))
    expect(rows[1].text()).toContain('A domicilio')
    expect(rows[1].text()).toContain('En reparto')
    expect(rows[2].text()).toContain('Entregado')
  })

  it('gives each status its own badge style', async () => {
    getAttendedOrders.mockResolvedValue(ATTENDED_ORDERS)

    const wrapper = mount(KitchenAttendedOrders)
    await flushPromises()

    const badges = wrapper.findAll('.kitchen-attended__badge')
    expect(badges[0].classes()).toContain('kitchen-attended__badge--ready')
    expect(badges[1].classes()).toContain('kitchen-attended__badge--ontheway')
    expect(badges[2].classes()).toContain('kitchen-attended__badge--delivered')
  })

  it('shows an empty message when no order has been attended yet', async () => {
    getAttendedOrders.mockResolvedValue([])

    const wrapper = mount(KitchenAttendedOrders)
    await flushPromises()

    expect(wrapper.text()).toContain('Todavía no hay comandas atendidas.')
  })

  it('shows an error message when the orders cannot be loaded', async () => {
    getAttendedOrders.mockRejectedValue(new Error('network error'))

    const wrapper = mount(KitchenAttendedOrders)
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'No se han podido cargar las comandas atendidas.',
    )
  })
})
