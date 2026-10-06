<template>
  <Hero />

  <main id="productos-carta" class="carta-view">
    <h1 class="carta-view__title">Nuestra carta</h1>

    <LoadingSpinner v-if="isLoading" label="Cargando la carta..." />
    <p v-else-if="error" class="carta-view__status carta-view__status--error">
      {{ error }}
    </p>

    <template v-else>
      <p v-if="products.length === 0" class="carta-view__status">
        No hay productos disponibles.
      </p>

      <div v-else class="carta-view__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
                    :readonly="isReadOnlyMenu"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="handleChangePage"
      />
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useProducts } from "../composables/useProducts";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { ROLES } from "../constants/roles";
import ProductCard from "../components/ProductCard.vue";
import PaginationControl from "../components/PaginationControl.vue";
import Hero from "../components/Hero.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const {
  products,
  isLoading,
  error,
  currentPage,
  totalPages,
  fetchProducts,
  goToPage,
} = useProducts();
const cartStore = useCartStore();
const authStore = useAuthStore();

// Solo el invitado y el cliente pueden hacer pedidos (los mismos que entran en /cesta).
// Admin, cocina y reparto ven la carta sin cantidad ni botón "Añadir".
const ROLES_THAT_CAN_ORDER = [ROLES.GUEST, ROLES.CUSTOMER];
const isReadOnlyMenu = computed(
  () => !ROLES_THAT_CAN_ORDER.includes(authStore.role),
);

onMounted(() => {
  fetchProducts(1);
});

function handleAddToCart({ product, quantity }) {
  cartStore.addProduct(product);
  for (let i = 1; i < quantity; i++) {
    cartStore.incrementQuantity(product.id);
  }
}

// Al cambiar de página, subimos la vista al principio: si no, el usuario
// se queda abajo del todo, justo donde ha pulsado el control de
// paginación, sin ver ninguno de los productos de la página nueva hasta
// hacer scroll manualmente hacia arriba.
function handleChangePage(page) {
  goToPage(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  @apply text-center text-on-surface-variant py-12;
}

.carta-view__status--error {
  @apply text-red-600;
}

.carta-view__grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
}
</style>