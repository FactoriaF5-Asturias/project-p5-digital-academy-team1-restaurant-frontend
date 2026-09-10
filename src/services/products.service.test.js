// src/services/products.service.test.js
import { describe, it, expect } from 'vitest'
import { getProducts } from './products.service'
import { mockProducts } from '../mocks/products.mock'

describe('products.service', () => {
  it('returns only products marked as active', async () => {
    const products = await getProducts()

    expect(products.every((product) => product.active)).toBe(true)
  })

  it('excludes deactivated products from the result', async () => {
    const products = await getProducts()
    const inactiveIds = mockProducts.filter((p) => !p.active).map((p) => p.id)

    const hasInactiveProduct = products.some((product) => inactiveIds.includes(product.id))
    expect(hasInactiveProduct).toBe(false)
  })
})
