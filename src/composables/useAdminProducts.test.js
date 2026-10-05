import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdminProducts } from './useAdminProducts'
import { getAdminProducts, createProduct, updateProduct } from '../services/products.service'

vi.mock('../services/products.service', () => ({
  getAdminProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}))

function buildProduct(overrides = {}) {
  return { id: 1, name: 'React Roll', available: true, ...overrides }
}

describe('useAdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('loadProducts', () => {
    it('loads the products from the service', async () => {
      getAdminProducts.mockResolvedValue([buildProduct()])
      const { products, isLoading, loadError, loadProducts } = useAdminProducts()

      await loadProducts()

      expect(products.value).toEqual([buildProduct()])
      expect(isLoading.value).toBe(false)
      expect(loadError.value).toBe('')
    })

    it('marks isLoading while the request is in progress', async () => {
      let resolveRequest
      getAdminProducts.mockReturnValue(new Promise((resolve) => (resolveRequest = resolve)))
      const { isLoading, loadProducts } = useAdminProducts()

      const loading = loadProducts()
      expect(isLoading.value).toBe(true)

      resolveRequest([])
      await loading
      expect(isLoading.value).toBe(false)
    })

    it('shows an error message and keeps the list empty when the request fails', async () => {
      getAdminProducts.mockRejectedValue(new Error('403'))
      const { products, isLoading, loadError, loadProducts } = useAdminProducts()

      await loadProducts()

      expect(products.value).toEqual([])
      expect(isLoading.value).toBe(false)
      expect(loadError.value).toBe('No se han podido cargar los productos. Inténtalo de nuevo más tarde.')
    })
  })

  describe('addProduct', () => {
    it('sends the product with the default values and adds the created one to the list', async () => {
      const formData = { name: 'Merge Nigiri', price: 6.5 }
      const createdProduct = buildProduct({ id: 61, ...formData })
      createProduct.mockResolvedValue(createdProduct)
      const { products, addProduct } = useAdminProducts()

      await addProduct(formData)

      expect(createProduct).toHaveBeenCalledWith({
        ...formData,
        discount: 0,
        available: true,
        exclusive: false,
      })
      expect(products.value).toEqual([createdProduct])
    })

    it('throws the error and does not add anything when the backend fails', async () => {
      createProduct.mockRejectedValue(new Error('409'))
      const { products, addProduct } = useAdminProducts()

      await expect(addProduct({ name: 'X' })).rejects.toThrow('409')
      expect(products.value).toEqual([])
    })
  })

  describe('editProduct', () => {
    it('sends the changes and updates the product with the backend response', async () => {
      const product = buildProduct({ price: 5 })
      updateProduct.mockResolvedValue({ ...product, price: 7.5 })
      const { editProduct } = useAdminProducts()

      await editProduct(product, { price: 7.5 })

      expect(updateProduct).toHaveBeenCalledWith(1, { price: 7.5 })
      expect(product.price).toBe(7.5)
    })

    it('throws the error and keeps the product unchanged when the backend fails', async () => {
      const product = buildProduct({ price: 5 })
      updateProduct.mockRejectedValue(new Error('500'))
      const { editProduct } = useAdminProducts()

      await expect(editProduct(product, { price: 7.5 })).rejects.toThrow('500')
      expect(product.price).toBe(5)
    })
  })

  describe('toggleAvailability', () => {
    it('sends the opposite availability and applies the backend response', async () => {
      const product = buildProduct({ available: true })
      updateProduct.mockResolvedValue({ ...product, available: false })
      const { toggleAvailability } = useAdminProducts()

      await toggleAvailability(product)

      expect(updateProduct).toHaveBeenCalledWith(1, { available: false })
      expect(product.available).toBe(false)
    })
  })

  describe('removeProduct', () => {
    it('removes the product from the list', async () => {
      getAdminProducts.mockResolvedValue([buildProduct({ id: 1 }), buildProduct({ id: 2 })])
      const { products, loadProducts, removeProduct } = useAdminProducts()
      await loadProducts()

      removeProduct(1)

      expect(products.value.map((product) => product.id)).toEqual([2])
    })
  })
})