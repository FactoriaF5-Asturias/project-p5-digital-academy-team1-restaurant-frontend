<script setup>
// Responsabilidad: selector de periodo en forma de botones segmentados.
// El periodo elegido se comparte con el padre mediante v-model.

defineProps({
  options: {
    type: Array,
    required: true,
  },
})

const selectedPeriod = defineModel({ type: String, required: true })
</script>

<template>
  <div class="period-selector" role="group" aria-label="Periodo del resumen">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="period-selector__option"
      :class="{ 'period-selector__option--active': option.value === selectedPeriod }"
      :aria-pressed="option.value === selectedPeriod"
      @click="selectedPeriod = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
@reference "../style.css";

.period-selector {
  @apply inline-flex overflow-hidden rounded-lg border border-outline;
}

/* 44px de alto: tamaño mínimo cómodo para el tacto */
.period-selector__option {
  @apply min-h-11 px-4 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high;
}

.period-selector__option--active {
  @apply bg-primary-container font-semibold text-primary hover:bg-primary-container;
}
</style>