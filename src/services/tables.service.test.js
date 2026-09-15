import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLinkedTable } from './tables.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('tables.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('requests the real by-device endpoint with a Device-Identifier header', async () => {
    api.get.mockResolvedValue({ data: { tableNumber: 5 } })

    await getLinkedTable()

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/tables/by-device',
      { headers: { 'Device-Identifier': expect.any(String) } },
    )
  })

  it('generates a device identifier only once and reuses it on later calls', async () => {
    api.get.mockResolvedValue({ data: { tableNumber: 5 } })

    await getLinkedTable()
    const firstDeviceId = api.get.mock.calls[0][1].headers['Device-Identifier']

    await getLinkedTable()
    const secondDeviceId = api.get.mock.calls[1][1].headers['Device-Identifier']

    expect(secondDeviceId).toBe(firstDeviceId)
  })

  it('returns the response data as-is', async () => {
    api.get.mockResolvedValue({ data: { tableNumber: 8 } })

    const result = await getLinkedTable()

    expect(result).toEqual({ tableNumber: 8 })
  })
})
