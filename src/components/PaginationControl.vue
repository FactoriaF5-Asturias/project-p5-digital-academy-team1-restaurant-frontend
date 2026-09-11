<template>
  <nav class="pagination-control" aria-label="Paginación de la carta">
    <button
      type="button"
      class="pagination-control__button pagination-control__button--prev"
      :disabled="currentPage <= 1"
      @click="$emit('change-page', currentPage - 1)"
    >
      Anterior
    </button>

    <span class="pagination-control__status" aria-live="polite">
      Página {{ currentPage }} de {{ totalPages }}
    </span>

    <button
      type="button"
      class="pagination-control__button pagination-control__button--next"
      :disabled="currentPage >= totalPages"
      @click="$emit('change-page', currentPage + 1)"
    >
      Siguiente
    </button>
  </nav>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

defineEmits(['change-page'])
</script>

<style scoped>
@reference "../style.css";

.pagination-control {
  @apply flex items-center justify-center gap-4 py-6;
}

.pagination-control__button {
  @apply px-4 py-2 rounded-lg border border-border bg-bg text-text transition-colors;
  @apply hover:bg-accent-bg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-bg;
}

.pagination-control__status {
  @apply text-sm text-text;
}
</style>
