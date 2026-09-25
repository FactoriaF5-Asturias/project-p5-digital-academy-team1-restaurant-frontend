<script setup>
import { ref, onMounted } from 'vue'
import PaginationControl from './PaginationControl.vue'
import { useOrderHistory } from '../composables/useOrderHistory'
import { useCartStore } from '../stores/cart'

const {
  orders,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalItems,
  fetchHistory,
  goToPage,
} = useOrderHistory()

const cartStore = useCartStore()
const showAll = ref(false)

onMounted(() => {
  fetchHistory(1)
})

function handleShowAll() {
  showAll.value = true
}

function handleRepeatOrder(order) {
  for (const item of order.items) {
    const product = { id: item.productId, name: item.name, price: item.price }
    cartStore.addProduct(product)
    for (let i = 1; i < item.quantity; i++) {
      cartStore.incrementQuantity(product.id)
    }
  }
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatPrice(price) {
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function summarizeItems(items) {
  return items.map((item) => `${item.quantity}× ${item.name}`).join(', ')
}
</script>

<template>
  <section class="order-history" aria-label="Historial de pedidos anteriores">
    <h2 class="order-history__title">Historial de mis pedidos anteriores</h2>

    <p v-if="isLoading" class="order-history__status">Cargando tu historial de pedidos...</p>
    <p v-else-if="error" class="order-history__status order-history__status--error">
      {{ error }}
    </p>

    <template v-else>
      <p v-if="orders.length === 0" class="order-history__status">
        Todavía no tienes pedidos anteriores.
      </p>

      <template v-else>
        <ul class="order-history__list">
          <li v-for="order in orders" :key="order.id" class="order-history__card">
            <div class="order-history__card-header">
              <span class="order-history__date">{{ formatDate(order.date) }}</span>
              <span class="order-history__total">{{ formatPrice(order.total) }}</span>
            </div>

            <p class="order-history__summary">{{ summarizeItems(order.items) }}</p>

            <button
              type="button"
              class="order-history__repeat-btn"
              @click="handleRepeatOrder(order)"
            >
              Repetir orden ahora
            </button>
          </li>
        </ul>

        <button
          v-if="!showAll && totalItems > 3"
          type="button"
          class="order-history__show-all-btn"
          @click="handleShowAll"
        >
          Ver todos los pedidos anteriores
        </button>

        <PaginationControl
          v-if="showAll && totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="goToPage"
        />
      </template>
    </template>
  </section>
</template>

<style scoped>
@reference "../style.css";

.order-history {
  @apply flex flex-col gap-4 py-8;
}

.order-history__title {
  @apply text-lg font-heading;
}

.order-history__status {
  @apply text-center text-on-surface-variant py-6;
}

.order-history__status--error {
  @apply text-error;
}

.order-history__list {
  @apply flex flex-col gap-3;
}

.order-history__card {
  @apply flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface p-4;
}

.order-history__card-header {
  @apply flex items-center justify-between;
}

.order-history__date {
  @apply text-sm text-on-surface-variant;
}

.order-history__total {
  @apply font-semibold text-primary;
}

.order-history__summary {
  @apply text-sm text-on-surface-variant;
}

.order-history__repeat-btn {
  @apply self-start rounded-full border border-outline-variant px-4 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-primary-container;
}

.order-history__show-all-btn {
  @apply self-center text-sm font-medium text-primary underline-offset-2 hover:underline;
}
</style>
