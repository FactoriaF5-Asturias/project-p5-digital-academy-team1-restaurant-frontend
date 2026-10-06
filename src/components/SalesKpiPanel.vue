<script setup>
import { onMounted } from 'vue'
import { useSalesKpi } from '../composables/useSalesKpi'
import KpiTiles from './KpiTiles.vue'
import ChannelSplitBar from './ChannelSplitBar.vue'
import WeeklySalesChart from './WeeklySalesChart.vue'
import LoadingSpinner from './LoadingSpinner.vue'

// Responsabilidad: coordinar la sección "KPI de ventas". Pide los datos
// y los reparte entre los indicadores, el reparto por canal y el gráfico semanal.

const { kpi, isLoading, loadError, loadKpi } = useSalesKpi()

onMounted(loadKpi)
</script>

<template>
  <section class="sales-kpi" aria-labelledby="sales-kpi-title">
    <h2 id="sales-kpi-title" class="sales-kpi__title">KPI de ventas</h2>

    <LoadingSpinner v-if="isLoading" label="Cargando KPI de ventas..." />
    <p v-else-if="loadError" class="sales-kpi__error">{{ loadError }}</p>

    <template v-else-if="kpi">
      <KpiTiles :totals="kpi" />
      <ChannelSplitBar :channels="kpi.channels" />
      <WeeklySalesChart :weekly="kpi.weekly" :peak-day="kpi.peakDay" />
    </template>
  </section>
</template>

<style scoped>
@reference "../style.css";

.sales-kpi {
  @apply flex max-w-2xl flex-col gap-5 rounded-xl border border-outline bg-white p-5;
}

.sales-kpi__title {
  @apply font-heading text-xl font-bold text-on-surface;
}

.sales-kpi__error {
  @apply text-sm text-error;
}
</style>