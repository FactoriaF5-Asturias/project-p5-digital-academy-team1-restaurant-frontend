import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useExclusiveOffersStore } from './exclusiveOffers'
import { getExclusiveOffers } from '../services/exclusiveOffers.service'

vi.mock('../services/exclusiveOffers.service', () => ({
  getExclusiveOffers: vi.fn(),
}))

function buildOffer(overrides = {}) {
  return {
    id: 'offer-a',
    productId: 1,
    productName: 'Hello Edamame',
    discountPercentage: 15,
    originalPrice: 10,
    finalPrice: 8.5,
    couponCode: 'test-coupon',
    used: false,
    expiresAt: null,
    ...overrides,
  }
}

describe('useExclusiveOffersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()

    getExclusiveOffers.mockResolvedValue({
      offers: [],
    })
  })

  it('starts empty', () => {
    const store = useExclusiveOffersStore()

    expect(store.offers).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('keeps offers without expiry and excludes expired offers', () => {
    const store = useExclusiveOffersStore()

    store.offers = [
      buildOffer({ id: 'a' }),
      buildOffer({
        id: 'b',
        expiresAt: '2099-01-01T00:00:00',
      }),
      buildOffer({
        id: 'c',
        expiresAt: '2000-01-01T00:00:00',
      }),
    ]

    expect(store.activeOffers.map((offer) => offer.id)).toEqual([
      'a',
      'b',
    ])
  })

  it('excludes used offers even when they have not expired', () => {
    const store = useExclusiveOffersStore()

    store.offers = [
      buildOffer({ id: 'available' }),
      buildOffer({
        id: 'used',
        used: true,
      }),
    ]

    expect(store.activeOffers.map((offer) => offer.id)).toEqual([
      'available',
    ])
  })

  it('returns the active offer for a product with its backend price', () => {
    const store = useExclusiveOffersStore()
    const offer = buildOffer()

    store.offers = [offer]

    expect(store.offerForProduct(1)).toEqual(offer)
    expect(store.offerForProduct(1).finalPrice).toBe(8.5)
  })

  it('returns null when the product has no offer', () => {
    const store = useExclusiveOffersStore()

    store.offers = [buildOffer()]

    expect(store.offerForProduct(999)).toBeNull()
  })

  it('returns null when the product offer has expired', () => {
    const store = useExclusiveOffersStore()

    store.offers = [
      buildOffer({
        expiresAt: '2000-01-01T00:00:00',
      }),
    ]

    expect(store.offerForProduct(1)).toBeNull()
  })

  it('returns null when the product offer has been used', () => {
    const store = useExclusiveOffersStore()

    store.offers = [
      buildOffer({
        used: true,
      }),
    ]

    expect(store.offerForProduct(1)).toBeNull()
  })

  it('finds an unused offer when another offer for the same product is used', () => {
    const store = useExclusiveOffersStore()
    const availableOffer = buildOffer({ id: 'available' })

    store.offers = [
      buildOffer({
        id: 'used',
        used: true,
      }),
      availableOffer,
    ]

    expect(store.offerForProduct(1)).toEqual(availableOffer)
  })

  it('sets loading while fetching and clears it afterwards', async () => {
    const store = useExclusiveOffersStore()

    const promise = store.fetchOffers()

    expect(store.isLoading).toBe(true)

    await promise

    expect(store.isLoading).toBe(false)
    expect(getExclusiveOffers).toHaveBeenCalledTimes(1)
  })

  it('stores fetched offers without changing their prices', async () => {
    const fetchedOffers = [buildOffer()]

    getExclusiveOffers.mockResolvedValue({
      offers: fetchedOffers,
    })

    const store = useExclusiveOffersStore()

    await store.fetchOffers()

    expect(store.offers).toEqual(fetchedOffers)
    expect(store.offers[0].finalPrice).toBe(8.5)
    expect(store.error).toBeNull()
  })

  it('clears previous offers and shows an error when fetching fails', async () => {
    getExclusiveOffers.mockRejectedValue(
      new Error('Network error'),
    )

    const store = useExclusiveOffersStore()
    store.offers = [buildOffer()]

    await store.fetchOffers()

    expect(store.error).toBe(
      'No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.',
    )
    expect(store.offers).toEqual([])
    expect(store.isLoading).toBe(false)
  })

  it('allows retrying after a failed request', async () => {
    const fetchedOffers = [buildOffer()]

    getExclusiveOffers
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        offers: fetchedOffers,
      })

    const store = useExclusiveOffersStore()

    await store.fetchOffers()

    expect(store.error).not.toBeNull()

    await store.fetchOffers()

    expect(store.error).toBeNull()
    expect(store.offers).toEqual(fetchedOffers)
    expect(store.isLoading).toBe(false)
  })

  it('prevents duplicate requests while loading', async () => {
    let resolveRequest

    getExclusiveOffers.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const store = useExclusiveOffersStore()

    const firstRequest = store.fetchOffers()
    await store.fetchOffers()

    expect(getExclusiveOffers).toHaveBeenCalledTimes(1)
    expect(store.isLoading).toBe(true)

    resolveRequest({
      offers: [buildOffer()],
    })

    await firstRequest

    expect(store.isLoading).toBe(false)
    expect(store.offers).toHaveLength(1)
  })
})