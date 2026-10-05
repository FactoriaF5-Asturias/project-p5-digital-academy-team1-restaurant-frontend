<script setup>
import { nextTick, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import ProfileFormField from './ProfileFormField.vue'
import { useProfileForm } from './useProfileForm'

const authStore = useAuthStore()
const formElement = ref(null)

const {
  fields,
  form,
  touched,
  errors,
  hasChanges,
  resetForm,
  validateField,
  validateForm,
} = useProfileForm(() => authStore.user)

function handleDictation(field, transcript) {
  form[field] = transcript
  validateField(field)
}

async function handleSubmit() {
  if (authStore.isFetchingUser || !authStore.user) return

  if (!validateForm()) {
    await nextTick()

    formElement.value
      ?.querySelector('[aria-invalid="true"]')
      ?.focus()

    return
  }

  if (!hasChanges.value) return

  // Pendiente del contrato del backend:
  // enviar los datos y actualizar el store tras guardar correctamente.
}
</script>

<template>
  <section
    class="profile-form"
    :aria-busy="Boolean(authStore.isFetchingUser)"
  >
    <h2 class="profile-form__title">Datos personales</h2>

    <p
      v-if="authStore.isFetchingUser"
      class="profile-form__notice"
      role="status"
    >
      Cargando tus datos…
    </p>

    <p
      v-else-if="!authStore.user"
      class="profile-form__notice"
      role="status"
    >
      No hay datos de usuario disponibles.
    </p>

    <form
      v-else
      ref="formElement"
      class="profile-form__fields"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <p class="profile-form__notice">
        Todos los campos son obligatorios.
      </p>

      <div class="profile-form__grid">
        <ProfileFormField
          v-for="field in fields"
          :key="field.name"
          v-model="form[field.name]"
          :field="field"
          :error="touched[field.name] ? errors[field.name] ?? '' : ''"
          @blur="validateField(field.name)"
          @transcript="handleDictation(field.name, $event)"
        />
      </div>

      <p
        v-if="hasChanges"
        class="profile-form__notice"
        role="status"
      >
        Tienes cambios sin guardar.
      </p>

      <p id="profile-save-help" class="profile-form__notice">
        El guardado de cambios estará disponible próximamente.
      </p>

      <div class="profile-form__actions">
        <button
          v-if="hasChanges"
          type="button"
          class="profile-form__reset"
          @click="resetForm"
        >
          Descartar cambios
        </button>

        <button
          type="submit"
          class="profile-form__submit"
          disabled
          aria-describedby="profile-save-help"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
@reference "../../style.css";

.profile-form {
  @apply flex flex-col gap-6;
}

.profile-form__title {
  @apply text-xl font-heading;
}

.profile-form__fields {
  @apply flex flex-col gap-5;
}

.profile-form__grid {
  @apply grid grid-cols-1 gap-5 sm:grid-cols-2;
}

.profile-form__notice {
  @apply text-sm text-on-surface;
}

.profile-form__actions {
  @apply flex flex-wrap justify-end gap-3;
}

.profile-form__reset {
  @apply rounded-lg border-2 border-primary
    bg-surface-container px-6 py-3 font-semibold
    text-primary shadow-sm cursor-pointer
    transition hover:bg-primary hover:text-white;
}

.profile-form__submit {
  @apply rounded-lg bg-primary px-6 py-3
    font-semibold text-white transition;
}

.profile-form__submit:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>