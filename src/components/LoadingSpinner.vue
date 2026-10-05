<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <span class="loading-spinner__circle" aria-hidden="true"></span>
    <span class="loading-spinner__label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Cargando...',
  },
})
</script>

<style scoped>
@reference "../style.css";

.loading-spinner {
  @apply flex flex-col items-center justify-center gap-3 py-10;
}

.loading-spinner__circle {
  @apply w-10 h-10 rounded-full border-4 border-outline border-t-primary animate-spin;
}

.loading-spinner__label {
  @apply text-sm text-on-surface-variant;
}
</style>