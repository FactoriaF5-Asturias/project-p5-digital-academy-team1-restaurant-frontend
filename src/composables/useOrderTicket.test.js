import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useOrderTicket, REFRESH_INTERVAL_MS } from './useOrderTicket'
import * as ticketsService from '../services/tickets.service'

const REFERENCE = { id: 42, token: 'abc-123' }

function buildTicket(overrides = {}) {
  return {
    id: 42,
    status: 'PROCESSING',
    channel: 'ONSITE',
    tableNumber: 3,
    items: [],
    subtotal: 10,
    discountAmount: 0,
    vatRate: 10,
    vatAmount: 1,
    deliveryFee: null,
    total: 11,
    paymentMethod: 'CASH_ONSITE',
    paymentStatus: 'PENDING_CASH',
    deliveryAddress: null,
    ...overrides,
  }
}

describe('useOrderTicket', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not request anything when there is no order', async () => {
    const spy = vi.spyOn(ticketsService, 'getTicket')
    const { hasOrder, ticket, fetchTicket } = useOrderTicket(null)

    await fetchTicket()

    expect(hasOrder).toBe(false)
    expect(ticket.value).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })

  it('requests the ticket with the order id and token and maps it', async () => {
    const spy = vi.spyOn(ticketsService, 'getTicket').mockResolvedValue(buildTicket())
    const { ticket, fetchTicket } = useOrderTicket(REFERENCE)

    await fetchTicket()

    expect(spy).toHaveBeenCalledWith(42, 'abc-123')
    expect(ticket.value.id).toBe(42)
    expect(ticket.value.paymentStatusLabel).toBe('Pendiente de cobro en caja')
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(ticketsService, 'getTicket').mockResolvedValue(buildTicket())
    const { isLoading, fetchTicket } = useOrderTicket(REFERENCE)

    const promise = fetchTicket()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores an error message when the first request fails', async () => {
    vi.spyOn(ticketsService, 'getTicket').mockRejectedValue(new Error('network error'))
    const { loadError, ticket, fetchTicket } = useOrderTicket(REFERENCE)

    await fetchTicket()

    expect(ticket.value).toBeNull()
    expect(loadError.value).toBe('No se ha podido cargar tu pedido. Inténtalo de nuevo más tarde.')
  })

  it('keeps showing the last ticket when a refresh fails', async () => {
    const spy = vi.spyOn(ticketsService, 'getTicket').mockResolvedValue(buildTicket())
    const { loadError, ticket, fetchTicket } = useOrderTicket(REFERENCE)
    await fetchTicket()

    spy.mockRejectedValue(new Error('network error'))
    await fetchTicket()

    expect(ticket.value.id).toBe(42)
    expect(loadError.value).toBe('')
  })

  it('refreshes the ticket periodically to show the new status', async () => {
    vi.useFakeTimers()
    const spy = vi.spyOn(ticketsService, 'getTicket').mockResolvedValue(buildTicket())
    const { fetchTicket, startAutoRefresh, stopAutoRefresh } = useOrderTicket(REFERENCE)
    await fetchTicket()

    startAutoRefresh()
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)

    expect(spy).toHaveBeenCalledTimes(2)
    stopAutoRefresh()
  })

  it('stops refreshing once the order is delivered', async () => {
    vi.useFakeTimers()
    const spy = vi
      .spyOn(ticketsService, 'getTicket')
      .mockResolvedValue(buildTicket({ status: 'DELIVERED', channel: 'ONLINE' }))
    const { fetchTicket, startAutoRefresh } = useOrderTicket(REFERENCE)
    await fetchTicket()

    startAutoRefresh()
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 3)

    expect(spy).toHaveBeenCalledTimes(1)
  })
})