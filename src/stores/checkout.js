import { defineStore } from "pinia";

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    channel: "sala",
    tableNumber: null,
    isTableAutoDetected: false,
    address: null,
    // 'profile' = la dirección del perfil; 'other' = una escrita solo para este pedido.
    addressSource: "other",
    // Se activa al intentar confirmar sin dirección completa, para marcar los campos en rojo.
    showAddressErrors: false,
    paymentMethod: null,
    chefNote: '',
  }),
  actions: {
    setChannel(channel) {
      if (this.channel === channel) return;
      this.channel = channel;
      this.paymentMethod = null;
      this.showAddressErrors = false;
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
    // Copia: editar el pedido nunca cambia el perfil.
    useProfileAddress(profileAddress) {
      this.addressSource = "profile";
      this.address = { ...profileAddress };
      this.showAddressErrors = false;
    },
    useOtherAddress() {
      this.addressSource = "other";
      this.address = null;
    },
    revealAddressErrors() {
      this.showAddressErrors = true;
    },
    setPaymentMethod(paymentMethod) {
      this.paymentMethod = paymentMethod;
    },
    setChefNote(chefNote) {
      this.chefNote = chefNote
    },
  },
});
