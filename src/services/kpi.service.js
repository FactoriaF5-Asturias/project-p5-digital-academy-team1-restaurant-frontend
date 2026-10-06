import api from './api'

// Endpoint de KPI de ventas (backend GS-92, de José Luis).
const SALES_KPI_ENDPOINT = '/api/v1/kpi/sales'

// Devuelve { today, month, quarter, year, channels, weekly, peakDay }.
export async function getSalesKpi() {
  const response = await api.get(SALES_KPI_ENDPOINT)
  return response.data
}