<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useLastOrderStore } from "../stores/lastOrder";
import { useExclusiveOffersStore } from "../stores/exclusiveOffers";
import { useAuthStore } from "../stores/auth";
import { createOrder } from "../services/orders.service";
import { createCheckoutSession } from "../services/payments.service";
import { HOME_DELIVERY_FEE } from "../constants/delivery";
import { getMissingAddressFields } from "../utils/deliveryAddress";
import {
  getBackendPaymentMethod,
  getPaymentStatusLabel,
} from "../constants/paymentMethods";

const NAVIGATION_DELAY_MS = 2500;

const router = useRouter();
const cartStore = useCartStore();
const checkoutStore = useCheckoutStore();
const lastOrderStore = useLastOrderStore();
const offersStore = useExclusiveOffersStore();
const authStore = useAuthStore();

const ADDRESS_INCOMPLETE_MESSAGE =
  "Completa la dirección de entrega para confirmar el pedido.";

const isSubmitting = ref(false);
const errorMessage = ref(null);
const paymentStatusMessage = ref(null);

// En sala el backend necesita la mesa: si no se detectó, hay que escribirla a mano.
const needsTableNumber = computed(
  () => checkoutStore.channel === "sala" && !checkoutStore.tableNumber,
);

const canConfirmOrder = computed(() => {
  if (cartStore.isEmpty) return false;
  if (needsTableNumber.value) return false;
  // Sala y domicilio necesitan un método de pago (el backend lo exige).
  if (!checkoutStore.paymentMethod) return false;
  return true;
});

// El envío solo se cobra en pedidos a domicilio con productos; el backend aplica
// el mismo cargo fijo al calcular el total real del pedido.
const homeDeliveryFee = computed(() =>
  checkoutStore.channel === "domicilio" && !cartStore.isEmpty
    ? HOME_DELIVERY_FEE
    : 0,
);

const orderTotal = computed(() => cartStore.total + homeDeliveryFee.value);

const formatCurrency = (value) =>
  value.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// Marca como canjeada cada oferta exclusiva aplicada a un producto del
// pedido que se acaba de confirmar. Se ejecuta tras crear el pedido con
// éxito, así que un fallo aquí (ver exclusiveOffers.js) no debe impedir
// que el flujo de confirmación siga su curso.
async function consumeAppliedOffers() {
  const appliedOffers = cartStore.items
    .map((item) => offersStore.offerForProduct(item.product.id))
    .filter((offer) => offer !== null);

  await Promise.all(
    appliedOffers.map((offer) => offersStore.consumeOffer(offer.coupon)),
  );
}

// Un pedido a domicilio con tarjeta online todavía no está pagado cuando el
// backend responde a POST /orders — solo lo está una vez Stripe confirma el
// cobro. Por eso este caso sigue un camino distinto al resto.
function isHomeDeliveryOnlineCard() {
  return (
    checkoutStore.channel === "domicilio" &&
    checkoutStore.paymentMethod === "onlineCard"
  );
}

// La dirección se comprueba al pulsar el botón para poder decir qué falta.
function isHomeDeliveryAddressIncomplete() {
  return (
    checkoutStore.channel === "domicilio" &&
    getMissingAddressFields(checkoutStore.address).length > 0
  );
}

async function confirmOrder() {
  if (isHomeDeliveryAddressIncomplete()) {
    checkoutStore.revealAddressErrors();
    errorMessage.value = ADDRESS_INCOMPLETE_MESSAGE;
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    const items = cartStore.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const order = await createOrder({
      items,
      chefNote: checkoutStore.chefNote,
      channel: checkoutStore.channel,
      paymentMethod: getBackendPaymentMethod(checkoutStore.paymentMethod),
      // El backend exige la dirección para cualquier pedido ONLINE/domicilio.
      ...(checkoutStore.channel === "domicilio"
        ? { address: checkoutStore.address }
        : {}),
      // El backend usa este número de mesa para resolverla, con prioridad
      // sobre el Device-Identifier (ver OrderService.resolveTable).
      ...(checkoutStore.channel === "sala" && checkoutStore.tableNumber
        ? { tableNumber: checkoutStore.tableNumber }
        : {}),
    });

    lastOrderStore.setOrder(order);

    await consumeAppliedOffers();

    if (isHomeDeliveryOnlineCard()) {
      // No vaciamos la cesta ni navegamos a /mi-pedido todavía: el pago se
      // confirma de verdad al volver de Stripe (ver PaymentReturnView.vue).
      const session = await createCheckoutSession({
        orderId: order.id,
        email: authStore.user?.email,
      });

      window.location.href = session.checkoutUrl;
      return;
    }

    paymentStatusMessage.value = getPaymentStatusLabel(order.paymentStatus);
    cartStore.clearCart();

    setTimeout(() => {
      router.push({ name: "mi-pedido" });
    }, NAVIGATION_DELAY_MS);
  } catch (err) {
    errorMessage.value =
      "No se ha podido confirmar el pedido. Inténtalo de nuevo.";
    console.error("[OrderConfirmation] Error al confirmar el pedido:", err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="order-confirmation" aria-label="Confirmar pedido">
    <h2 class="order-confirmation__title">Resumen del pedido</h2>

    <dl class="order-confirmation__summary">
      <div class="order-confirmation__row">
        <dt>Subtotal</dt>
        <dd>{{ formatCurrency(cartStore.subtotal) }}</dd>
      </div>
      <div
        v-if="cartStore.discountAmount > 0"
        class="order-confirmation__row order-confirmation__row--discount"
      >
        <dt>Descuento</dt>
        <dd>−{{ cartStore.discountAmount.toFixed(2) }} €</dd>
      </div>
      <div class="order-confirmation__row">
        <dt>IVA</dt>
        <dd>{{ formatCurrency(cartStore.taxAmount) }}</dd>
      </div>
      <div
        v-if="homeDeliveryFee > 0"
        class="order-confirmation__row"
      >
        <dt>Gastos de envío</dt>
        <dd>{{ formatCurrency(homeDeliveryFee) }}</dd>
      </div>
      <div class="order-confirmation__row order-confirmation__row--total">
        <dt>Total</dt>
        <dd>{{ formatCurrency(orderTotal) }}</dd>
      </div>
    </dl>

    <p v-if="errorMessage" class="order-confirmation__error">
      {{ errorMessage }}
    </p>

    <p
      v-if="paymentStatusMessage"
      class="order-confirmation__success"
      role="status"
    >
      Pedido confirmado — {{ paymentStatusMessage }}. Redirigiendo a tu
      pedido...
    </p>

        <p v-if="needsTableNumber" class="order-confirmation__hint">
      Indica tu número de mesa para continuar.
    </p>

    <button
      type="button"
      class="order-confirmation__button"
      :disabled="!canConfirmOrder || isSubmitting"
      @click="confirmOrder"
    >
      {{ isSubmitting ? "Confirmando..." : "Confirmar y pagar pedido" }}
    </button>
  </section>
</template>

<style scoped>
@reference "../style.css";

.order-confirmation {
  @apply flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface p-4;
}

.order-confirmation__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.order-confirmation__summary {
  @apply flex flex-col gap-1;
}

.order-confirmation__row {
  @apply flex justify-between text-sm text-on-surface-variant;
}

.order-confirmation__row--discount {
  @apply text-secondary;
}

.order-confirmation__row--total {
  @apply text-base font-semibold text-on-surface;
}

.order-confirmation__hint {
  @apply text-sm text-on-surface-variant;
}

.order-confirmation__success {
  @apply text-sm font-medium text-secondary;
}

.order-confirmation__button {
  @apply rounded-full bg-primary px-4 py-2 font-semibold text-on-primary transition-opacity disabled:opacity-50;
}
</style>
