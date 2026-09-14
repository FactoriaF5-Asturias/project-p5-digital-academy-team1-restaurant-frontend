import { defineStore } from "pinia";

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    channel: "sala",
    tableNumber: null,
    isTableAutoDetected: false,
    address: null,
    paymentMethod: null,
    chefNote: '',
  }),
  actions: {
    setChannel(channel) {
      if (this.channel === channel) return;

      this.channel = channel;
      this.paymentMethod = null;
    },
    setTableNumber(tableNumber) {
      this.tableNumber = tableNumber;
      this.isTableAutoDetected = false;
    },
    setAutoDetectedTable(tableNumber) {
      this.tableNumber = tableNumber;
      this.isTableAutoDetected = true;
    },
    setAddress(address) {
      this.address = address;
    },
     setChefNote(chefNote) {
      this.chefNote = chefNote
    },
  },
});
