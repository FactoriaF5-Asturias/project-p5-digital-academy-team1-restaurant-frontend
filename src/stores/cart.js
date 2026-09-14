// src/stores/cart.js
import { defineStore } from "pinia";
import { TAX_RATE } from "../constants/tax";

const CART_STORAGE_KEY = "gitsushi-cart-items";

function loadStoredItems() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[cart] Error reading stored cart:", err);
    return [];
  }
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: loadStoredItems(),
  }),
  getters: {
    itemCount: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    isEmpty: (state) => state.items.length === 0,

    lines: (state) =>
      state.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.product.price * item.quantity,
      })),

    subtotal() {
      return this.lines.reduce((total, line) => total + line.subtotal, 0);
    },

    taxAmount() {
      return this.subtotal * TAX_RATE;
    },

    total() {
      return this.subtotal + this.taxAmount;
    },
  },
  actions: {
    addProduct(product) {
      const existingItem = this.items.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({ product, quantity: 1 });
      }

      this.persist();
    },

    incrementQuantity(productId) {
      const item = this.items.find((item) => item.product.id === productId);
      if (item) {
        item.quantity += 1;
        this.persist();
      }
    },

    decrementQuantity(productId) {
      const item = this.items.find((item) => item.product.id === productId);
      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
        this.persist();
      } else {
        this.removeProduct(productId);
      }
    },

    removeProduct(productId) {
      this.items = this.items.filter((item) => item.product.id !== productId);
      this.persist();
    },

    clearCart() {
      this.items = [];
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (err) {
        console.error("[cart] Error clearing stored cart:", err);
      }
    },

    persist() {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      } catch (err) {
        console.error("[cart] Error saving cart:", err);
      }
    },
  },
});
