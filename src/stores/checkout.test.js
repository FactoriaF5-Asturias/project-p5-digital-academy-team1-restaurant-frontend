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

  it("sets the payment method", () => {
    const checkoutStore = useCheckoutStore();

    checkoutStore.setPaymentMethod("cashier");

    expect(checkoutStore.paymentMethod).toBe("cashier");
  });

  it("overwrites a previously selected payment method", () => {
    const checkoutStore = useCheckoutStore();
    checkoutStore.setPaymentMethod("cashier");

    checkoutStore.setPaymentMethod("cardOnTable");

    expect(checkoutStore.paymentMethod).toBe("cardOnTable");
  });

  it("uses a copy of the profile address for the order", () => {
    const checkoutStore = useCheckoutStore();
    const profileAddress = { street: "Calle Mayor 1", city: "Avilés", postalCode: "33400" };

    checkoutStore.useProfileAddress(profileAddress);

    expect(checkoutStore.addressSource).toBe("profile");
    expect(checkoutStore.address).toEqual(profileAddress);
    expect(checkoutStore.address).not.toBe(profileAddress);
  });

  it("starts an empty address when the customer wants another one", () => {
    const checkoutStore = useCheckoutStore();
    checkoutStore.useProfileAddress({ street: "Calle Mayor 1", city: "Avilés", postalCode: "33400" });

    checkoutStore.useOtherAddress();

    expect(checkoutStore.addressSource).toBe("other");
    expect(checkoutStore.address).toBeNull();
  });

  it("shows the address errors after a confirmation attempt and hides them when the channel changes", () => {
    const checkoutStore = useCheckoutStore();
    checkoutStore.setChannel("domicilio");

    checkoutStore.revealAddressErrors();
    expect(checkoutStore.showAddressErrors).toBe(true);

    checkoutStore.setChannel("sala");
    expect(checkoutStore.showAddressErrors).toBe(false);
  });
});
