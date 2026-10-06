<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import OrderTicket from "../components/OrderTicket.vue";
import OrderHistorySection from "../components/OrderHistorySection.vue";
import { useAuthStore } from "../stores/auth";
import { useLastOrderStore } from "../stores/lastOrder";
import { useOrderTicket } from "../composables/useOrderTicket";

// Responsabilidad: página Mi pedido. Muestra el ticket real del pedido en curso
// y, con sesión, el historial. El pedido sale del enlace del email
// (/tickets/:id?token=...) o, si no, del último pedido confirmado en este navegador.

const route = useRoute();
const authStore = useAuthStore();
const lastOrderStore = useLastOrderStore();

const reference = route.params.id
  ? { id: route.params.id, token: route.query.token ?? null }
  : lastOrderStore.ticketReference;

const {
  ticket,
  isLoading,
  loadError,
  hasOrder,
  fetchTicket,
  startAutoRefresh,
  stopAutoRefresh,
} = useOrderTicket(reference);

onMounted(async () => {
  await fetchTicket();
  startAutoRefresh();
});

onBeforeUnmount(stopAutoRefresh);
</script>

<template>
  <main class="mi-pedido-view">
    <section v-if="!hasOrder" class="mi-pedido-view__empty">
      <p>Todavía no tienes un pedido en curso.</p>
      <RouterLink :to="{ name: 'carta' }" class="mi-pedido-view__link">
        Ver la carta
      </RouterLink>
    </section>

    <p v-else-if="isLoading" class="mi-pedido-view__status" role="status">
      Cargando tu pedido...
    </p>

    <p
      v-else-if="loadError"
      class="mi-pedido-view__status mi-pedido-view__status--error"
      role="alert"
    >
      {{ loadError }}
    </p>

    <OrderTicket v-else-if="ticket" :ticket="ticket" />

    <OrderHistorySection v-if="authStore.isAuthenticated" />
  </main>
</template>

<style scoped>
@reference "../style.css";

/* Mismo ancho máximo que el ticket y margen lateral para que no toque los bordes en móvil */
.mi-pedido-view {
  @apply max-w-4xl mx-auto px-4 sm:px-6 pb-8;
}

.mi-pedido-view__empty {
  @apply mt-8 flex flex-col items-center gap-4 rounded-xl border border-outline-variant
    bg-surface-container p-8 text-center text-on-surface-variant;
}

.mi-pedido-view__link {
  @apply rounded-full bg-primary px-5 py-2 font-semibold text-on-primary;
}

.mi-pedido-view__status {
  @apply mt-8 text-center text-on-surface-variant;
}

.mi-pedido-view__status--error {
  @apply text-error;
}
</style>