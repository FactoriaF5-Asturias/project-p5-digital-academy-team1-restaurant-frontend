<script setup>
import { useCartStore } from '../stores/cart'

// El widget "Tu pedido": lee y opera directamente sobre el store global de la cesta.
// No recibe props ni emite eventos porque el store es la única fuente de verdad.
const cartStore = useCartStore()

const formatCurrency = (value) =>
  value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

function handleIncrease(productId) {
  cartStore.incrementQuantity(productId)
}

function handleDecrease(line) {
  if (line.quantity === 1) {
    const confirmed = window.confirm(`¿Quitar "${line.product.name}" de la cesta?`)
    if (!confirmed) return
  }
  cartStore.decrementQuantity(line.product.id)
}

function handleRemove(line) {
  const confirmed = window.confirm(`¿Quitar "${line.product.name}" de la cesta?`)
  if (confirmed) {
    cartStore.removeProduct(line.product.id)
  }
}
</script>

<template>
  <section class="cart-summary" aria-label="Tu pedido">
    <h2 class="cart-summary__title">Tu pedido</h2>

    <p v-if="cartStore.isEmpty" class="cart-summary__empty">
      Tu cesta está vacía.
      <router-link :to="{ name: 'carta' }" class="cart-summary__back-link">
        Volver a la carta
      </router-link>
    </p>

    <template v-else>
      <ul class="cart-summary__list">
        <li
          v-for="line in cartStore.lines"
          :key="line.product.id"
          class="cart-summary__line"
        >
          <div class="cart-summary__line-info">
            <p class="cart-summary__line-name">{{ line.product.name }}</p>
            <p class="cart-summary__line-price">{{ formatCurrency(line.unitPrice) }} / ud.</p>
          </div>

          <div
            class="cart-summary__quantity"
            role="group"
            :aria-label="`Cantidad de ${line.product.name}`"
          >
            <button
              type="button"
              class="cart-summary__quantity-btn"
              aria-label="Reducir cantidad"
              @click="handleDecrease(line)"
            >
              −
            </button>
            <span class="cart-summary__quantity-value" aria-live="polite">{{ line.quantity }}</span>
            <button
              type="button"
              class="cart-summary__quantity-btn"
              aria-label="Aumentar cantidad"
              @click="handleIncrease(line.product.id)"
            >
              +
            </button>
          </div>

          <p class="cart-summary__line-subtotal">{{ formatCurrency(line.subtotal) }}</p>

          <button
            type="button"
            class="cart-summary__remove-btn"
            :aria-label="`Eliminar ${line.product.name} de la cesta`"
            @click="handleRemove(line)"
          >
            🗑
          </button>
        </li>
      </ul>

      <dl class="cart-summary__totals">
        <div class="cart-summary__totals-row">
          <dt>Subtotal</dt>
          <dd>{{ formatCurrency(cartStore.subtotal) }}</dd>
        </div>
        <div class="cart-summary__totals-row">
          <dt>IVA</dt>
          <dd>{{ formatCurrency(cartStore.taxAmount) }}</dd>
        </div>
        <div class="cart-summary__totals-row cart-summary__totals-row--total">
          <dt>Total</dt>
          <dd>{{ formatCurrency(cartStore.total) }}</dd>
        </div>
      </dl>
    </template>
  </section>
</template>

<style scoped>
@reference "../style.css";

.cart-summary {
  @apply flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface p-4;
}
.cart-summary__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}
.cart-summary__empty {
  @apply text-center text-on-surface-variant py-8;
}
.cart-summary__back-link {
  @apply block mt-2 font-medium text-primary hover:underline;
}
.cart-summary__list {
  @apply flex flex-col gap-3;
}
.cart-summary__line {
  @apply grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-outline-variant pb-3;
}
.cart-summary__line-name {
  @apply font-medium text-on-surface;
}
.cart-summary__line-price {
  @apply text-sm text-on-surface-variant;
}
.cart-summary__quantity {
  @apply flex items-center gap-2 rounded-full border border-outline-variant px-2 py-1;
}
.cart-summary__quantity-btn {
  @apply flex h-6 w-6 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-primary-container;
}
.cart-summary__quantity-value {
  @apply w-4 text-center text-sm;
}
.cart-summary__line-subtotal {
  @apply font-heading font-semibold text-primary;
}
.cart-summary__remove-btn {
  @apply text-on-surface-variant transition-colors hover:text-error;
}
.cart-summary__totals {
  @apply flex flex-col gap-1 pt-2;
}
.cart-summary__totals-row {
  @apply flex items-center justify-between text-sm text-on-surface-variant;
}
.cart-summary__totals-row--total {
  @apply text-base font-semibold text-on-surface;
}
</style>
