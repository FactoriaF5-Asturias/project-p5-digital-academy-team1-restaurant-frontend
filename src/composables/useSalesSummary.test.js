import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSalesSummary } from './useSalesSummary'
import { getSalesSummary } from '../services/reports.service'

vi.mock('../services/reports.service', () => ({
  getSalesSummary: vi.fn(),
}))

describe('useSalesSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('carga los totales del periodo y calcula el ticket medio', async () => {
    getSalesSummary.mockResolvedValue({ revenue: 100, orders: 4 })
    const { summary, averageTicket, loadSummary } = useSalesSummary()

    await loadSummary('month')

    expect(getSalesSummary).toHaveBeenCalledWith('month')
    expect(summary.value).toEqual({ revenue: 100, orders: 4 })
    expect(averageTicket.value).toBe(25)
  })

  it('el ticket medio es 0 si no hay pedidos', async () => {
    getSalesSummary.mockResolvedValue({ revenue: 0, orders: 0 })
    const { averageTicket, loadSummary } = useSalesSummary()

    await loadSummary('day')

    expect(averageTicket.value).toBe(0)
  })

  it('marca la carga mientras espera al backend', async () => {
    getSalesSummary.mockResolvedValue({ revenue: 0, orders: 0 })
    const { isLoading, loadSummary } = useSalesSummary()

    const request = loadSummary('day')
    expect(isLoading.value).toBe(true)

    await request
    expect(isLoading.value).toBe(false)
  })

  it('muestra un error y borra los datos si el backend falla', async () => {
    getSalesSummary.mockRejectedValue(new Error('500'))
    const { summary, loadError, loadSummary } = useSalesSummary()

    await loadSummary('day')

    expect(summary.value).toBeNull()
    expect(loadError.value).toBe('No se ha podido cargar el resumen de ventas. Inténtalo de nuevo más tarde.')
  })
})