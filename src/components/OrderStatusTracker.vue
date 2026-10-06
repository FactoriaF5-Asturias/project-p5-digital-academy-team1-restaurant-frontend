<script setup>
import { computed } from 'vue'
import { ORDER_STATUS_LABELS } from '../constants/invoiceLabels'
import {
  DELAYED_ORDER_STATUS,
  getCurrentStepIndex,
  getTrackingSteps,
} from '../constants/orderTracking'

// Responsabilidad: mostrar en qué paso está el pedido (cocina y, si es a
// domicilio, reparto) y avisar si cocina lo ha marcado con retraso.

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    required: true,
  },
})

const steps = computed(() => getTrackingSteps(props.channel))
const currentIndex = computed(() => getCurrentStepIndex(steps.value, props.status))
const isDelayed = computed(() => props.status === DELAYED_ORDER_STATUS)

function getStepModifier(index) {
  if (index < currentIndex.value) return 'order-tracker__step--done'
  if (index === currentIndex.value) return 'order-tracker__step--current'
  return ''
}
</script>

<template>
  <section class="order-tracker" aria-label="Estado del pedido">
    <ol class="order-tracker__steps">
      <li
        v-for="(step, index) in steps"
        :key="step"
        class="order-tracker__step"
        :class="getStepModifier(index)"
        :aria-current="index === currentIndex ? 'step' : undefined"
      >
        <span class="order-tracker__dot" aria-hidden="true"></span>
        <span class="order-tracker__label">{{ ORDER_STATUS_LABELS[step] }}</span>
      </li>
    </ol>

    <p v-if="isDelayed" class="order-tracker__notice" role="status">
      Tu pedido va con un poco de retraso. ¡Gracias por tu paciencia!
    </p>
  </section>
</template>

<style scoped>
@reference "../style.css";

/* En móvil los pasos van en columna; desde sm en fila de izquierda a derecha */
.order-tracker {
  @apply mb-6 flex flex-col gap-3;
}

.order-tracker__steps {
  @apply flex flex-col gap-2 sm:flex-row sm:justify-between;
}

.order-tracker__step {
  @apply flex items-center gap-2 text-sm text-on-surface-variant;
}

.order-tracker__dot {
  @apply h-3 w-3 shrink-0 rounded-full border-2 border-outline-variant;
}

.order-tracker__step--done .order-tracker__dot {
  @apply border-secondary bg-secondary;
}

.order-tracker__step--current {
  @apply font-semibold text-primary;
}

.order-tracker__step--current .order-tracker__dot {
  @apply border-primary bg-primary;
}

.order-tracker__notice {
  @apply rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container;
}
</style>