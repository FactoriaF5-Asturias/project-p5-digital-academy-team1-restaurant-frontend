import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
  ADMIN_PAGE_SIZE,
} from './products.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

function buildSpringPage(overrides = {}) {
  return {
    content: [{ id: 1, name: 'Salmon Roll' }],
    page: {
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 12,
      ...overrides,
    },
  }
}

describe('products.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests the real products endpoint with default pagination params', async () => {
    api.get.mockResolvedValue({ data: buildSpringPage() })

    await getProducts()

    expect(api.get).toHaveBeenCalledWith('/api/v1/products', {
      params: { page: 0, size: 12 },
    })
  })

  it('converts the 1-indexed page argument to Spring 0-indexed page', async () => {
    api.get.mockResolvedValue({ data: buildSpringPage({ number: 2 }) })

    await getProducts({ page: 3 })

    expect(api.get).toHaveBeenCalledWith('/api/v1/products', {
      params: { page: 2, size: 12 },
    })
  })

  it('includes the category param only when a category is provided', async () => {
    api.get.mockResolvedValue({ data: buildSpringPage() })

    await getProducts({ category: 'NIGIRI' })

    expect(api.get).toHaveBeenCalledWith('/api/v1/products', {
      params: { page: 0, size: 12, category: 'NIGIRI' },
    })
  })

  it('maps the Spring Page response into the shape used by the app', async () => {
    api.get.mockResolvedValue({
      data: buildSpringPage({ totalElements: 25, totalPages: 3 }),
    })

    const result = await getProducts()

    expect(result).toEqual({
      items: [{ id: 1, name: 'Salmon Roll' }],
      page: 1,
      size: 12,
      totalItems: 25,
      totalPages: 3,
    })
  })

  describe('admin products', () => {
    it('getAdminProducts requests the administration endpoint in one big page and returns the list', async () => {
      api.get.mockResolvedValue({ data: buildSpringPage() })

      const result = await getAdminProducts()

      expect(api.get).toHaveBeenCalledWith('/api/v1/products/administration', {
        params: { page: 0, size: ADMIN_PAGE_SIZE },
      })
      expect(result).toEqual([{ id: 1, name: 'Salmon Roll' }])
    })

    it('createProduct posts the new product and returns the one created by the backend', async () => {
      const newProduct = { name: 'Merge Nigiri', price: 6.5 }
      api.post.mockResolvedValue({ data: { id: 61, ...newProduct } })

      const result = await createProduct(newProduct)

      expect(api.post).toHaveBeenCalledWith('/api/v1/products', newProduct)
      expect(result).toEqual({ id: 61, ...newProduct })
    })

    it('updateProduct patches only the given changes and returns the updated product', async () => {
      api.patch.mockResolvedValue({ data: { id: 7, available: false } })

      const result = await updateProduct(7, { available: false })

      expect(api.patch).toHaveBeenCalledWith('/api/v1/products/7', { available: false })
      expect(result).toEqual({ id: 7, available: false })
    })

    it('propagates the error when the backend call fails', async () => {
      api.post.mockRejectedValue(new Error('Network error'))

      await expect(createProduct({ name: 'X' })).rejects.toThrow('Network error')
    })
  })
})