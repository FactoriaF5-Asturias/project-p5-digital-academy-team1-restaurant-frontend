<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useLastOrderStore } from "../stores/lastOrder";
import { useAuthStore } from "../stores/auth";
import { confirmPayment, createCheckoutSession } from "../services/payments.service";

const NAVIGATION_DELAY_MS = 2500;

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const lastOrderStore = useLastOrderStore();
const authStore = useAuthStore();

// 'checking' mientras se confirma con el backend, 'confirmed' si el pago es
// correcto, 'cancelled' si Stripe no trae session_id (el cliente canceló),
// 'error' si el backend rechaza la confirmación.
const status = ref("checking");
const isRetrying = ref(false);

async function checkPayment() {
  const sessionId = route.query.session_id;

  if (!sessionId) {
    // Stripe redirige aquí sin session_id cuando el cliente cancela el pago
    // (stripe.cancel.url, configurado en el backend).
    status.value = "cancelled";
    return;
  }

  try {
    await confirmPayment(sessionId);
    cartStore.clearCart();
    status.value = "confirmed";

    setTimeout(() => {
      router.push({ name: "mi-pedido" });
    }, NAVIGATION_DELAY_MS);
  } catch (err) {
    status.value = "error";
    console.error("[PaymentReturnView] Error al confirmar el pago:", err);
  }
}

async function retryPayment() {
  // Tras volver de Stripe la app arranca de cero: el pedido completo ya no está
  // en memoria, pero su referencia sigue guardada en el navegador.
  const orderId = lastOrderStore.ticketReference?.id;

  if (!orderId) {
    status.value = "error";
    return;
  }

  isRetrying.value = true;

  try {
    const session = await createCheckoutSession({
      orderId,
      email: authStore.user?.email,
    });
    window.location.href = session.checkoutUrl;
  } catch (err) {
    status.value = "error";
    console.error("[PaymentReturnView] Error al reintentar el pago:", err);
  } finally {
    isRetrying.value = false;
  }
}

onMounted(checkPayment);
</script>

<template>
  <main class="payment-return" aria-label="Confirmación de pago">
    <p v-if="status === 'checking'" role="status">Comprobando el pago...</p>

    <p
      v-else-if="status === 'confirmed'"
      class="payment-return__success"
      role="status"
    >
      Pago confirmado. Redirigiendo a tu pedido...
    </p>

    <div v-else class="payment-return__retry">
      <p v-if="status === 'cancelled'" role="alert">
        El pago no se ha completado. Tu pedido sigue pendiente de pago.
      </p>
      <p v-else role="alert">
        No se ha podido confirmar el pago. Tu pedido sigue pendiente de pago.
      </p>

      <button
        type="button"
        class="payment-return__button"
        :disabled="isRetrying"
        @click="retryPayment"
      >
        {{ isRetrying ? "Redirigiendo..." : "Reintentar pago" }}
      </button>
    </div>
  </main>
</template>

<style scoped>
@reference "../style.css";

.payment-return {
  @apply mx-auto flex w-full max-w-xl flex-col items-start gap-4
    px-4 py-8 sm:px-6;
}

.payment-return__success {
  @apply text-sm font-medium text-secondary;
}

.payment-return__retry {
  @apply flex flex-col items-start gap-4 text-error;
}

.payment-return__button {
  @apply cursor-pointer rounded-full bg-primary px-5 py-3
    font-semibold text-on-primary disabled:cursor-not-allowed
    disabled:opacity-50;
}
</style>
