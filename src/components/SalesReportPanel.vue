<script setup>
import { computed, ref, watch } from 'vue'
import { DEFAULT_REPORT_PERIOD, REPORT_PERIOD_OPTIONS } from '../constants/reportPeriods'
import { formatPeriodRange, getPeriodRange } from '../utils/reportPeriodRange'
import { useSalesSummary } from '../composables/useSalesSummary'
import { useSalesReportDownload } from '../composables/useSalesReportDownload'
import PeriodSelector from './PeriodSelector.vue'
import SalesSummaryCards from './SalesSummaryCards.vue'
import LoadingSpinner from './LoadingSpinner.vue'

// Responsabilidad: coordinar el resumen de ventas. Une el selector de periodo,
// los indicadores y el botón de descarga del PDF.

const selectedPeriod = ref(DEFAULT_REPORT_PERIOD)

const periodText = computed(() => formatPeriodRange(getPeriodRange(selectedPeriod.value)))

const { summary, isLoading, loadError, averageTicket, loadSummary } = useSalesSummary()
const { isDownloading, downloadError, downloadReport } = useSalesReportDownload()

watch(selectedPeriod, loadSummary, { immediate: true })

function handleDownload() {
  downloadReport(selectedPeriod.value)
}
</script>

<template>
  <section class="sales-report" aria-labelledby="sales-report-title">
    <h2 id="sales-report-title" class="sales-report__title">Resumen de ventas</h2>
    <p class="sales-report__period">{{ periodText }}</p>

    <PeriodSelector v-model="selectedPeriod" :options="REPORT_PERIOD_OPTIONS" />

    <LoadingSpinner v-if="isLoading" label="Cargando resumen de ventas..." />
    <p v-else-if="loadError" class="sales-report__error">{{ loadError }}</p>
    <SalesSummaryCards
      v-else-if="summary"
      :revenue="summary.revenue"
      :orders="summary.orders"
      :average-ticket="averageTicket"
    />

    <div class="sales-report__actions">
      <button
        type="button"
        class="sales-report__download"
        :disabled="isDownloading"
        @click="handleDownload"
      >
        <span class="material-symbols-outlined" aria-hidden="true">download</span>
        {{ isDownloading ? 'Generando PDF...' : 'Descargar resumen (PDF)' }}
      </button>

      <p v-if="downloadError" class="sales-report__error" role="alert">{{ downloadError }}</p>
    </div>
  </section>
</template>

<style scoped>
@reference "../style.css";

.sales-report {
  @apply flex max-w-2xl flex-col gap-4 rounded-xl border border-outline bg-white p-5;
}

.sales-report__title {
  @apply font-heading text-xl font-bold text-on-surface;
}

.sales-report__period {
  @apply -mt-3 text-sm text-on-surface-variant;
}

.sales-report__error {
  @apply text-sm text-error;
}

.sales-report__actions {
  @apply flex flex-col items-start gap-2;
}

.sales-report__download {
  @apply inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60;
}
</style>