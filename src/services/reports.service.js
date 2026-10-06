import api from './api'

// Endpoints del resumen de ventas (backend GS-63, de José Luis).
const SALES_REPORT_ENDPOINT = '/api/v1/reports/sales'
const SALES_REPORT_PDF_ENDPOINT = `${SALES_REPORT_ENDPOINT}.pdf`
const FILE_NAME_PATTERN = /filename="?([^";]+)"?/

// Totales del periodo: { revenue, orders }.
export async function getSalesSummary(period) {
  const response = await api.get(SALES_REPORT_ENDPOINT, { params: { period } })
  return response.data
}

// Nombre de respaldo con la fecha por si el backend no lo envía.
export function buildFallbackFileName(period, today = new Date()) {
  const isoDate = today.toISOString().slice(0, 10)
  return `resumen-ventas-${period}-${isoDate}.pdf`
}

// Lee el nombre del archivo de la cabecera Content-Disposition.
export function getFileName(contentDisposition, period) {
  const match = contentDisposition?.match(FILE_NAME_PATTERN)
  return match ? match[1] : buildFallbackFileName(period)
}

// Pide el PDF como archivo (blob) y devuelve también su nombre.
export async function getSalesReportPdf(period) {
  const response = await api.get(SALES_REPORT_PDF_ENDPOINT, {
    params: { period },
    responseType: 'blob',
  })

  return {
    blob: response.data,
    fileName: getFileName(response.headers['content-disposition'], period),
  }
}