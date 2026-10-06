import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { getSalesKpi } from './kpi.service'

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}))

describe('kpi.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pide los KPI de ventas y devuelve los datos', async () => {
    const kpi = { today: { revenue: 100, previousRevenue: 80 } }
    api.get.mockResolvedValue({ data: kpi })

    const result = await getSalesKpi()

    expect(api.get).toHaveBeenCalledWith('/api/v1/kpi/sales')
    expect(result).toEqual(kpi)
  })

  it('propaga el error si el backend falla', async () => {
    api.get.mockRejectedValue(new Error('Network Error'))

    await expect(getSalesKpi()).rejects.toThrow('Network Error')
  })
})