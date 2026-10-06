<script setup>
import { computed, ref, watch } from 'vue'

// Responsabilidad: mostrar la foto de un producto o, si no tiene foto
// o no se puede cargar, una imagen genérica de "Foto no disponible".

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    required: true,
  },
})

const hasLoadError = ref(false)

const showsPlaceholder = computed(() => !props.src || hasLoadError.value)

// Si cambia la foto (p. ej. al paginar), se vuelve a intentar cargar.
watch(
  () => props.src,
  () => {
    hasLoadError.value = false
  }
)

function handleError() {
  hasLoadError.value = true
}
</script>

<template>
  <img
    v-if="!showsPlaceholder"
    class="product-image"
    :src="src"
    :alt="alt"
    loading="lazy"
    @error="handleError"
  />

  <div
    v-else
    class="product-image product-image--placeholder"
    role="img"
    :aria-label="`${alt}: foto no disponible`"
  >
    <!-- Icono "photo-off" de Tabler Icons (licencia MIT) -->
    <svg
      class="product-image__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M15 8h.01" />
      <path d="M7 3h11a3 3 0 0 1 3 3v11m-.856 3.099a2.991 2.991 0 0 1 -2.144 .901h-12a3 3 0 0 1 -3 -3v-12c0 -.845 .349 -1.608 .91 -2.153" />
      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
      <path d="M16.33 12.338c.574 -.054 1.155 .166 1.67 .662l3 3" />
      <path d="M3 3l18 18" />
    </svg>

    <span class="product-image__text">Foto no disponible</span>
  </div>
</template>

<style scoped>
@reference "../style.css";

.product-image {
  @apply w-full object-cover;
}

.product-image--placeholder {
  @apply flex flex-col items-center justify-center gap-2 bg-surface-variant text-on-surface-variant;
}

.product-image__icon {
  @apply h-8 w-8 opacity-70;
}

.product-image__text {
  @apply text-xs;
}
</style>