<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { USER_FORM_FIELDS, validateUserForm } from '../utils/userValidation'

// Responsabilidad: ventana para editar los datos de un usuario. Valida el
// formulario y, si es correcto, emite submit con los datos limpios.
// No llama al backend: eso lo decide el padre.

const props = defineProps({
  initialUser: {
    type: Object,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const TITLE = 'Editar usuario'

function buildInitialForm(user) {
  return Object.fromEntries(USER_FORM_FIELDS.map((field) => [field, user[field] ?? '']))
}

const initialForm = buildInitialForm(props.initialUser)
const form = reactive({ ...initialForm })
const validationError = ref('')

const hasChanges = computed(() =>
  USER_FORM_FIELDS.some((field) => form[field].trim() !== String(initialForm[field]).trim())
)
const displayedError = computed(() => validationError.value || props.errorMessage)

function handleSubmit() {
  validationError.value = validateUserForm(form)
  if (validationError.value) return

  emit(
    'submit',
    Object.fromEntries(USER_FORM_FIELDS.map((field) => [field, form[field].trim()]))
  )
}

function handleKeydown(event) {
  if (event.key === 'Escape') emit('cancel')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="user-form" role="dialog" aria-modal="true" :aria-label="TITLE">
    <div class="user-form__box">
      <div class="user-form__header">
        <h3 class="user-form__title">{{ TITLE }}</h3>
        <button
          type="button"
          class="user-form__close"
          aria-label="Cerrar"
          @click="emit('cancel')"
        >
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <form class="user-form__form" novalidate @submit.prevent="handleSubmit">
        <div class="user-form__row">
          <div>
            <label class="user-form__label" for="user-first-name">Nombre</label>
            <input id="user-first-name" v-model="form.firstName" type="text" class="user-form__input" autocomplete="off" />
          </div>
          <div>
            <label class="user-form__label" for="user-last-name">Apellidos</label>
            <input id="user-last-name" v-model="form.lastName" type="text" class="user-form__input" autocomplete="off" />
          </div>
        </div>

        <div>
          <label class="user-form__label" for="user-email">Email</label>
          <input id="user-email" v-model="form.email" type="email" class="user-form__input" autocomplete="off" />
        </div>

        <div>
          <label class="user-form__label" for="user-address">Dirección</label>
          <input id="user-address" v-model="form.address" type="text" class="user-form__input" autocomplete="off" />
        </div>

        <div class="user-form__row">
          <div>
            <label class="user-form__label" for="user-postal-code">Código postal</label>
            <input id="user-postal-code" v-model="form.postalCode" type="text" class="user-form__input" autocomplete="off" />
          </div>
          <div>
            <label class="user-form__label" for="user-city">Ciudad</label>
            <input id="user-city" v-model="form.city" type="text" class="user-form__input" autocomplete="off" />
          </div>
        </div>

        <p v-if="displayedError" class="user-form__error" role="alert">{{ displayedError }}</p>

        <div class="user-form__actions">
          <button type="button" class="user-form__button" @click="emit('cancel')">Cancelar</button>
          <button
            v-if="hasChanges"
            type="submit"
            :disabled="isSaving"
            class="user-form__button user-form__button--primary"
          >
            {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.user-form {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4;
}

.user-form__box {
  @apply max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg;
}

.user-form__header {
  @apply mb-4 flex items-center justify-between;
}

.user-form__title {
  @apply font-heading text-lg font-bold text-on-surface;
}

.user-form__close {
  @apply flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high;
}

.user-form__form {
  @apply flex flex-col gap-3;
}

.user-form__row {
  @apply grid grid-cols-1 gap-3 sm:grid-cols-2;
}

.user-form__label {
  @apply mb-1 block text-xs font-semibold text-on-surface-variant;
}

.user-form__input {
  @apply w-full rounded-lg border border-outline px-3 py-2 text-sm outline-none focus:border-primary;
}

.user-form__error {
  @apply text-sm text-error;
}

.user-form__actions {
  @apply flex justify-end gap-3 pt-2;
}

.user-form__button {
  @apply min-h-11 rounded-lg border border-outline px-4 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high;
}

.user-form__button--primary {
  @apply border-primary bg-primary text-on-primary hover:bg-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50;
}
</style>