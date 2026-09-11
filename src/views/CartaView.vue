<template>
  <main class="carta-view">
    <h1 class="carta-view__title">Nuestra carta</h1>

    <p v-if="isLoading" class="carta-view__status">Cargando la carta...</p>
    <p v-else-if="error" class="carta-view__status carta-view__status--error">{{ error }}</p>

    <template v-else>
      <p v-if="products.length === 0" class="carta-view__status">
        No hay productos disponibles.
      </p>

      <div v-else class="carta-view__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </template>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProducts } from '../composables/useProducts'
import ProductCard from '../components/ProductCard.vue'
import PaginationControl from '../components/PaginationControl.vue'

const { products, isLoading, error, currentPage, totalPages, fetchProducts, goToPage } = useProducts()

onMounted(() => {
  fetchProducts(1)
})

function handleAddToCart(payload) {
  console.log('[CartaView] add-to-cart', payload)
}
</script>

<style scoped>
@reference "../style.css";

.carta-view {
  @apply max-w-5xl mx-auto px-4 sm:px-6 py-8;
}

.carta-view__title {
  @apply text-2xl font-heading mb-6;
}

.carta-view__status {
  @apply text-center text-text py-12;
}

.carta-view__status--error {
  @apply text-red-600;
}

.carta-view__grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
}
</style>
