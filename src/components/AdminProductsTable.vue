<script setup>
import { CATEGORY_LABELS } from '../constants/productCategories'
import { formatCurrency } from '../utils/formatCurrency'

// Tabla de productos del panel de administración.
// Solo pinta la lista que recibe y avisa al padre de lo que pulsa el usuario:
// no llama al backend ni sabe de filtros o paginación.
defineProps({
  products: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['toggle-availability', 'edit', 'delete'])

const TABLE_COLUMNS_COUNT = 5
</script>

<template>
  <table class="products-table">
    <thead>
      <tr class="products-table__head-row">
        <th class="products-table__cell">Producto</th>
        <th class="products-table__cell">Categoría</th>
        <th class="products-table__cell">Precio</th>
        <th class="products-table__cell">Estado</th>
        <th class="products-table__cell products-table__cell--right">Acciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="products.length === 0">
        <td :colspan="TABLE_COLUMNS_COUNT" class="products-table__empty">No hay productos en esta categoría.</td>
      </tr>

      <tr v-for="product in products" :key="product.id" class="products-table__row">
        <td class="products-table__cell">
          <p class="products-table__name">{{ product.name }}</p>
          <p class="products-table__description">{{ product.description }}</p>
        </td>

        <td class="products-table__cell products-table__category">
          {{ CATEGORY_LABELS[product.category] }}
        </td>

        <td class="products-table__cell products-table__price">
          {{ formatCurrency(product.price) }}
        </td>

        <td class="products-table__cell">
          <span :class="['products-table__badge', { 'products-table__badge--active': product.available }]">
            <span
              :class="['products-table__dot', { 'products-table__dot--active': product.available }]"
              aria-hidden="true"
            ></span>
            {{ product.available ? 'Activo' : 'Desactivado' }}
          </span>
        </td>

        <td class="products-table__cell products-table__cell--right">
          <div class="products-table__actions">
            <button
              type="button"
              class="products-table__toggle-button"
              @click="emit('toggle-availability', product)"
            >
              {{ product.available ? 'Desactivar' : 'Activar' }}
            </button>
            <button
              type="button"
              class="products-table__icon-button products-table__icon-button--edit"
              aria-label="Editar producto"
              title="Editar"
              @click="emit('edit', product)"
            >
              ✏️
            </button>
            <button
              type="button"
              class="products-table__icon-button products-table__icon-button--delete"
              aria-label="Eliminar producto"
              title="Eliminar"
              @click="emit('delete', product)"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
@reference "../style.css";

.products-table {
  @apply w-full text-sm;
}

.products-table__head-row {
  @apply text-left text-on-surface-variant uppercase text-xs border-b border-outline;
}

.products-table__cell {
  @apply py-3 pr-3 align-middle;
}

.products-table__cell--right {
  @apply text-right whitespace-nowrap;
}

.products-table__row {
  @apply border-b border-outline last:border-0;
}

.products-table__empty {
  @apply py-6 text-center text-on-surface-variant;
}

.products-table__name {
  @apply font-semibold text-on-surface;
}

.products-table__description {
  @apply text-on-surface-variant text-xs;
}

.products-table__category {
  @apply text-on-surface-variant;
}

.products-table__price {
  @apply font-semibold text-on-surface;
}

.products-table__badge {
  @apply inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant;
}

.products-table__badge--active {
  @apply bg-secondary-container text-secondary;
}

.products-table__dot {
  @apply w-1.5 h-1.5 rounded-full bg-on-surface-variant;
}

.products-table__dot--active {
  @apply bg-secondary;
}

.products-table__actions {
  @apply inline-flex items-center gap-2;
}

.products-table__toggle-button {
  @apply text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline hover:bg-surface-container-high transition;
}

.products-table__icon-button {
  @apply w-8 h-8 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant transition;
}

.products-table__icon-button--edit {
  @apply hover:text-primary hover:border-primary/50;
}

.products-table__icon-button--delete {
  @apply hover:text-error hover:border-error/50;
}
</style>