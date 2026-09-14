import { defineStore } from "pinia";
import { TAX_RATE } from "../constants/tax";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
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
    },

    incrementQuantity(productId) {
      const item = this.items.find((item) => item.product.id === productId);
      if (item) {
        item.quantity += 1;
      }
    },

    decrementQuantity(productId) {
      const item = this.items.find((item) => item.product.id === productId);
      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        this.removeProduct(productId);
      }
    },

    removeProduct(productId) {
      this.items = this.items.filter((item) => item.product.id !== productId);
    },
  },
});
