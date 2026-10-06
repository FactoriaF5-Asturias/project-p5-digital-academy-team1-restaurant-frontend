import api from './api'

// Endpoint de facturación de pedidos pagados (backend GS-49, de José Luis).
const INVOICES_ENDPOINT = '/api/v1/facturation'
export const INVOICES_PAGE_SIZE = 5

// Pide una página de facturas. `page` empieza en 1 en el front y en 0 en Spring.
// `search` filtra por ID de factura, mesa o cliente; si va vacío no se envía.
// El backend pagina con VIA_DTO: { content: [...], page: { totalPages, ... } }.
export async function getPaidInvoices({ page = 1, size = INVOICES_PAGE_SIZE, search = '' } = {}) {
  const trimmedSearch = search.trim()

  const response = await api.get(INVOICES_ENDPOINT, {
    params: {
      page: page - 1,
      size,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
    },
  })

  return {
    items: response.data.content,
    totalPages: response.data.page.totalPages,
  }
}