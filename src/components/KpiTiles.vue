<script setup>
import { computed } from 'vue'
import { KPI_PERIODS } from '../constants/salesKpi'
import { formatRoundedCurrency } from '../utils/formatCurrency'
import { getVariationPercent } from '../utils/salesVariation'

// Responsabilidad: mostrar las ventas de hoy, mes, trimestre y año fiscal
// con su variación respecto al periodo anterior.

const props = defineProps({
  // { today: { revenue, previousRevenue }, month: {...}, quarter: {...}, year: {...} }
  totals: {
    type: Object,
    required: true,
  },
})

const tiles = computed(() =>
  KPI_PERIODS.map((period) => {
    const { revenue, previousRevenue } = props.totals[period.key]
    return {
      ...period,
      revenue,
      variation: getVariationPercent(revenue, previousRevenue),
    }
  })
)
</script>

<template>
  <ul class="kpi-tiles">
    <li v-for="tile in tiles" :key="tile.key" class="kpi-tiles__item">
      <span class="kpi-tiles__label">{{ tile.label }}</span>
      <span class="kpi-tiles__value">{{ formatRoundedCurrency(tile.revenue) }}</span>

      <span
        v-if="tile.variation !== null"
        class="kpi-tiles__variation"
        :class="tile.variation < 0 ? 'kpi-tiles__variation--down' : 'kpi-tiles__variation--up'"
      >
        <span aria-hidden="true">{{ tile.variation < 0 ? '▼' : '▲' }}</span>
        {{ Math.abs(tile.variation) }} %
        <span class="sr-only">{{ tile.variation < 0 ? 'menos' : 'más' }} que el periodo anterior</span>
      </span>
      <span v-else class="kpi-tiles__variation">Sin datos anteriores</span>
    </li>
  </ul>
</template>

<style scoped>
@reference "../style.css";

.kpi-tiles {
  @apply grid grid-cols-2 gap-2 sm:grid-cols-4;
}

.kpi-tiles__item {
  @apply flex flex-col gap-0.5 rounded-lg bg-surface-container-low p-3;
}

.kpi-tiles__label {
  @apply text-xs text-on-surface-variant;
}

.kpi-tiles__value {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.kpi-tiles__variation {
  @apply text-xs text-on-surface-variant;
}

.kpi-tiles__variation--up {
  @apply text-on-secondary-container;
}

.kpi-tiles__variation--down {
  @apply text-on-error-container;
}
</style>