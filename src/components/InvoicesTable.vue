<script setup>
import {
  CHANNEL_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  UNKNOWN_LABEL,
  getLabel,
} from '../constants/invoiceLabels'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDateTime } from '../utils/formatDateTime'

// Responsabilidad: pintar la tabla de facturas de pedidos pagados que recibe.
// No llama al backend ni sabe de búsqueda o paginación.

defineProps({
  invoices: {
    type: Array,
    required: true,
  },
})

const COLUMNS = Object.freeze([
  'ID factura',
  'Cliente / Mesa',
  'Canal',
  'Importe',
  'Método de pago',
  'Estado',
  'Fecha y hora',
])

// En sala se identifica por la mesa; a domicilio, por el nombre del cliente.
function getCustomerOrTable(invoice) {
  if (invoice.tableNumber) return `Mesa ${invoice.tableNumber}`
  return invoice.customerName || UNKNOWN_LABEL
}
</script>

<template>
  <table class="invoices-table">
    <thead>
      <tr class="invoices-table__head-row">
        <th v-for="column in COLUMNS" :key="column" class="invoices-table__cell">
          {{ column }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-if="invoices.length === 0">
        <td :colspan="COLUMNS.length" class="invoices-table__empty">
          No hay facturas que mostrar.
        </td>
      </tr>

      <tr v-for="invoice in invoices" :key="invoice.id" class="invoices-table__row">
        <td class="invoices-table__cell invoices-table__id" :title="invoice.invoiceNumber">
          #{{ invoice.id }}
        </td>
        <td class="invoices-table__cell">{{ getCustomerOrTable(invoice) }}</td>
        <td class="invoices-table__cell">{{ getLabel(CHANNEL_LABELS, invoice.channel) }}</td>
        <td class="invoices-table__cell invoices-table__amount">{{ formatCurrency(invoice.amount) }}</td>
        <td class="invoices-table__cell">{{ getLabel(PAYMENT_METHOD_LABELS, invoice.paymentMethod) }}</td>
        <td class="invoices-table__cell">
          <span class="invoices-table__badge">{{ getLabel(ORDER_STATUS_LABELS, invoice.status) }}</span>
        </td>
        <td class="invoices-table__cell invoices-table__date">{{ formatDateTime(invoice.paidAt) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
@reference "../style.css";

.invoices-table {
  @apply w-full text-sm;
}

.invoices-table__head-row {
  @apply border-b border-outline text-left text-xs uppercase text-on-surface-variant;
}

.invoices-table__cell {
  @apply py-3 pr-3 align-middle;
}

.invoices-table__row {
  @apply border-b border-outline last:border-0;
}

.invoices-table__empty {
  @apply py-6 text-center text-on-surface-variant;
}

.invoices-table__id {
  @apply font-mono font-semibold text-on-surface;
}

.invoices-table__amount {
  @apply font-semibold text-on-surface;
}

.invoices-table__badge {
  @apply inline-flex rounded-full bg-secondary-container px-2 py-1 text-xs font-semibold text-secondary;
}

.invoices-table__date {
  @apply whitespace-nowrap text-on-surface-variant;
}
</style>