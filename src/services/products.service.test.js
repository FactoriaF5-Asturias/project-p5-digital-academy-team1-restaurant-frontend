// src/services/products.service.test.js
import { describe, it, expect } from 'vitest'
import { getProducts } from './products.service'
import { mockProducts } from '../mocks/products.mock'

describe('products.service', () => {
  it('returns only products marked as active', async () => {
    const { items } = await getProducts({ page: 1, size: 20 })

    expect(items.every((product) => product.active)).toBe(true)
  })

  it('excludes deactivated products from the result', async () => {
    const { items } = await getProducts({ page: 1, size: 20 })
    const inactiveIds = mockProducts.filter((p) => !p.active).map((p) => p.id)

    const hasInactiveProduct = items.some((product) => inactiveIds.includes(product.id))
    expect(hasInactiveProduct).toBe(false)
  })

  it('limits the number of items to the given page size', async () => {
    const { items } = await getProducts({ page: 1, size: 5 })

    expect(items).toHaveLength(5)
  })

  it('returns the second page starting right after the first one', async () => {
    const firstPage = await getProducts({ page: 1, size: 5 })
    const secondPage = await getProducts({ page: 2, size: 5 })

    expect(secondPage.items[0].id).not.toBe(firstPage.items[0].id)
  })

  it('calculates the total number of pages from the total and the size', async () => {
    const { total, totalPages, size } = await getProducts({ page: 1, size: 5 })

    expect(totalPages).toBe(Math.ceil(total / size))
  })
})
