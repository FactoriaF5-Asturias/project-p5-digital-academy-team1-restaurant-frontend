import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useExclusiveOffersStore } from './exclusiveOffers'
import {
  getExclusiveOffers,
  consumeOffer,
} from '../services/offers.service'

vi.mock('../services/offers.service', () => ({
  getExclusiveOffers: vi.fn(),
  consumeOffer: vi.fn(),
}))

function buildOffer(overrides = {}) {
  return {
    id: 1,
    product: {
      id: 1,
      name: 'Hello Edamame',
    },
    discountRate: 15,
    originalPrice: 10,
    finalPrice: 8.5,
    coupon: 'coupon-a',
    used: false,
    ...overrides,
  }
}

describe('useExclusiveOffersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()

    getExclusiveOffers.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts empty', () => {
    const store = useExclusiveOffersStore()

    expect(store.offers).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('excludes used offers from active offers', () => {
    const store = useExclusiveOffersStore()

    store.offers = [
      buildOffer({ id: 1 }),
      buildOffer({ id: 2 }),
      buildOffer({ id: 3, used: true }),
    ]

    expect(store.activeOffers.map((offer) => offer.id)).toEqual([
      1,
      2,
    ])
  })

  it('returns the active product offer with its backend price', () => {
    const store = useExclusiveOffersStore()
    const offer = buildOffer()

    store.offers = [offer]

    expect(store.offerForProduct(1)).toEqual(offer)
    expect(store.offerForProduct(1).finalPrice).toBe(8.5)
  })

  it('returns null when a product has no offer', () => {
    const store = useExclusiveOffersStore()

    store.offers = [buildOffer()]

    expect(store.offerForProduct(999)).toBeNull()
  })

  it('returns null when the product offer has been used', () => {
    const store = useExclusiveOffersStore()

    store.offers = [
      buildOffer({ used: true }),
    ]

    expect(store.offerForProduct(1)).toBeNull()
  })

  it('finds an unused offer when another offer for the product is used', () => {
    const store = useExclusiveOffersStore()
    const availableOffer = buildOffer({ id: 2 })

    store.offers = [
      buildOffer({ id: 1, used: true }),
      availableOffer,
    ]

    expect(store.offerForProduct(1)).toEqual(availableOffer)
  })

  it('sets loading during fetching and clears it afterwards', async () => {
    const store = useExclusiveOffersStore()

    const promise = store.fetchOffers()

    expect(store.isLoading).toBe(true)

    await promise

    expect(store.isLoading).toBe(false)
    expect(getExclusiveOffers).toHaveBeenCalledTimes(1)
  })

  it('stores fetched offers without changing their prices', async () => {
    const fetchedOffers = [buildOffer()]

    getExclusiveOffers.mockResolvedValue(fetchedOffers)

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
      .mockResolvedValueOnce(fetchedOffers)

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

    resolveRequest([buildOffer()])

    await firstRequest

    expect(store.isLoading).toBe(false)
    expect(store.offers).toHaveLength(1)
  })

  it('replaces the consumed offer and removes it from active offers', async () => {
    const updatedOffer = buildOffer({ used: true })

    consumeOffer.mockResolvedValue(updatedOffer)

    const store = useExclusiveOffersStore()
    store.offers = [buildOffer()]

    await store.consumeOffer('coupon-a')

    expect(consumeOffer).toHaveBeenCalledWith('coupon-a')
    expect(store.offers[0]).toEqual(updatedOffer)
    expect(store.activeOffers).toEqual([])
    expect(store.offerForProduct(1)).toBeNull()
  })

  it('preserves other offers when consuming one', async () => {
    const otherOffer = buildOffer({
      id: 2,
      coupon: 'coupon-b',
      product: {
        id: 2,
        name: 'Kaisen Init',
      },
    })

    consumeOffer.mockResolvedValue(
      buildOffer({ used: true }),
    )

    const store = useExclusiveOffersStore()
    store.offers = [buildOffer(), otherOffer]

    await store.consumeOffer('coupon-a')

    expect(store.offers[1]).toEqual(otherOffer)
    expect(store.activeOffers).toEqual([otherOffer])
  })

  it('does not throw or change offers when consuming fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    consumeOffer.mockRejectedValue(
      new Error('Network error'),
    )

    const store = useExclusiveOffersStore()
    const originalOffer = buildOffer()
    store.offers = [originalOffer]

    await expect(
      store.consumeOffer('coupon-a'),
    ).resolves.toBeUndefined()

    expect(store.offers[0]).toEqual(originalOffer)
    expect(store.activeOffers).toEqual([originalOffer])
  })
})