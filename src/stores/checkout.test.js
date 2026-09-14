import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCheckoutStore } from "./checkout";

describe("useCheckoutStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

   it('starts with the sala channel and no table, address, payment method or chef note', () => {
    const checkoutStore = useCheckoutStore();

    expect(checkoutStore.channel).toBe("sala");
    expect(checkoutStore.tableNumber).toBeNull();
    expect(checkoutStore.isTableAutoDetected).toBe(false);
    expect(checkoutStore.address).toBeNull();
    expect(checkoutStore.paymentMethod).toBeNull();
    expect(checkoutStore.chefNote).toBe('')
  });

  it("changes the channel", () => {
    const checkoutStore = useCheckoutStore();

    checkoutStore.setChannel("domicilio");

    expect(checkoutStore.channel).toBe("domicilio");
  });

  it("resets the payment method when the channel actually changes", () => {
    const checkoutStore = useCheckoutStore();
    checkoutStore.paymentMethod = "card";

    checkoutStore.setChannel("domicilio");

    expect(checkoutStore.paymentMethod).toBeNull();
  });

  it("does not reset the payment method when selecting the same channel again", () => {
    const checkoutStore = useCheckoutStore();
    checkoutStore.paymentMethod = "card";

    checkoutStore.setChannel("sala");

    expect(checkoutStore.paymentMethod).toBe("card");
  });

  it("stores the table number manually and marks it as not auto-detected", () => {
    const checkoutStore = useCheckoutStore();

    checkoutStore.setTableNumber(7);

    expect(checkoutStore.tableNumber).toBe(7);
    expect(checkoutStore.isTableAutoDetected).toBe(false);
  });

  it("stores the table number as auto-detected", () => {
    const checkoutStore = useCheckoutStore();

    checkoutStore.setAutoDetectedTable(5);

    expect(checkoutStore.tableNumber).toBe(5);
    expect(checkoutStore.isTableAutoDetected).toBe(true);
  });

  it("clears the auto-detected flag when the table number is edited manually afterwards", () => {
    const checkoutStore = useCheckoutStore();
    checkoutStore.setAutoDetectedTable(5);

    checkoutStore.setTableNumber(9);

    expect(checkoutStore.tableNumber).toBe(9);
    expect(checkoutStore.isTableAutoDetected).toBe(false);
  });

  it("stores the delivery address", () => {
    const checkoutStore = useCheckoutStore();

    checkoutStore.setAddress("Calle Falsa 123");

    expect(checkoutStore.address).toBe("Calle Falsa 123");
  });

  it('stores the chef note', () => {
    const checkoutStore = useCheckoutStore()

    checkoutStore.setChefNote('Sin wasabi, por favor')

    expect(checkoutStore.chefNote).toBe('Sin wasabi, por favor')
  })
});
