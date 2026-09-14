import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from './cart'

const productA = { id: 1, name: 'Salmon Roll', price: 10 }
const productB = { id: 2, name: 'Dragon Roll', price: 12.5 }

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    const cartStore = useCartStore()

    expect(cartStore.items).toEqual([])
    expect(cartStore.isEmpty).toBe(true)
    expect(cartStore.itemCount).toBe(0)
    expect(cartStore.subtotal).toBe(0)
    expect(cartStore.taxAmount).toBe(0)
    expect(cartStore.total).toBe(0)
  })

  it('adds a new product with quantity 1', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)

    expect(cartStore.items).toEqual([{ product: productA, quantity: 1 }])
    expect(cartStore.isEmpty).toBe(false)
  })

  it('increments the quantity when the product already exists', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)
    cartStore.addProduct(productA)

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].quantity).toBe(2)
  })

  it('calculates unitPrice and subtotal per line', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)

    expect(cartStore.lines).toEqual([
      { product: productA, quantity: 2, unitPrice: 10, subtotal: 20 },
    ])
  })

  it('calculates subtotal, IVA and total across multiple lines', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)
    cartStore.addProduct(productB)
    cartStore.incrementQuantity(productA.id)

    // 2 * 10 + 1 * 12.5 = 32.5
    expect(cartStore.subtotal).toBeCloseTo(32.5)
    expect(cartStore.taxAmount).toBeCloseTo(3.25)
    expect(cartStore.total).toBeCloseTo(35.75)
  })

  it('decreases the quantity without removing the line when above 1', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)
    cartStore.decrementQuantity(productA.id)

    expect(cartStore.items[0].quantity).toBe(1)
  })

  it('removes the line when its quantity reaches 0', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)
    cartStore.decrementQuantity(productA.id)

    expect(cartStore.items).toEqual([])
    expect(cartStore.isEmpty).toBe(true)
  })

  it('removes a product explicitly regardless of its quantity', () => {
    const cartStore = useCartStore()

    cartStore.addProduct(productA)
    cartStore.incrementQuantity(productA.id)
    cartStore.removeProduct(productA.id)

    expect(cartStore.items).toEqual([])
  })

  it('does nothing when incrementing, decrementing or removing a product that is not in the cart', () => {
    const cartStore = useCartStore()

    cartStore.incrementQuantity(999)
    cartStore.decrementQuantity(999)
    cartStore.removeProduct(999)

    expect(cartStore.items).toEqual([])
  })
})
