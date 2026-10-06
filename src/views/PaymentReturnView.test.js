import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import PaymentReturnView from "./PaymentReturnView.vue";
import { useCartStore } from "../stores/cart";
import { useLastOrderStore } from "../stores/lastOrder";
import * as paymentsService from "../services/payments.service";

const routes = [
  {
    path: "/pago/confirmar",
    name: "payment-return",
    component: PaymentReturnView,
  },
  {
    path: "/mi-pedido",
    name: "mi-pedido",
    component: { template: "<div>Mi pedido</div>" },
  },
];

async function mountPaymentReturnView(path, { seedCart } = {}) {
  const router = createRouter({ history: createWebHistory(), routes });
  router.push(path);
  await router.isReady();

  setActivePinia(createPinia());
  const cartStore = useCartStore();
  const lastOrderStore = useLastOrderStore();

  // Sembramos el estado del carrito ANTES de montar: el componente dispara
  // checkPayment() en su onMounted, y esa llamada puede resolverse (y vaciar
  // el carrito) antes de que el test recupere el control tras el await.
  if (seedCart) {
    seedCart(cartStore);
  }

  const wrapper = mount(PaymentReturnView, {
    global: { plugins: [router] },
  });

  return { wrapper, cartStore, lastOrderStore, router };
}

describe("PaymentReturnView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("confirms the payment and navigates to mi-pedido after the delay when session_id is present", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(paymentsService, "confirmPayment").mockResolvedValue({
      id: 42,
      status: "PAID",
    });

    const { wrapper, cartStore, router } = await mountPaymentReturnView(
      "/pago/confirmar?session_id=sess_42",
      {
        seedCart: (store) =>
          store.addProduct({ id: 1, name: "Salmon Roll", price: 10 }),
      },
    );
    await flushPromises();

    expect(paymentsService.confirmPayment).toHaveBeenCalledWith("sess_42");
    expect(wrapper.text()).toContain("Pago confirmado");
    expect(cartStore.isEmpty).toBe(true);
    expect(router.currentRoute.value.name).toBe("payment-return");

    await vi.advanceTimersByTimeAsync(2500);

    expect(router.currentRoute.value.name).toBe("mi-pedido");
  });

  it("shows a cancelled message with a retry button when there is no session_id", async () => {
    const { wrapper } = await mountPaymentReturnView("/pago/confirmar");
    await flushPromises();

    expect(wrapper.text()).toContain("El pago no se ha completado");
    expect(wrapper.find(".payment-return__button").exists()).toBe(true);
  });

  it("shows an error state with a retry button when the backend rejects the confirmation", async () => {
    vi.spyOn(paymentsService, "confirmPayment").mockRejectedValue(
      new Error("payment not found"),
    );

    const { wrapper } = await mountPaymentReturnView(
      "/pago/confirmar?session_id=sess_99",
    );
    await flushPromises();

    expect(wrapper.text()).toContain("No se ha podido confirmar el pago");
    expect(wrapper.find(".payment-return__button").exists()).toBe(true);
  });

  describe("retrying the payment", () => {
    let originalLocation;

    beforeEach(() => {
      originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it("requests a new checkout session for the last order and redirects to it", async () => {
      vi.spyOn(paymentsService, "createCheckoutSession").mockResolvedValue({
        checkoutUrl: "https://stripe.test/pay/sess_new",
      });

      const { wrapper, lastOrderStore } = await mountPaymentReturnView(
        "/pago/confirmar",
      );
      lastOrderStore.setOrder({ id: 42, status: "PLACED" });
      await flushPromises();

      await wrapper.find(".payment-return__button").trigger("click");
      await flushPromises();

      expect(paymentsService.createCheckoutSession).toHaveBeenCalledWith({
        orderId: 42,
        email: undefined,
      });
      expect(window.location.href).toBe("https://stripe.test/pay/sess_new");
    });

    it("retries the payment of the order saved before leaving for Stripe", async () => {
      vi.spyOn(paymentsService, "createCheckoutSession").mockResolvedValue({
        checkoutUrl: "https://stripe.test/pay/sess_new",
      });
      // Al volver de Stripe la app arranca de cero: solo queda lo guardado en localStorage.
      localStorage.setItem(
        "gitsushi-last-order",
        JSON.stringify({ id: 42, token: "abc-123", savedAt: Date.now() }),
      );

      const { wrapper } = await mountPaymentReturnView("/pago/confirmar");
      await flushPromises();

      await wrapper.find(".payment-return__button").trigger("click");
      await flushPromises();

      expect(paymentsService.createCheckoutSession).toHaveBeenCalledWith({
        orderId: 42,
        email: undefined,
      });
    });
  });
});