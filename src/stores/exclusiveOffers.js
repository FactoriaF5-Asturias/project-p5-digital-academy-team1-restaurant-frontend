import { defineStore } from 'pinia'
import {
  getExclusiveOffers,
  consumeOffer as requestConsumeOffer,
} from '../services/offers.service'

export const useExclusiveOffersStore = defineStore('exclusiveOffers', {
  state: () => ({
    offers: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    activeOffers: (state) => {
      return state.offers.filter((offer) => !offer.used)
    },

    offerForProduct: (state) => (productId) => {
      return (
        state.offers.find(
          (offer) =>
            offer.product?.id === productId && !offer.used,
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
        this.offers = await getExclusiveOffers()
      } catch {
        this.offers = []
        this.error =
          'No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.'
      } finally {
        this.isLoading = false
      }
    },

    async consumeOffer(coupon) {
      try {
        const updatedOffer = await requestConsumeOffer(coupon)

        const index = this.offers.findIndex(
          (offer) => offer.coupon === coupon,
        )

        if (index !== -1) {
          this.offers[index] = updatedOffer
        }
      } catch (error) {
        console.error(
          '[exclusiveOffers] Error al consumir la oferta:',
          error,
        )
      }
    },
  },
})