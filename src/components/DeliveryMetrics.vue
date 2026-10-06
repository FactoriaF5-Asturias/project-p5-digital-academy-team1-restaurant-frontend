<script setup>
import { computed } from 'vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
  },
})

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 1,
})

const cards = computed(() => [
  {
    key: 'ready',
    label: 'Listos para recogida',
    value: numberFormatter.format(props.metrics.readyCount),
  },
  {
    key: 'in-transit',
    label: 'En tránsito',
    value: numberFormatter.format(props.metrics.inTransitCount),
  },
  {
    key: 'delivered',
    label: 'Entregados hoy',
    value: numberFormatter.format(props.metrics.deliveredTodayCount),
  },
  {
    key: 'average',
    label: 'Tiempo promedio',
    value:
      props.metrics.deliveredTodayCount === 0
        ? '—'
        : `${numberFormatter.format(props.metrics.averageDeliveryMinutes)} min`,
    description:
      props.metrics.deliveredTodayCount === 0
        ? 'Sin entregas hoy para calcular el promedio.'
        : 'Desde la creación del pedido hasta su entrega.',
  },
])
</script>

<template>
  <section aria-label="Resumen de reparto">
    <dl class="delivery-metrics">
      <div
        v-for="card in cards"
        :key="card.key"
        class="delivery-metrics__card"
        :data-testid="`metric-${card.key}`"
      >
        <dt class="delivery-metrics__label">
          {{ card.label }}
        </dt>

        <dd class="delivery-metrics__value">
          {{ card.value }}
        </dd>

        <dd
          v-if="card.description"
          class="delivery-metrics__description"
        >
          {{ card.description }}
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
@reference "../style.css";

.delivery-metrics {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4;
}

.delivery-metrics__card {
  @apply rounded-xl border border-outline bg-surface-container p-5;
}

.delivery-metrics__label {
  @apply text-sm font-medium text-on-surface;
}

.delivery-metrics__value {
  @apply mt-3 text-3xl font-semibold text-primary;
}

.delivery-metrics__description {
  @apply mt-2 text-sm text-on-surface;
}
</style>