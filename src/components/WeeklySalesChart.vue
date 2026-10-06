<script setup>
import { computed } from 'vue'
import { SALES_CHANNELS, WEEK_DAYS } from '../constants/salesKpi'
import { formatCurrency } from '../utils/formatCurrency'

// Responsabilidad: gráfico de barras de lunes a domingo con las ventas
// de cada canal y el día de mayor volumen señalado.

const props = defineProps({
  // [{ day: 'MONDAY', inStore: 120, delivery: 80 }, ...]
  weekly: {
    type: Array,
    required: true,
  },
  peakDay: {
    type: String,
    default: null,
  },
})

const FULL_HEIGHT_PERCENT = 100

const days = computed(() =>
  WEEK_DAYS.map((weekDay) => {
    const sales = props.weekly.find((entry) => entry.day === weekDay.key) ?? {}
    return {
      ...weekDay,
      isPeak: weekDay.key === props.peakDay,
      values: SALES_CHANNELS.map((channel) => ({
        ...channel,
        amount: sales[channel.key] ?? 0,
      })),
    }
  })
)

// La barra más alta de la semana ocupa el 100 % del alto.
const maxAmount = computed(() =>
  Math.max(1, ...days.value.flatMap((day) => day.values.map((value) => value.amount)))
)

function getBarHeight(amount) {
  return `${(amount / maxAmount.value) * FULL_HEIGHT_PERCENT}%`
}

function getDayDescription(day) {
  const amounts = day.values
    .map((value) => `${value.shortLabel}: ${formatCurrency(value.amount)}`)
    .join(', ')
  return `${day.label}${day.isPeak ? ' (día pico)' : ''}. ${amounts}`
}
</script>

<template>
  <div class="weekly-chart">
    <h3 class="weekly-chart__title">Ventas de la semana</h3>

    <ul class="weekly-chart__legend" aria-hidden="true">
      <li v-for="channel in SALES_CHANNELS" :key="channel.key" class="weekly-chart__legend-item">
        <span class="weekly-chart__swatch" :class="`weekly-chart__bar--${channel.modifier}`"></span>
        {{ channel.shortLabel }}
      </li>
    </ul>

    <ul class="weekly-chart__days">
      <li
        v-for="day in days"
        :key="day.key"
        class="weekly-chart__day"
        :class="{ 'weekly-chart__day--peak': day.isPeak }"
        :title="getDayDescription(day)"
      >
        <span class="sr-only">{{ getDayDescription(day) }}</span>
        <span v-if="day.isPeak" class="weekly-chart__peak" aria-hidden="true">Pico</span>

        <span class="weekly-chart__bars" aria-hidden="true">
          <span
            v-for="value in day.values"
            :key="value.key"
            class="weekly-chart__bar"
            :class="`weekly-chart__bar--${value.modifier}`"
            :style="{ height: getBarHeight(value.amount) }"
          ></span>
        </span>

        <span class="weekly-chart__day-label" aria-hidden="true">{{ day.shortLabel }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@reference "../style.css";

.weekly-chart__title {
  @apply mb-1 text-sm font-semibold text-on-surface;
}

.weekly-chart__legend {
  @apply mb-4 flex gap-3 text-xs text-on-surface-variant;
}

.weekly-chart__legend-item {
  @apply flex items-center gap-1;
}

.weekly-chart__swatch {
  @apply inline-block h-2.5 w-2.5 rounded-sm;
}

.weekly-chart__days {
  @apply flex items-end gap-2 border-b border-outline-variant;
}

.weekly-chart__day {
  @apply relative flex flex-1 flex-col items-center;
}

.weekly-chart__peak {
  @apply absolute -top-4 text-[11px] font-semibold text-on-surface;
}

.weekly-chart__bars {
  @apply flex h-20 items-end gap-0.5;
}

.weekly-chart__bar {
  @apply w-2 rounded-t;
}

.weekly-chart__bar--in-store {
  @apply bg-primary;
}

.weekly-chart__bar--delivery {
  @apply bg-tertiary;
}

.weekly-chart__day-label {
  @apply mt-1 text-xs text-on-surface-variant;
}

.weekly-chart__day--peak .weekly-chart__day-label {
  @apply font-semibold text-on-surface;
}
</style>