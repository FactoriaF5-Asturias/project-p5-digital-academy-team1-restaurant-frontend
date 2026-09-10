import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart' , {
    state: () => ({
        items: [],
    }),
    getters: {
        itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    },
})