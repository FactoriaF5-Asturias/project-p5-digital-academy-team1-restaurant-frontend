<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  hasMetrics: {
    type: Boolean,
    default: true
  }
})

const metrics = {
  activeOrders: 12,
  averagePreparationTime: 18,
  lineStatus: {
    preparing: 7,
    delayed: 2,
    ready: 3
  }
}
</script>

<template>
  <section>
    <h1 class="mb-6">Dashboard de Cocina</h1>

    <p
      v-if="props.isLoading"
      class="card p-6 text-on-surface-variant"
    >
      Cargando métricas de cocina...
    </p>

    <p
      v-else-if="props.error"
      class="card p-6 text-error"
    >
      {{ props.error }}
    </p>

    <p
      v-else-if="!props.hasMetrics"
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
          {{ metrics.activeOrders }}
        </p>
      </article>

      <article class="card p-6">
        <p class="text-on-surface-variant">
          Tiempo medio prep
        </p>

        <p class="mt-2 text-3xl font-bold text-on-surface">
          {{ metrics.averagePreparationTime }} min
        </p>
      </article>

      <article class="card p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-on-surface-variant">
            Estado de línea
          </p>

          <span
            v-if="metrics.lineStatus.delayed > 0"
            class="rounded-full px-3 py-1 text-sm font-medium text-error"
          >
            {{ metrics.lineStatus.delayed }} con retraso
          </span>
        </div>

        <div class="mt-4 space-y-2 text-on-surface">
          <p>
            En preparación: {{ metrics.lineStatus.preparing }}
          </p>

          <p>
            Con retraso: {{ metrics.lineStatus.delayed }}
          </p>

          <p>
            Listas para pase: {{ metrics.lineStatus.ready }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>