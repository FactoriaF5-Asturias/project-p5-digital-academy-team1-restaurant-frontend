<script setup>
import { ref } from "vue";
import DeliveryMetrics from "../components/DeliveryMetrics.vue";
import PendingDeliveriesList from "../components/PendingDeliveriesList.vue";
import OnTheWayOrdersList from "../components/OnTheWayOrdersList.vue";
import DeliveredTodayList from "../components/DeliveredTodayList.vue";
import { useDeliveryMetrics } from "../composables/useDeliveryMetrics";

const { metrics, isLoading, isRefreshing, error, isEmpty, refresh } =
  useDeliveryMetrics();

const onTheWayOrdersListRef = ref(null);
const deliveredTodayListRef = ref(null);

function handleOrderAccepted() {
  onTheWayOrdersListRef.value?.refresh();
}

function handleOrderDelivered() {
  deliveredTodayListRef.value?.refresh();
}
</script>

<template>
  <main class="delivery-view" :aria-busy="isLoading">
    <header>
      <h1 class="delivery-view__title">Resumen de reparto</h1>
      <p class="delivery-view__description">
        Vista general de los pedidos del restaurante. Actualización automática
        cada 10 segundos.
      </p>
    </header>

    <p v-if="isLoading" role="status">Cargando datos de reparto…</p>

    <template v-else>
      <div v-if="error" class="delivery-view__error">
        <p role="alert">{{ error }}</p>

        <button
          type="button"
          class="delivery-view__retry"
          :disabled="isRefreshing"
          @click="refresh"
        >
          Reintentar
        </button>
      </div>

      <DeliveryMetrics v-if="metrics" :metrics="metrics" />

      <p v-if="isEmpty" role="status">
        No hay pedidos listos, en tránsito ni entregados hoy.
      </p>
    </template>

    <PendingDeliveriesList @order-accepted="handleOrderAccepted" />

    <OnTheWayOrdersList
      ref="onTheWayOrdersListRef"
      @order-delivered="handleOrderDelivered"
    />

    <DeliveredTodayList ref="deliveredTodayListRef" />
  </main>
</template>

<style scoped>
@reference "../style.css";

.delivery-view {
  @apply mx-auto flex w-full max-w-6xl flex-col gap-6
    px-4 py-8 sm:px-6;
}

.delivery-view__title {
  @apply text-2xl font-heading;
}

.delivery-view__description {
  @apply mt-2 text-sm text-on-surface;
}

.delivery-view__error {
  @apply flex flex-col items-start gap-4 text-error;
}

.delivery-view__retry {
  @apply cursor-pointer rounded-lg bg-primary px-5 py-3
    font-semibold text-white disabled:cursor-not-allowed
    disabled:opacity-50;
}
</style>
