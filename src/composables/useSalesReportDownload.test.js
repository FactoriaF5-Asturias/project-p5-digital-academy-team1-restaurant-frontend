import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSalesReportDownload } from './useSalesReportDownload'
import { getSalesReportPdf } from '../services/reports.service'
import { downloadFile } from '../utils/downloadFile'

vi.mock('../services/reports.service', () => ({
  getSalesReportPdf: vi.fn(),
}))

vi.mock('../utils/downloadFile', () => ({
  downloadFile: vi.fn(),
}))

const PDF = { blob: new Blob(['%PDF']), fileName: 'resumen-ventas-2026-10-01.pdf' }

describe('useSalesReportDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('pide el PDF del periodo y lo descarga con su nombre', async () => {
    getSalesReportPdf.mockResolvedValue(PDF)
    const { downloadReport } = useSalesReportDownload()

    await downloadReport('week')

    expect(getSalesReportPdf).toHaveBeenCalledWith('week')
    expect(downloadFile).toHaveBeenCalledWith(PDF.blob, PDF.fileName)
  })

  it('marca "generando" mientras espera y lo quita al terminar', async () => {
    getSalesReportPdf.mockResolvedValue(PDF)
    const { isDownloading, downloadReport } = useSalesReportDownload()

    const request = downloadReport('day')
    expect(isDownloading.value).toBe(true)

    await request
    expect(isDownloading.value).toBe(false)
  })

  it('no pide el PDF dos veces si ya se está generando', async () => {
    getSalesReportPdf.mockResolvedValue(PDF)
    const { downloadReport } = useSalesReportDownload()

    const first = downloadReport('day')
    await downloadReport('day')
    await first

    expect(getSalesReportPdf).toHaveBeenCalledTimes(1)
  })

  it('muestra un error si no se puede generar', async () => {
    getSalesReportPdf.mockRejectedValue(new Error('500'))
    const { downloadError, downloadReport } = useSalesReportDownload()

    await downloadReport('day')

    expect(downloadError.value).toBe('No se ha podido generar el PDF. Inténtalo de nuevo.')
    expect(downloadFile).not.toHaveBeenCalled()
  })
})