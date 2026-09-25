import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useExclusiveOffersStore } from './exclusiveOffers'
import * as exclusiveOffersMock from '../mocks/exclusiveOffers.mock'

describe('useExclusiveOffersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('starts empty', () => {
    const offersStore = useExclusiveOffersStore()

    expect(offersStore.offers).toEqual([])
    expect(offersStore.isLoading).toBe(false)
    expect(offersStore.error).toBeNull()
  })

  it('activeOffers excludes expired offers and keeps offers without expiry', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [
      { id: 'a', productId: 1, discountPercentage: 10, expiresAt: null },
      { id: 'b', productId: 2, discountPercentage: 20, expiresAt: '2099-01-01T00:00:00' },
      { id: 'c', productId: 3, discountPercentage: 30, expiresAt: '2000-01-01T00:00:00' },
    ]

    expect(offersStore.activeOffers.map((offer) => offer.id)).toEqual(['a', 'b'])
  })

  it('discountForProduct returns the discount of an active offer for that product', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [{ id: 'a', productId: 1, discountPercentage: 15, expiresAt: null }]

    expect(offersStore.discountForProduct(1)).toBe(15)
  })

  it('discountForProduct returns 0 when there is no offer for that product', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [{ id: 'a', productId: 1, discountPercentage: 15, expiresAt: null }]

    expect(offersStore.discountForProduct(999)).toBe(0)
  })

  it('discountForProduct returns 0 when the only offer for that product has expired', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [{ id: 'a', productId: 1, discountPercentage: 15, expiresAt: '2000-01-01T00:00:00' }]

    expect(offersStore.discountForProduct(1)).toBe(0)
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({ offers: [] })
    const offersStore = useExclusiveOffersStore()

    const promise = offersStore.fetchOffers()
    expect(offersStore.isLoading).toBe(true)

    await promise
    expect(offersStore.isLoading).toBe(false)
  })

  it('stores the fetched offers on success', async () => {
    const fetchedOffers = [{ id: 'a', productId: 1, discountPercentage: 15, expiresAt: null }]
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockResolvedValue({ offers: fetchedOffers })
    const offersStore = useExclusiveOffersStore()

    await offersStore.fetchOffers()

    expect(offersStore.offers).toEqual(fetchedOffers)
    expect(offersStore.error).toBeNull()
  })

  it('stores an error message when the fetch fails', async () => {
    vi.spyOn(exclusiveOffersMock, 'getExclusiveOffers').mockRejectedValue(new Error('network error'))
    const offersStore = useExclusiveOffersStore()

    await offersStore.fetchOffers()

    expect(offersStore.error).toBe(
      'No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.',
    )
    expect(offersStore.offers).toEqual([])
    expect(offersStore.isLoading).toBe(false)
  })
})
