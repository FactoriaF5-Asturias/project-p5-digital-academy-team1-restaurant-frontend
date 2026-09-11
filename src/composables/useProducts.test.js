import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProducts } from './useProducts'
import * as productsService from '../services/products.service'

describe('useProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue({
      items: [], page: 1, size: 12, totalItems: 0, totalPages: 1, isFirstPage: true, isLastPage: true,
    })
    const { isLoading, fetchProducts } = useProducts()

    const promise = fetchProducts()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores the fetched products and pagination state on success', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue({
      items: [{ id: 1, name: 'Salmon Roll' }],
      page: 2,
      size: 12,
      totalItems: 25,
      totalPages: 3,
      isFirstPage: false,
      isLastPage: false,
    })
    const { products, currentPage, totalPages, totalItems, fetchProducts } = useProducts()

    await fetchProducts(2)

    expect(products.value).toEqual([{ id: 1, name: 'Salmon Roll' }])
    expect(currentPage.value).toBe(2)
    expect(totalPages.value).toBe(3)
    expect(totalItems.value).toBe(25)
  })

  it('stores an error message when the request fails', async () => {
    vi.spyOn(productsService, 'getProducts').mockRejectedValue(new Error('network error'))
    const { error, fetchProducts } = useProducts()

    await fetchProducts()

    expect(error.value).toBe('No se ha podido cargar la carta. Inténtalo de nuevo más tarde.')
  })

  it('does not fetch when the requested page is out of range', async () => {
    const spy = vi.spyOn(productsService, 'getProducts').mockResolvedValue({
      items: [], page: 1, size: 12, totalItems: 0, totalPages: 3, isFirstPage: true, isLastPage: false,
    })
    const { fetchProducts, goToPage, totalPages } = useProducts()
    await fetchProducts()
    spy.mockClear()

    goToPage(0)
    goToPage(totalPages.value + 1)

    expect(spy).not.toHaveBeenCalled()
  })
})
