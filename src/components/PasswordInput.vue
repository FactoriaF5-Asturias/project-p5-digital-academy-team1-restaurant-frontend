<script setup>
import { ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const password = defineModel({
  type: String,
  default: '',
})

defineProps({
  id: {
    type: String,
    required: true,
  },
  autocomplete: {
    type: String,
    default: 'current-password',
  },
  placeholder: {
    type: String,
    default: '••••••••',
  },
})

const isVisible = ref(false)

function handleToggleVisibility() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div class="password-input">
    <input
      v-bind="$attrs"
      :id="id"
      v-model="password"
      :type="isVisible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      required
      class="password-input__field"
    />

    <button
      type="button"
      class="password-input__toggle"
      :aria-label="isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-pressed="isVisible"
      :aria-controls="id"
      @click="handleToggleVisibility"
    >
      <span class="material-symbols-outlined" aria-hidden="true">
        {{ isVisible ? 'visibility_off' : 'visibility' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
@reference "../style.css";

.password-input {
  @apply relative;
}

.password-input__field {
  @apply w-full rounded-lg border border-outline bg-surface-container py-3 pl-4 pr-12 outline-none transition focus:border-primary;
}

.password-input__toggle {
  @apply absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition hover:text-on-surface;
}
</style>