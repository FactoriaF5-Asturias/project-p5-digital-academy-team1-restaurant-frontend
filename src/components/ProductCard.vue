<script setup>
import { ref, computed, onUnmounted } from 'vue'
import ProductImage from './ProductImage.vue'

// Recibe un producto y emite add-to-cart con la cantidad elegida.
// No conoce el store de la cesta (eso llega en otra parte): queda desacoplado.
// Con readonly solo muestra el plato (foto, nombre, descripción y precio),
// sin cantidad ni botón "Añadir": lo decide quien la usa, según el rol.
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add-to-cart'])

const quantity = ref(1)

// Estado de feedback visual tras pulsar "Añadir": se activa al confirmar
// y se desactiva solo, pasado un tiempo, sin bloquear nada más de la tarjeta.
const justAdded = ref(false)
const FEEDBACK_DURATION_MS = 1500
let feedbackTimeoutId = null

const formattedPrice = computed(() =>
  props.product.price.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  })
)

// El backend solo guarda el nombre del archivo (p. ej. "hello-edamame.png"),
// servido desde public/products/. Si en cambio llega una URL completa
// (como las usadas en tests, o un futuro storage externo), se usa tal cual.
const imageSrc = computed(() => {
  const url = props.product.imageUrl
  if (!url) return ''
  return url.startsWith('http') ? url : `/products/${url}`
})

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

  justAdded.value = true
  clearTimeout(feedbackTimeoutId)
  feedbackTimeoutId = setTimeout(() => {
    justAdded.value = false
  }, FEEDBACK_DURATION_MS)
}

// Evita que el timeout intente tocar un componente ya destruido
// (por ejemplo, si el usuario cambia de página justo tras pulsar).
onUnmounted(() => {
  clearTimeout(feedbackTimeoutId)
})
</script>

<template>
  <article class="product-card">
    <ProductImage
      class="product-card__image"
      :src="imageSrc"
      :alt="`Foto de ${product.name}`"
    />

    <div class="product-card__body">
      <h3 class="product-card__title">{{ product.name }}</h3>
      <p class="product-card__description">{{ product.description }}</p>
      <p class="product-card__price">{{ formattedPrice }}</p>

      <div v-if="!readonly" class="product-card__footer">
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

        <button
          type="button"
          class="product-card__add-btn"
          :class="{ 'product-card__add-btn--added': justAdded }"
          :disabled="justAdded"
          @click="handleAddToCart"
        >
          {{ justAdded ? 'Añadido ✓' : 'Añadir' }}
        </button>
      </div>

      <span class="sr-only" role="status" aria-live="polite">
        {{ justAdded ? `${product.name} añadido a la cesta` : '' }}
      </span>
    </div>
  </article>
</template>

<style scoped>
@reference "../style.css";
.product-card {
  @apply flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface text-left shadow-sm transition-shadow hover:shadow-md;
}
.product-card__image {
  @apply h-40 w-full object-cover;
}
.product-card__body {
  @apply flex flex-1 flex-col gap-2 p-4;
}
.product-card__title {
  @apply font-heading text-lg font-medium text-on-surface;
}
.product-card__description {
  @apply flex-1 text-sm text-on-surface-variant;
}
.product-card__price {
  @apply font-heading text-base font-semibold text-primary;
}
.product-card__footer {
  @apply mt-2 flex items-center justify-between gap-2;
}
.product-card__quantity {
  @apply flex items-center gap-1 rounded-full border border-outline-variant px-1;
}
/* 44x44px: tamaño mínimo cómodo para el tacto */
.product-card__quantity-btn {
  @apply flex h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40;
}
.product-card__quantity-value {
  @apply w-4 text-center text-sm;
}
.product-card__add-btn {
  @apply min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-80;
}
.product-card__add-btn--added {
  @apply bg-primary;
}
</style>