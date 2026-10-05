<script setup>
// Botones para filtrar por categoría, con el número de productos de cada una.
// Recibe las opciones ya preparadas y la categoría activa; solo avisa al padre
// de cuál se ha pulsado. No sabe nada de productos ni de paginación.
defineProps({
  options: {
    type: Array,
    required: true,
  },
  activeCategory: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['select-category'])
</script>

<template>
  <div class="category-filters" role="group" aria-label="Filtrar por categoría">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="['category-filters__button', { 'category-filters__button--active': option.value === activeCategory }]"
      :aria-pressed="option.value === activeCategory"
      @click="emit('select-category', option.value)"
    >
      {{ option.label }} ({{ option.count }})
    </button>
  </div>
</template>

<style scoped>
@reference "../style.css";

.category-filters {
  @apply flex flex-wrap gap-2 mb-4;
}

.category-filters__button {
  @apply px-3 py-1.5 rounded-full text-sm font-semibold border transition bg-surface-variant text-on-surface-variant border-outline hover:border-primary/50;
}

.category-filters__button--active {
  @apply bg-primary text-on-primary border-primary hover:border-primary;
}
</style>