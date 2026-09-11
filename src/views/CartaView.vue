<script setup>
import { onMounted, computed } from 'vue'
import { useProducts } from '../composables/useProducts'
import { CATEGORY_LABELS, PRODUCT_CATEGORIES } from '../mocks/products.mock'
import ProductCard from '../components/ProductCard.vue'

const { products, isLoading, error, fetchProducts } = useProducts()

onMounted(fetchProducts)

// Orden: Especialidades, Bebidas, Postres.
const orderedCategories = [
  PRODUCT_CATEGORIES.SUSHI,
  PRODUCT_CATEGORIES.DRINKS,
  PRODUCT_CATEGORIES.DESSERTS,
]

const productsByCategory = computed(() =>
  orderedCategories.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: products.value.filter((product) => product.category === category),
  }))
)

function handleAddToCart({ product, quantity }) {
  // TODO: conectar con el store de Pinia de la cesta cuando exista.
  console.log('[CartaView] Añadir a la cesta (pendiente de GSF-06):', product.name, quantity)
}
</script>

<template>
  <main class="carta">
    <h1 class="sr-only">Carta</h1>

    <p v-if="isLoading" class="carta__status" role="status">Cargando la carta...</p>

    <p v-else-if="error" class="carta__status carta__status--error" role="alert">
      {{ error }}
    </p>

    <template v-else>
      <section
        v-for="group in productsByCategory"
        :key="group.category"
        class="carta__section"
        :aria-labelledby="`carta-${group.category.toLowerCase()}`"
      >
        <h2 :id="`carta-${group.category.toLowerCase()}`" class="carta__section-title">
          {{ group.label }}
        </h2>

        <p v-if="group.items.length === 0" class="carta__empty">
          No hay productos disponibles en esta categoría por ahora.
        </p>

        <div v-else class="carta__grid">
          <ProductCard
            v-for="product in group.items"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
@reference "../style.css";
.carta {
  @apply mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8;
}
.carta__status {
  @apply py-16 text-center text-base text-text;
}
.carta__status--error {
  @apply text-red-600;
}
.carta__section-title {
  @apply mb-4 font-heading text-2xl font-medium text-text-h;
}
.carta__empty {
  @apply text-sm text-text;
}
.carta__grid {
  @apply grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3;
}
</style>
