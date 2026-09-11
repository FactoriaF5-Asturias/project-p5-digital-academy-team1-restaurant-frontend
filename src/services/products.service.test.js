import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProducts } from './products.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}))

function buildSpringPage(overrides = {}) {
  return {
    content: [{ id: 1, name: 'Salmon Roll' }],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 12,
    first: true,
    last: true,
    ...overrides,
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
      data: buildSpringPage({ totalElements: 25, totalPages: 3, first: true, last: false }),
    })

    const result = await getProducts()

    expect(result).toEqual({
      items: [{ id: 1, name: 'Salmon Roll' }],
      page: 1,
      size: 12,
      totalItems: 25,
      totalPages: 3,
      isFirstPage: true,
      isLastPage: false,
    })
  })
})
