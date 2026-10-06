import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import {
  buildFallbackFileName,
  getFileName,
  getSalesReportPdf,
  getSalesSummary,
} from './reports.service'

vi.mock('./api', () => ({
  default: { get: vi.fn() },
}))

describe('reports.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pide los totales del periodo', async () => {
    api.get.mockResolvedValue({ data: { revenue: 120, orders: 6 } })

    const summary = await getSalesSummary('week')

    expect(api.get).toHaveBeenCalledWith('/api/v1/reports/sales', { params: { period: 'week' } })
    expect(summary).toEqual({ revenue: 120, orders: 6 })
  })

  it('pide el PDF como archivo y usa el nombre que envía el backend', async () => {
    const blob = new Blob(['%PDF'])
    api.get.mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="resumen-ventas-2026-10-01.pdf"' },
    })

    const result = await getSalesReportPdf('day')

    expect(api.get).toHaveBeenCalledWith('/api/v1/reports/sales.pdf', {
      params: { period: 'day' },
      responseType: 'blob',
    })
    expect(result).toEqual({ blob, fileName: 'resumen-ventas-2026-10-01.pdf' })
  })

  it('lee el nombre aunque venga sin comillas', () => {
    expect(getFileName('attachment; filename=ventas-mes.pdf', 'month')).toBe('ventas-mes.pdf')
  })

  it('si el backend no envía nombre, usa uno con el periodo y la fecha', () => {
    expect(getFileName(undefined, 'month')).toMatch(/^resumen-ventas-month-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('el nombre de respaldo incluye la fecha', () => {
    const today = new Date('2026-10-01T10:00:00Z')

    expect(buildFallbackFileName('week', today)).toBe('resumen-ventas-week-2026-10-01.pdf')
  })
})