<script setup>
import { onMounted } from 'vue'
import { usePaidInvoices } from '../composables/usePaidInvoices'
import InvoicesSearch from './InvoicesSearch.vue'
import InvoicesTable from './InvoicesTable.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import PaginationControl from './PaginationControl.vue'

// Responsabilidad: coordinar la sección "Facturación y Pedidos Pagados".
// Une el buscador, la tabla y la paginación con el estado de usePaidInvoices.

const {
  invoices,
  isLoading,
  loadError,
  currentPage,
  totalPages,
  loadInvoices,
  goToPage,
  search,
} = usePaidInvoices()

onMounted(loadInvoices)
</script>

<template>
  <section class="admin-invoices" aria-labelledby="admin-invoices-title">
    <header class="admin-invoices__header">
      <h2 id="admin-invoices-title" class="admin-invoices__title">Facturación y Pedidos Pagados</h2>
      <p class="admin-invoices__subtitle">Consulta los pedidos pagados para el control contable.</p>
    </header>

    <InvoicesSearch @search="search" />

    <LoadingSpinner v-if="isLoading" label="Cargando facturas..." />
    <p v-else-if="loadError" class="admin-invoices__load-error">{{ loadError }}</p>
    <div v-else class="admin-invoices__table-wrapper">
      <InvoicesTable :invoices="invoices" />

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </div>
  </section>
</template>

<style scoped>
@reference "../style.css";

.admin-invoices {
  @apply rounded-xl border border-outline bg-white p-5;
}

.admin-invoices__header {
  @apply mb-4;
}

.admin-invoices__title {
  @apply font-heading text-xl font-bold text-on-surface;
}

.admin-invoices__subtitle {
  @apply text-sm text-on-surface-variant;
}

.admin-invoices__load-error {
  @apply py-6 text-center text-error;
}

/* En móvil la tabla hace scroll horizontal dentro de la tarjeta, no la página */
.admin-invoices__table-wrapper {
  @apply overflow-x-auto;
}
</style>