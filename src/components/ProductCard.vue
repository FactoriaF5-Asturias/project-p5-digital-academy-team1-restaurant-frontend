<script setup>
import { ref, computed } from 'vue'

// Recibe un producto y emite add-to-cart con la cantidad elegida.
// No conoce el store de la cesta (eso llega en GSF-06): queda desacoplado.
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart'])

const quantity = ref(1)

const formattedPrice = computed(() =>
  props.product.price.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  })
)

function increaseQuantity() {
  quantity.value += 1
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

function handleAddToCart() {
  emit('add-to-cart', { product: props.product, quantity: quantity.value })
  quantity.value = 1
}
</script>

<template>
  <article class="product-card">
    <img
      class="product-card__image"
      :src="product.imageUrl"
      :alt="`Foto de ${product.name}`"
      loading="lazy"
    />

    <div class="product-card__body">
      <h3 class="product-card__title">{{ product.name }}</h3>
      <p class="product-card__description">{{ product.description }}</p>
      <p class="product-card__price">{{ formattedPrice }}</p>

      <div class="product-card__footer">
        <div
          class="product-card__quantity"
          role="group"
          :aria-label="`Cantidad de ${product.name}`"
        >
          <button
            type="button"
            class="product-card__quantity-btn"
            :disabled="quantity <= 1"
            aria-label="Reducir cantidad"
            @click="decreaseQuantity"
          >
            −
          </button>
          <span class="product-card__quantity-value" aria-live="polite">{{ quantity }}</span>
          <button
            type="button"
            class="product-card__quantity-btn"
            aria-label="Aumentar cantidad"
            @click="increaseQuantity"
          >
            +
          </button>
        </div>

        <button type="button" class="product-card__add-btn" @click="handleAddToCart">
          Añadir
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  @apply flex flex-col overflow-hidden rounded-lg border border-border bg-bg text-left shadow-sm transition-shadow hover:shadow-md;
}
.product-card__image {
  @apply h-40 w-full object-cover;
}
.product-card__body {
  @apply flex flex-1 flex-col gap-2 p-4;
}
.product-card__title {
  @apply font-heading text-lg font-medium text-text-h;
}
.product-card__description {
  @apply flex-1 text-sm text-text;
}
.product-card__price {
  @apply font-heading text-base font-semibold text-accent;
}
.product-card__footer {
  @apply mt-2 flex items-center justify-between gap-2;
}
.product-card__quantity {
  @apply flex items-center gap-2 rounded-full border border-border px-2 py-1;
}
.product-card__quantity-btn {
  @apply flex h-6 w-6 items-center justify-center rounded-full text-text-h transition-colors hover:bg-accent-bg disabled:cursor-not-allowed disabled:opacity-40;
}
.product-card__quantity-value {
  @apply w-4 text-center text-sm;
}
.product-card__add-btn {
  @apply rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent;
}
</style>
