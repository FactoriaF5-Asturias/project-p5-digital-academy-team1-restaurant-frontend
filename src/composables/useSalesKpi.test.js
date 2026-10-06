import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSalesKpi } from './useSalesKpi'
import { getSalesKpi } from '../services/kpi.service'

vi.mock('../services/kpi.service', () => ({
  getSalesKpi: vi.fn(),
}))

describe('useSalesKpi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('carga los KPI de ventas', async () => {
    const data = { today: { revenue: 100, previousRevenue: 80 } }
    getSalesKpi.mockResolvedValue(data)
    const { kpi, loadError, loadKpi } = useSalesKpi()

    await loadKpi()

    expect(kpi.value).toEqual(data)
    expect(loadError.value).toBe('')
  })

  it('marca la carga mientras espera al backend', async () => {
    getSalesKpi.mockResolvedValue({})
    const { isLoading, loadKpi } = useSalesKpi()

    const request = loadKpi()
    expect(isLoading.value).toBe(true)

    await request
    expect(isLoading.value).toBe(false)
  })

  it('muestra un mensaje de error y vacía los datos si el backend falla', async () => {
    getSalesKpi.mockResolvedValueOnce({ today: {} }).mockRejectedValueOnce(new Error('500'))
    const { kpi, isLoading, loadError, loadKpi } = useSalesKpi()

    await loadKpi()
    await loadKpi()

    expect(kpi.value).toBeNull()
    expect(isLoading.value).toBe(false)
    expect(loadError.value).toBe(
      'No se han podido cargar los KPI de ventas. Inténtalo de nuevo más tarde.'
    )
  })

  it('al refrescar mantiene los KPI en pantalla sin mostrar "cargando"', async () => {
    getSalesKpi.mockResolvedValue({ today: { revenue: 100, previousRevenue: 80 } })
    const { isLoading, loadKpi } = useSalesKpi()
    await loadKpi()

    const refreshing = loadKpi()

    expect(isLoading.value).toBe(false)
    await refreshing
  })
})
