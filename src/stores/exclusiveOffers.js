import { defineStore } from 'pinia'
import { getExclusiveOffers } from '../services/exclusiveOffers.service'

function isExpired(expiresAt) {
  if (!expiresAt) return false

  return new Date(expiresAt).getTime() < Date.now()
}

function isActiveOffer(offer) {
  return !offer.used && !isExpired(offer.expiresAt)
}

export const useExclusiveOffersStore = defineStore('exclusiveOffers', {
  state: () => ({
    offers: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    activeOffers: (state) => state.offers.filter(isActiveOffer),

    offerForProduct: (state) => (productId) => {
      return (
        state.offers.find(
          (offer) =>
            offer.productId === productId && isActiveOffer(offer),
        ) ?? null
      )
    },
  },

  actions: {
    async fetchOffers() {
      if (this.isLoading) return

      this.isLoading = true
      this.error = null

      try {
        const result = await getExclusiveOffers()

        this.offers = result.offers
      } catch {
        this.offers = []
        this.error =
          'No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.'
      } finally {
        this.isLoading = false
      }
    },
  },
})