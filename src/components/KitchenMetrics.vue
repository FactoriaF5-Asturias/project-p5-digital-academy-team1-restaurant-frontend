<script setup>
import LoadingSpinner from './LoadingSpinner.vue'

defineProps({
  metrics: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <section>
    <h1 class="mb-6">Dashboard de Cocina</h1>

    <LoadingSpinner
      v-if="isLoading"
      class="card"
      label="Cargando métricas de cocina..."
    />

    <p
      v-else-if="error"
      class="card p-6 text-error"
    >
      {{ error }}
    </p>

    <p
      v-else-if="!metrics"
      class="card p-6 text-on-surface-variant"
    >
      No hay métricas de cocina disponibles.
    </p>

    <div
      v-else
      class="grid gap-4 md:grid-cols-3"
    >
      <article class="card p-6">
        <p class="text-on-surface-variant">
          Comandas activas
        </p>

        <p class="mt-2 text-3xl font-bold text-on-surface">
          {{ metrics.totalActiveOrders }}
        </p>
      </article>

      <article class="card p-6">
        <p class="text-on-surface-variant">
          Tiempo medio prep
        </p>

        <p class="mt-2 text-3xl font-bold text-on-surface">
          {{ metrics.averagePreparationMinutes }} min
        </p>
      </article>

      <article class="card p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-on-surface-variant">
            Estado de línea
          </p>

          <span
            v-if="metrics.delayedCount > 0"
            class="rounded-full px-3 py-1 text-sm font-medium text-error"
          >
            {{ metrics.delayedCount }} con retraso
          </span>
        </div>

        <div class="mt-4 space-y-2 text-on-surface">
          <p>
            En preparación: {{ metrics.processingCount }}
          </p>

          <p>
            Con retraso: {{ metrics.delayedCount }}
          </p>

          <p>
            Listas para pase: {{ metrics.readyCount }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>