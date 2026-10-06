<script setup>
// Responsabilidad: indicador de carga común de toda la app (un maki que gira
// con vapor) acompañado de un mensaje que dice qué se está cargando.
defineProps({
  label: {
    type: String,
    default: 'Cargando...',
  },
})
</script>

<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <div class="loading-spinner__animation" aria-hidden="true">
      <div class="loading-spinner__steam">
        <span class="loading-spinner__steam-line"></span>
        <span class="loading-spinner__steam-line"></span>
        <span class="loading-spinner__steam-line"></span>
      </div>

      <div class="loading-spinner__maki">
        <div class="loading-spinner__rice">
          <div class="loading-spinner__filling"></div>
        </div>
      </div>
    </div>

    <span class="loading-spinner__label">{{ label }}</span>
  </div>
</template>

<style scoped>
@reference "../style.css";

.loading-spinner {
  @apply flex flex-col items-center justify-center gap-3 py-10;
}

.loading-spinner__animation {
  @apply flex flex-col items-center gap-1;
}

.loading-spinner__steam {
  @apply flex h-3.5 gap-1.5;
}

.loading-spinner__steam-line {
  @apply h-3 w-1 rounded-full bg-outline;
  animation: loading-spinner-steam 1.4s ease-in-out infinite;
}

.loading-spinner__steam-line:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-spinner__steam-line:nth-child(3) {
  animation-delay: 0.4s;
}

/* Alga nori (exterior oscuro) */
.loading-spinner__maki {
  @apply flex h-13 w-13 items-center justify-center rounded-full bg-[#1f2a24];
  animation: loading-spinner-roll 1.6s cubic-bezier(0.6, 0.1, 0.4, 0.9) infinite;
}

.loading-spinner__rice {
  @apply flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest;
}

/* Relleno de salmón */
.loading-spinner__filling {
  @apply h-4 w-4 rounded-[5px] bg-[#f08069] shadow-[inset_-4px_-3px_0_var(--color-primary)];
}

.loading-spinner__label {
  @apply text-sm text-on-surface-variant;
}

@keyframes loading-spinner-roll {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(200deg) scale(1.08);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes loading-spinner-steam {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(4px);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* Accesibilidad: sin animación para quien la tenga desactivada en su sistema */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner__maki,
  .loading-spinner__steam-line {
    animation: none;
  }
}
</style>