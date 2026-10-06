<script setup>
import { SALES_CHANNELS } from '../constants/salesKpi'
import { formatRoundedCurrency } from '../utils/formatCurrency'

// Responsabilidad: mostrar el reparto de ventas entre Sala y Domicilio
// en una barra dividida, con porcentaje y euros en la leyenda.

defineProps({
  // { inStore: { revenue, percentage }, delivery: { revenue, percentage } }
  channels: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="channel-split">
    <h3 class="channel-split__title">Ventas por canal</h3>

    <div class="channel-split__bar" aria-hidden="true">
      <span
        v-for="channel in SALES_CHANNELS"
        :key="channel.key"
        class="channel-split__segment"
        :class="`channel-split__segment--${channel.modifier}`"
        :style="{ width: `${channels[channel.key].percentage}%` }"
      ></span>
    </div>

    <ul class="channel-split__legend">
      <li v-for="channel in SALES_CHANNELS" :key="channel.key" class="channel-split__legend-item">
        <span
          class="channel-split__swatch"
          :class="`channel-split__segment--${channel.modifier}`"
          aria-hidden="true"
        ></span>
        {{ channel.label }} · {{ channels[channel.key].percentage }} % ·
        {{ formatRoundedCurrency(channels[channel.key].revenue) }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
@reference "../style.css";

.channel-split__title {
  @apply mb-2 text-sm font-semibold text-on-surface;
}

.channel-split__bar {
  @apply flex h-3 gap-0.5 overflow-hidden rounded;
}

.channel-split__segment {
  @apply h-full;
}

.channel-split__segment--in-store {
  @apply bg-primary;
}

.channel-split__segment--delivery {
  @apply bg-tertiary;
}

.channel-split__legend {
  @apply mt-2 flex flex-wrap justify-between gap-2 text-xs text-on-surface-variant;
}

.channel-split__legend-item {
  @apply flex items-center gap-1;
}

.channel-split__swatch {
  @apply inline-block h-2.5 w-2.5 rounded-sm;
}
</style>