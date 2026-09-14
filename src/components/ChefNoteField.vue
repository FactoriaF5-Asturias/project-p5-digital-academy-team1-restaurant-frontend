<script setup>
import { computed } from 'vue'
import { useCheckoutStore } from '../stores/checkout'
import { CHEF_NOTE_SUGGESTIONS } from '../constants/chefNoteSuggestions'

const checkoutStore = useCheckoutStore()
const suggestions = CHEF_NOTE_SUGGESTIONS

// Mismo patrón que en ChannelSelector.vue: un computed con get/set que
// enlaza el textarea al store a través de la acción, en vez de mutar
// el estado directamente desde el componente.
const chefNote = computed({
  get: () => checkoutStore.chefNote,
  set: (value) => checkoutStore.setChefNote(value),
})

function addSuggestion(suggestion) {
  const current = checkoutStore.chefNote.trim()
  if (current.includes(suggestion)) return

  checkoutStore.setChefNote(current ? `${current}, ${suggestion}` : suggestion)
}
</script>

<template>
  <section class="chef-note" aria-label="Notas para el chef">
    <label for="chef-note-textarea" class="chef-note__label">Notas para el Chef</label>

    <textarea
      id="chef-note-textarea"
      v-model="chefNote"
      class="chef-note__textarea"
      rows="3"
      placeholder="Alergias o peticiones especiales (opcional)"
    ></textarea>

    <div class="chef-note__suggestions" role="group" aria-label="Sugerencias rápidas">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        type="button"
        class="chef-note__chip"
        @click="addSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </section>
</template>

<style scoped>
@reference "../style.css";

.chef-note {
  @apply flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface p-4;
}
.chef-note__label {
  @apply text-sm font-medium text-on-surface-variant;
}
.chef-note__textarea {
  @apply rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface resize-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary;
}
.chef-note__suggestions {
  @apply flex flex-wrap gap-2;
}
.chef-note__chip {
  @apply rounded-full border border-outline-variant px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-primary-container hover:text-on-surface;
}
</style>
