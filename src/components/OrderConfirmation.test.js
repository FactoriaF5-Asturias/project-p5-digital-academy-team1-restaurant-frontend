import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import OrderConfirmation from "./OrderConfirmation.vue";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useExclusiveOffersStore } from "../stores/exclusiveOffers";
import * as ordersService from "../services/orders.service";
import * as paymentsService from "../services/payments.service";
import { useLastOrderStore } from "../stores/lastOrder";

const routes = [
  { path: "/", name: "carta", component: { template: "<div>Carta</div>" } },
  {
    path: "/cesta",
    name: "cesta",
    component: { template: "<div>Cesta</div>" },
  },
  {
    path: "/mi-pedido",
    name: "mi-pedido",
    component: { template: "<div>Mi pedido</div>" },
  },
];
// Los pedidos en sala necesitan mesa: por defecto los tests tienen una ya indicada.
const TABLE_NUMBER = 3;
const DELIVERY_ADDRESS = { street: "Calle Mayor 1", city: "Avilés", postalCode: "33400" };
async function mountOrderConfirmation() {
  const router = createRouter({ history: createWebHistory(), routes });
  router.push("/cesta");
  await router.isReady();

  setActivePinia(createPinia());
  const cartStore = useCartStore();
  const checkoutStore = useCheckoutStore();
  checkoutStore.setTableNumber(TABLE_NUMBER);

  const wrapper = mount(OrderConfirmation, {
    global: { plugins: [router] },
  });

  return { wrapper, cartStore, checkoutStore, router };
}

describe("OrderConfirmation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables the confirm button when the cart is empty", async () => {
    const { wrapper } = await mountOrderConfirmation();

    expect(
      wrapper.find(".order-confirmation__button").attributes("disabled"),
    ).toBeDefined();
  });

  it("disables the confirm button when dining in without a payment method", async () => {
    const { wrapper, cartStore } = await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    await flushPromises();

    expect(
      wrapper.find(".order-confirmation__button").attributes("disabled"),
    ).toBeDefined();
  });

    it("disables the confirm button and asks for the table when dining in without one", async () => {
    const { wrapper, cartStore, checkoutStore } =
      await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    checkoutStore.setTableNumber(null);
    await flushPromises();

    expect(
      wrapper.find(".order-confirmation__button").attributes("disabled"),
    ).toBeDefined();
    expect(wrapper.find(".order-confirmation__hint").text()).toBe(
      "Indica tu número de mesa para continuar.",
    );
  });

  it("does not ask for a table for home delivery orders", async () => {
    const { wrapper, checkoutStore } = await mountOrderConfirmation();
    checkoutStore.setChannel("domicilio");
    checkoutStore.setTableNumber(null);
    await flushPromises();

    expect(wrapper.find(".order-confirmation__hint").exists()).toBe(false);
  });

  it("disables the confirm button for home delivery until a payment method is chosen", async () => {
    const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setChannel("domicilio");
    checkoutStore.setAddress(DELIVERY_ADDRESS);
    await flushPromises();

    expect(
      wrapper.find(".order-confirmation__button").attributes("disabled"),
    ).toBeDefined();
  });

  it("asks for the missing address fields and does not send a home delivery order without them", async () => {
    const createOrderSpy = vi.spyOn(ordersService, "createOrder");
    const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setChannel("domicilio");
    checkoutStore.setPaymentMethod("cashOnDelivery");
    checkoutStore.setAddress({ street: "Calle Uría 10" });
    await flushPromises();

    await wrapper.find(".order-confirmation__button").trigger("click");
    await flushPromises();

    expect(createOrderSpy).not.toHaveBeenCalled();
    expect(checkoutStore.showAddressErrors).toBe(true);
    expect(wrapper.find(".order-confirmation__error").text()).toBe(
      "Completa la dirección de entrega para confirmar el pedido.",
    );
  });

  it("enables the confirm button once a dine-in payment method is selected", async () => {
    const { wrapper, cartStore, checkoutStore } =
      await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    await flushPromises();

    expect(
      wrapper.find(".order-confirmation__button").attributes("disabled"),
    ).toBeUndefined();
  });

  it("does not show the discount row when no active offer applies", async () => {
    const { wrapper, cartStore } = await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    await flushPromises();

    expect(wrapper.find(".order-confirmation__row--discount").exists()).toBe(
      false,
    );
  });

  it("shows the discount row with the amount saved when an active offer applies", async () => {
    const { wrapper, cartStore } = await mountOrderConfirmation();
    const offersStore = useExclusiveOffersStore();
    offersStore.offers = [
      { used: false, finalPrice: 8.5, discountRate: 15, product: { id: 1 } },
    ];
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    await flushPromises();

    // 10 € - 8,5 € = 1,50 € de descuento
    expect(wrapper.find(".order-confirmation__row--discount").text()).toContain(
      "1.50",
    );
  });

  it("adds the home delivery fee to the total when the channel is domicilio", async () => {
    const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setChannel("domicilio");
    await flushPromises();

    // 10 € subtotal + 1 € IVA (10%) + 2,50 € de envío = 13,50 €
    const totalText = wrapper.find(".order-confirmation__row--total").text();
    expect(totalText).toContain("13,50");
  });

    it("does not charge the home delivery fee while the cart is empty", async () => {
    const { wrapper, checkoutStore } = await mountOrderConfirmation();
    checkoutStore.setChannel("domicilio");
    await flushPromises();

    const totalText = wrapper.find(".order-confirmation__row--total").text();
    expect(totalText).toContain("0,00");
    expect(wrapper.text()).not.toContain("Gastos de envío");
  });

  it("sends the mapped cart items, channel and payment method, then empties the cart", async () => {
    vi.spyOn(ordersService, "createOrder").mockResolvedValue({
      id: 99,
      paymentStatus: "PENDING_CASH",
    });
    const { wrapper, cartStore, checkoutStore, router } =
      await mountOrderConfirmation();
    const lastOrderStore = useLastOrderStore();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    checkoutStore.setChefNote("Sin wasabi");
    await flushPromises();

    await wrapper.find(".order-confirmation__button").trigger("click");
    await flushPromises();

       expect(ordersService.createOrder).toHaveBeenCalledWith({
      items: [{ productId: 1, quantity: 1 }],
      chefNote: "Sin wasabi",
      channel: "sala",
      paymentMethod: "CASH_ONSITE",
      tableNumber: TABLE_NUMBER,
    });
    expect(lastOrderStore.order).toEqual({
      id: 99,
      paymentStatus: "PENDING_CASH",
    });
    expect(cartStore.isEmpty).toBe(true);
    // La navegación todavía no ha ocurrido: primero se muestra el estado de pago
    expect(router.currentRoute.value.name).toBe("cesta");
  });

  it("shows the translated payment status and navigates to the tracking view only after the delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(ordersService, "createOrder").mockResolvedValue({
      id: 99,
      paymentStatus: "PENDING_CASH",
    });
    const { wrapper, cartStore, checkoutStore, router } =
      await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    await flushPromises();

    await wrapper.find(".order-confirmation__button").trigger("click");
    await flushPromises();

    expect(wrapper.find(".order-confirmation__success").text()).toContain(
      "pendiente de cobro en caja",
    );
    expect(router.currentRoute.value.name).toBe("cesta");

    await vi.advanceTimersByTimeAsync(2500);

    expect(router.currentRoute.value.name).toBe("mi-pedido");
  });

  it("shows an error message and keeps the cart when the confirmation fails", async () => {
    vi.spyOn(ordersService, "createOrder").mockRejectedValue(
      new Error("network error"),
    );
    const { wrapper, cartStore, checkoutStore, router } =
      await mountOrderConfirmation();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    await flushPromises();

    await wrapper.find(".order-confirmation__button").trigger("click");
    await flushPromises();

    expect(wrapper.find(".order-confirmation__error").text()).toBe(
      "No se ha podido confirmar el pedido. Inténtalo de nuevo.",
    );
    expect(cartStore.isEmpty).toBe(false);
    expect(router.currentRoute.value.name).toBe("cesta");
  });

  it("consumes the exclusive offer applied to a product when the order is confirmed", async () => {
    vi.spyOn(ordersService, "createOrder").mockResolvedValue({
      id: 99,
      paymentStatus: "PENDING_CASH",
    });
    const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation();
    const offersStore = useExclusiveOffersStore();
    offersStore.offers = [
      { id: 1, used: false, coupon: "coupon-a", finalPrice: 8.5, discountRate: 15, product: { id: 1 } },
    ];
    vi.spyOn(offersStore, "consumeOffer").mockResolvedValue();
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    await flushPromises();

    await wrapper.find(".order-confirmation__button").trigger("click");
    await flushPromises();

    expect(offersStore.consumeOffer).toHaveBeenCalledWith("coupon-a");
  });

  it("does not try to consume anything when no product in the order has an active offer", async () => {
    vi.spyOn(ordersService, "createOrder").mockResolvedValue({
      id: 99,
      paymentStatus: "PENDING_CASH",
    });
    const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation();
    const offersStore = useExclusiveOffersStore();
    vi.spyOn(offersStore, "consumeOffer");
    cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
    checkoutStore.setPaymentMethod("cashier");
    await flushPromises();

    await wrapper.find(".order-confirmation__button").trigger("click");
    await flushPromises();

    expect(offersStore.consumeOffer).not.toHaveBeenCalled();
  });

  describe("home delivery with online card (Stripe)", () => {
    let originalLocation;

    beforeEach(() => {
      // jsdom no soporta de verdad cambiar window.location.href (lanza un
      // error de "navegación no implementada"), así que se sustituye por un
      // objeto propio solo para estos tests, y se restaura después.
      originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it("creates a Stripe checkout session and redirects to it, without emptying the cart yet", async () => {
      vi.spyOn(ordersService, "createOrder").mockResolvedValue({
        id: 42,
        paymentStatus: "PENDING_ONLINE_PAYMENT",
      });
      vi.spyOn(paymentsService, "createCheckoutSession").mockResolvedValue({
        checkoutUrl: "https://stripe.test/pay/sess_42",
      });

      const { wrapper, cartStore, checkoutStore, router } =
        await mountOrderConfirmation();
      cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
      checkoutStore.setChannel("domicilio");
      checkoutStore.setPaymentMethod("onlineCard");
      checkoutStore.setAddress({
        street: "Calle Mayor 1",
        city: "Gijón",
        postalCode: "33001",
      });
      await flushPromises();

      await wrapper.find(".order-confirmation__button").trigger("click");
      await flushPromises();

      expect(ordersService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          address: { street: "Calle Mayor 1", city: "Gijón", postalCode: "33001" },
        }),
      );

      expect(paymentsService.createCheckoutSession).toHaveBeenCalledWith({
        orderId: 42,
        email: undefined,
      });
      expect(window.location.href).toBe("https://stripe.test/pay/sess_42");
      // El pago todavía no está confirmado: la cesta se mantiene intacta y
      // no se navega a /mi-pedido todavía.
      expect(cartStore.isEmpty).toBe(false);
      expect(router.currentRoute.value.name).toBe("cesta");
    });

    it("does not redirect to Stripe for home delivery with cash on delivery", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.spyOn(ordersService, "createOrder").mockResolvedValue({
        id: 43,
        paymentStatus: "PENDING_CASH_ON_DELIVERY",
      });
      const createCheckoutSessionSpy = vi.spyOn(
        paymentsService,
        "createCheckoutSession",
      );

      const { wrapper, cartStore, checkoutStore } =
        await mountOrderConfirmation();
      cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
      checkoutStore.setChannel("domicilio");
      checkoutStore.setPaymentMethod("cashOnDelivery");
      checkoutStore.setAddress(DELIVERY_ADDRESS);
      await flushPromises();

      await wrapper.find(".order-confirmation__button").trigger("click");
      await flushPromises();

      expect(createCheckoutSessionSpy).not.toHaveBeenCalled();
      expect(cartStore.isEmpty).toBe(true);
    });
  });

it("sends the table number when confirming a dine-in order with a table selected", async () => {
  vi.spyOn(ordersService, "createOrder").mockResolvedValue({
    id: 99,
    paymentStatus: "PENDING_CASH",
  });
  const { wrapper, cartStore, checkoutStore } = await mountOrderConfirmation();
  cartStore.addProduct({ id: 1, name: "Salmon Roll", price: 10 });
  checkoutStore.setPaymentMethod("cashier");
  checkoutStore.setTableNumber(5);
  await flushPromises();

  await wrapper.find(".order-confirmation__button").trigger("click");
  await flushPromises();

  expect(ordersService.createOrder).toHaveBeenCalledWith(
    expect.objectContaining({ tableNumber: 5 }),
  );
});
})
