// src/services/tickets.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { getTicket } from './tickets.service'

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}))

describe('tickets.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests the ticket of the order with its access token', async () => {
    api.get.mockResolvedValue({ data: { id: 42, total: 19.2 } })

    const result = await getTicket(42, 'abc-123')

    expect(api.get).toHaveBeenCalledWith('/api/v1/tickets/42', {
      params: { token: 'abc-123' },
    })
    expect(result).toEqual({ id: 42, total: 19.2 })
  })

  it('does not send the token param when there is no token', async () => {
    api.get.mockResolvedValue({ data: { id: 42 } })

    await getTicket(42, null)

    expect(api.get).toHaveBeenCalledWith('/api/v1/tickets/42', { params: {} })
  })
})