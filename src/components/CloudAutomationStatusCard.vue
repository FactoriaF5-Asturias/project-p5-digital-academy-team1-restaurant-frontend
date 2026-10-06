<script setup>
import { onMounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { useCronStatus } from '../composables/useCronStatus'

// Responsabilidad: tarjeta de estado del "Cloud Automation Service" en el panel de
// administración. Consume el endpoint real GET /sistema/cron-status.
const NEVER_SYNCED_LABEL = 'todavía no se ha ejecutado'
const { status, isLoading, loadError, fetchStatus } = useCronStatus()

onMounted(() => {
  fetchStatus()
})

// Sin fecha (el cron aún no se ha ejecutado) no se formatea: new Date(null) sería 1970.
function formatSyncDate(isoDate) {
  if (!isoDate) return NEVER_SYNCED_LABEL
  return new Date(isoDate).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <section class="cloud-automation-status" aria-label="Estado del Cloud Automation Service">
    <h2 class="cloud-automation-status__title">Cloud Automation Service</h2>

    <LoadingSpinner v-if="isLoading" label="Comprobando el estado del servicio..." />

    <p
      v-else-if="loadError"
      class="cloud-automation-status__message cloud-automation-status__message--error"
    >
      {{ loadError }}
    </p>

    <p v-else-if="!status" class="cloud-automation-status__message">
      Todavía no hay datos de sincronización disponibles.
    </p>

    <div v-else class="cloud-automation-status__body">
      <span
        class="cloud-automation-status__badge"
        :class="
          status.status === 'ONLINE'
            ? 'cloud-automation-status__badge--online'
            : 'cloud-automation-status__badge--error'
        "
      >
        {{ status.status === 'ONLINE' ? 'En línea' : 'Con errores' }}
      </span>

      <p class="cloud-automation-status__sync">
        Última sincronización: {{ formatSyncDate(status.lastSyncAt) }}
      </p>

      <p v-if="status.lastError" class="cloud-automation-status__last-error" role="status">
        Último error registrado: {{ status.lastError }}
      </p>
    </div>
  </section>
</template>

<style scoped>
@reference "../style.css";

.cloud-automation-status {
  @apply flex flex-col gap-3 rounded-xl border border-outline-variant bg-white p-5;
}

.cloud-automation-status__title {
  @apply font-heading text-base font-semibold text-on-surface;
}

.cloud-automation-status__message {
  @apply text-sm text-on-surface-variant;
}

.cloud-automation-status__message--error {
  @apply text-error;
}

.cloud-automation-status__body {
  @apply flex flex-col gap-2;
}

.cloud-automation-status__badge {
  @apply inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold;
}

.cloud-automation-status__badge--online {
  @apply bg-primary-container text-primary;
}

.cloud-automation-status__badge--error {
  @apply bg-error-container text-error;
}

.cloud-automation-status__sync {
  @apply text-sm text-on-surface-variant;
}

.cloud-automation-status__last-error {
  @apply text-sm text-error;
}
</style>
