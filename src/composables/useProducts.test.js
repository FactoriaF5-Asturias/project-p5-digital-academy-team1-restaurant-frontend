// src/composables/useProducts.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProducts } from './useProducts'
import * as productsService from '../services/products.service'

describe('useProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(productsService, 'getProducts').mockResolvedValue([])
    const { isLoading, fetchProducts } = useProducts()

    const promise = fetchProducts()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores the received products on success', async () => {
    const fakeProducts = [{ id: 1, name: 'Test' }]
    vi.spyOn(productsService, 'getProducts').mockResolvedValue(fakeProducts)

    const { products, fetchProducts } = useProducts()
    await fetchProducts()

    expect(products.value).toEqual(fakeProducts)
  })

  it('stores an error message when the request fails', async () => {
    vi.spyOn(productsService, 'getProducts').mockRejectedValue(new Error('network error'))

    const { error, fetchProducts } = useProducts()
    await fetchProducts()

    expect(error.value).toBe('No se ha podido cargar la carta. Inténtalo de nuevo más tarde.')
  })
})
