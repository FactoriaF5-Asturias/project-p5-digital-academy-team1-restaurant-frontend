import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import MiPedidoView from './MiPedidoView.vue'
import OrderHistorySection from '../components/OrderHistorySection.vue'
import OrderTicket from '../components/OrderTicket.vue'
import { useAuthStore } from '../stores/auth'
import { useLastOrderStore } from '../stores/lastOrder'
import * as ticketsService from '../services/tickets.service'

const ONSITE_TICKET = {
  id: 42,
  status: 'PROCESSING',
  channel: 'ONSITE',
  tableNumber: 3,
  items: [{ productName: 'Pull Nigiri', quantity: 2, unitPrice: 8.5, lineTotal: 17 }],
  subtotal: 17,
  discountAmount: 0,
  vatRate: 10,
  vatAmount: 1.7,
  deliveryFee: null,
  total: 18.7,
  paymentMethod: 'CASH_ONSITE',
  paymentStatus: 'PENDING_CASH',
  deliveryAddress: null,
}

const routes = [
  { path: '/', name: 'carta', component: { template: '<div>Carta</div>' } },
  { path: '/mi-pedido', name: 'mi-pedido', component: MiPedidoView },
  { path: '/tickets/:id', name: 'ticket', component: MiPedidoView },
]

async function mountView(path = '/mi-pedido', { lastOrder } = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()

  if (lastOrder) useLastOrderStore().setOrder(lastOrder)

  const wrapper = mount(MiPedidoView, {
    global: { plugins: [router], stubs: { OrderHistorySection: true } },
  })
  await flushPromises()
  return wrapper
}

describe('MiPedidoView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(ticketsService, 'getTicket').mockResolvedValue(ONSITE_TICKET)
  })

  it('shows an empty state with a link to the menu when there is no order', async () => {
    const wrapper = await mountView()

    expect(wrapper.find('.mi-pedido-view__empty').text()).toContain(
      'Todavía no tienes un pedido en curso',
    )
    expect(wrapper.find('.mi-pedido-view__link').attributes('href')).toBe('/')
    expect(wrapper.findComponent(OrderTicket).exists()).toBe(false)
    expect(ticketsService.getTicket).not.toHaveBeenCalled()
  })

  it('shows the real ticket of the last confirmed order', async () => {
    const wrapper = await mountView('/mi-pedido', {
      lastOrder: { id: 42, ticketAccessToken: 'abc-123' },
    })

    expect(ticketsService.getTicket).toHaveBeenCalledWith(42, 'abc-123')
    const ticket = wrapper.findComponent(OrderTicket)
    expect(ticket.exists()).toBe(true)
    expect(ticket.props('ticket')).toMatchObject({ id: 42, tableNumber: 3, total: 18.7 })
  })

  it('shows the ticket of the order in the email link', async () => {
    const wrapper = await mountView('/tickets/7?token=mail-token')

    expect(ticketsService.getTicket).toHaveBeenCalledWith('7', 'mail-token')
    expect(wrapper.findComponent(OrderTicket).exists()).toBe(true)
  })

  it('shows a loading message while the ticket is on its way', async () => {
    ticketsService.getTicket.mockReturnValue(new Promise(() => {}))

    const wrapper = await mountView('/mi-pedido', { lastOrder: { id: 42 } })

    expect(wrapper.find('[role="status"]').text()).toBe('Cargando tu pedido...')
  })

  it('shows an error message when the ticket cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    ticketsService.getTicket.mockRejectedValue(new Error('network error'))

    const wrapper = await mountView('/mi-pedido', { lastOrder: { id: 42 } })

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'No se ha podido cargar tu pedido. Inténtalo de nuevo más tarde.',
    )
  })

  it('does not render the order history section without a session', async () => {
    const wrapper = await mountView()

    expect(wrapper.findComponent(OrderHistorySection).exists()).toBe(false)
  })

  it('renders the order history section when there is a session', async () => {
    useAuthStore().user = { id: 1 }

    const wrapper = await mountView()

    expect(wrapper.findComponent(OrderHistorySection).exists()).toBe(true)
  })

  it('wraps the ticket and the history in the container with side margins', async () => {
    const wrapper = await mountView()

    expect(wrapper.find('main').classes()).toContain('mi-pedido-view')
  })
})