import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePaidInvoices } from './usePaidInvoices'
import { getPaidInvoices } from '../services/invoices.service'

vi.mock('../services/invoices.service', () => ({
  getPaidInvoices: vi.fn(),
}))

const PAGE = { items: [{ id: 1 }, { id: 2 }], totalPages: 3 }

describe('usePaidInvoices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getPaidInvoices.mockResolvedValue(PAGE)
  })

  it('carga la primera página sin búsqueda', async () => {
    const { invoices, totalPages, currentPage, loadInvoices } = usePaidInvoices()

    await loadInvoices()

    expect(getPaidInvoices).toHaveBeenCalledWith({ page: 1, search: '' })
    expect(invoices.value).toEqual(PAGE.items)
    expect(totalPages.value).toBe(3)
    expect(currentPage.value).toBe(1)
  })

  it('marca la carga mientras espera al backend', async () => {
    const { isLoading, loadInvoices } = usePaidInvoices()

    const request = loadInvoices()
    expect(isLoading.value).toBe(true)

    await request
    expect(isLoading.value).toBe(false)
  })

  it('muestra un mensaje de error y vacía la tabla si el backend falla', async () => {
    getPaidInvoices.mockRejectedValue(new Error('500'))
    const { invoices, totalPages, loadError, loadInvoices } = usePaidInvoices()

    await loadInvoices()

    expect(loadError.value).toBe('No se han podido cargar las facturas. Inténtalo de nuevo más tarde.')
    expect(invoices.value).toEqual([])
    expect(totalPages.value).toBe(0)
  })

  it('cambia de página y vuelve a pedir los datos', async () => {
    const { currentPage, loadInvoices, goToPage } = usePaidInvoices()
    await loadInvoices()

    await goToPage(2)

    expect(currentPage.value).toBe(2)
    expect(getPaidInvoices).toHaveBeenLastCalledWith({ page: 2, search: '' })
  })

  it('no sale de los límites de páginas', async () => {
    const { currentPage, loadInvoices, goToPage } = usePaidInvoices()
    await loadInvoices()

    goToPage(0)
    goToPage(4)

    expect(currentPage.value).toBe(1)
    expect(getPaidInvoices).toHaveBeenCalledTimes(1)
  })

  it('una búsqueda nueva vuelve a la primera página', async () => {
    const { currentPage, searchTerm, loadInvoices, goToPage, search } = usePaidInvoices()
    await loadInvoices()
    await goToPage(3)

    await search('Mesa 4')

    expect(searchTerm.value).toBe('Mesa 4')
    expect(currentPage.value).toBe(1)
    expect(getPaidInvoices).toHaveBeenLastCalledWith({ page: 1, search: 'Mesa 4' })
  })

  it('al refrescar mantiene las facturas en pantalla sin mostrar "cargando"', async () => {
    const { isLoading, invoices, loadInvoices } = usePaidInvoices()
    await loadInvoices()

    const refreshing = loadInvoices()

    expect(isLoading.value).toBe(false)
    expect(invoices.value).toEqual(PAGE.items)
    await refreshing
  })
})
