<script setup>
// Diálogo genérico de confirmación (por ejemplo, antes de borrar algo).
// El texto del mensaje llega por el slot por defecto, así el padre puede
// resaltar partes (como el nombre del producto). Solo emite confirm o cancel.
// variant: 'danger' (rojo) para quitar, borrar o desactivar;
// 'success' (verde) para confirmar algo positivo, como un cobro.
defineProps({
  title: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'success'].includes(value),
  },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <!-- Clic en el fondo oscuro = cancelar -->
  <div
    class="confirm-dialog"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    @click.self="emit('cancel')"
  >
    <div class="confirm-dialog__box">
      <h3 class="confirm-dialog__title">{{ title }}</h3>

      <p class="confirm-dialog__message">
        <slot />
      </p>

      <div class="confirm-dialog__actions">
        <button type="button" class="confirm-dialog__button" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :class="['confirm-dialog__button', `confirm-dialog__button--${variant}`]"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.confirm-dialog {
  @apply fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4;
}

.confirm-dialog__box {
  @apply bg-white rounded-xl p-6 max-w-sm w-full shadow-lg;
}

.confirm-dialog__title {
  @apply text-lg font-heading font-bold text-on-surface mb-2;
}

.confirm-dialog__message {
  @apply text-on-surface-variant text-sm mb-5;
}

.confirm-dialog__actions {
  @apply flex justify-end gap-3;
}

.confirm-dialog__button {
  @apply px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition;
}

.confirm-dialog__button--danger {
  @apply bg-error text-white border-error hover:bg-error hover:opacity-90;
}

.confirm-dialog__button--success {
  @apply bg-secondary text-white border-secondary hover:bg-secondary hover:opacity-90;
}
</style>