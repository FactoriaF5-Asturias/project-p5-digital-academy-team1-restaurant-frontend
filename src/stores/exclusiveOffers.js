import { defineStore } from "pinia";
import { getExclusiveOffers } from "../mocks/exclusiveOffers.mock";

// Determina si una oferta ya ha caducado. Sin fecha de caducidad, nunca caduca.
function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export const useExclusiveOffersStore = defineStore("exclusiveOffers", {
  state: () => ({
    offers: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    activeOffers: (state) => state.offers.filter((offer) => !isExpired(offer.expiresAt)),

    // Devuelve la oferta activa completa de un producto (con su finalPrice ya
    // calculado por el backend), o null si no tiene ninguna oferta activa.
    offerForProduct: (state) => (productId) => {
      return (
        state.offers.find((o) => o.productId === productId && !isExpired(o.expiresAt)) ?? null
      );
    },
  },
  actions: {
    async fetchOffers() {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await getExclusiveOffers();
        this.offers = result.offers;
      } catch (err) {
        this.error = "No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.";
        console.error("[exclusiveOffers] Error al obtener las ofertas:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
