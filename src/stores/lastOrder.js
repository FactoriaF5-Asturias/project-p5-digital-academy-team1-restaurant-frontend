import { defineStore } from "pinia";

// Responsabilidad: recordar el último pedido confirmado contra el backend.
// `order` es la respuesta completa de createOrder y solo vive en memoria.
// `ticketReference` ({ id, token }) se guarda además en localStorage para que
// Mi pedido pueda pedir el ticket real aunque se recargue la página o se
// vuelva de Stripe. Caduca a las pocas horas para que, en las tablets de sala,
// el siguiente cliente no vea el pedido de la mesa anterior.

const LAST_ORDER_STORAGE_KEY = "gitsushi-last-order";
export const LAST_ORDER_MAX_AGE_MS = 3 * 60 * 60 * 1000;

function removeStoredReference() {
  try {
    localStorage.removeItem(LAST_ORDER_STORAGE_KEY);
  } catch (err) {
    console.error("[lastOrder] Error clearing stored order:", err);
  }
}

function loadStoredReference() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return null;

    const { id, token, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > LAST_ORDER_MAX_AGE_MS) {
      removeStoredReference();
      return null;
    }
    return { id, token };
  } catch (err) {
    console.error("[lastOrder] Error reading stored order:", err);
    return null;
  }
}

export const useLastOrderStore = defineStore("lastOrder", {
  state: () => ({
    order: null,
    ticketReference: loadStoredReference(),
  }),
  actions: {
    setOrder(order) {
      this.order = order;
      this.ticketReference = { id: order.id, token: order.ticketAccessToken ?? null };
      try {
        localStorage.setItem(
          LAST_ORDER_STORAGE_KEY,
          JSON.stringify({ ...this.ticketReference, savedAt: Date.now() })
        );
      } catch (err) {
        console.error("[lastOrder] Error saving order:", err);
      }
    },
    clearOrder() {
      this.order = null;
      this.ticketReference = null;
      removeStoredReference();
    },
  },
});