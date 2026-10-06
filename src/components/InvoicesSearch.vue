<script setup>
import { ref } from 'vue'

// Responsabilidad: buscador de facturas por ID, mesa o cliente.
// Solo recoge el texto y avisa al padre al buscar o al limpiar.

const emit = defineEmits(['search'])

const term = ref('')

function handleSubmit() {
  emit('search', term.value.trim())
}

function handleClear() {
  term.value = ''
  emit('search', '')
}
</script>

<template>
  <form class="invoices-search" role="search" @submit.prevent="handleSubmit">
    <label class="invoices-search__label" for="invoices-search-input">
      Buscar factura
    </label>

    <div class="invoices-search__controls">
      <input
        id="invoices-search-input"
        v-model="term"
        type="search"
        class="invoices-search__input"
        placeholder="ID de factura, mesa o cliente"
      />

      <button type="submit" class="invoices-search__button invoices-search__button--primary">
        Buscar
      </button>

      <button
        v-if="term"
        type="button"
        class="invoices-search__button"
        @click="handleClear"
      >
        Limpiar
      </button>
    </div>
  </form>
</template>

<style scoped>
@reference "../style.css";

.invoices-search {
  @apply mb-4 flex flex-col gap-1;
}

.invoices-search__label {
  @apply text-xs font-semibold text-on-surface-variant;
}

.invoices-search__controls {
  @apply flex flex-wrap gap-2;
}

.invoices-search__input {
  @apply min-h-11 min-w-0 flex-1 rounded-lg border border-outline px-3 text-sm outline-none focus:border-primary;
}

.invoices-search__button {
  @apply min-h-11 rounded-lg border border-outline px-4 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high;
}

.invoices-search__button--primary {
  @apply border-primary bg-primary text-on-primary hover:bg-primary hover:opacity-90;
}
</style>