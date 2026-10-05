<script setup>
import { nextTick, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import ProfileFormField from './ProfileFormField.vue'
import { useProfileForm } from './useProfileForm'

const authStore = useAuthStore()
const formElement = ref(null)

const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

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

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function handleDictation(field, transcript) {
  if (isSaving.value) return

  clearMessages()
  form[field] = transcript
  validateField(field)
}

function handleReset() {
  resetForm()
  clearMessages()
}

async function handleSubmit() {
  if (
    isSaving.value ||
    authStore.isFetchingUser ||
    !authStore.user
  ) {
    return
  }

  clearMessages()

  if (!validateForm()) {
    await nextTick()

    formElement.value
      ?.querySelector('[aria-invalid="true"]')
      ?.focus()

    return
  }

  if (!hasChanges.value) return

  const profile = Object.fromEntries(
    fields.map(({ name }) => [name, form[name].trim()]),
  )

  isSaving.value = true

  try {
    await authStore.updateProfile(profile)
    await nextTick()

    successMessage.value = 'Perfil actualizado correctamente.'
  } catch (error) {
    const status = error.response?.status

    if (status === 409) {
      errorMessage.value =
        'Ese correo ya está en uso o existe un conflicto de datos.'
    } else if (status === 400) {
      errorMessage.value =
        'Revisa los datos del formulario antes de guardar.'
    } else if (status === 401 || status === 403) {
      errorMessage.value =
        'No se pudo autorizar el cambio. Comprueba tu sesión.'
    } else {
      errorMessage.value =
        'No se pudo guardar el perfil. Inténtalo de nuevo.'
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section
    class="profile-form"
    :aria-busy="Boolean(authStore.isFetchingUser || isSaving)"
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
      @input="clearMessages"
      @submit.prevent="handleSubmit"
    >
      <p class="profile-form__notice">
        Todos los campos son obligatorios.
      </p>

      <fieldset
        :disabled="isSaving"
        class="profile-form__grid"
      >
        <ProfileFormField
          v-for="field in fields"
          :key="field.name"
          v-model="form[field.name]"
          :field="field"
          :error="touched[field.name] ? errors[field.name] ?? '' : ''"
          @blur="validateField(field.name)"
          @transcript="handleDictation(field.name, $event)"
        />
      </fieldset>

      <p
        v-if="hasChanges"
        class="profile-form__notice"
        role="status"
      >
        Tienes cambios sin guardar.
      </p>

      <p
        v-if="successMessage"
        class="profile-form__notice"
        role="status"
      >
        {{ successMessage }}
      </p>

      <p
        v-if="errorMessage"
        class="profile-form__error"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <div class="profile-form__actions">
        <button
          v-if="hasChanges"
          type="button"
          class="profile-form__reset"
          :disabled="isSaving"
          @click="handleReset"
        >
          Descartar cambios
        </button>

        <button
          type="submit"
          class="profile-form__submit"
          :disabled="isSaving || !hasChanges"
        >
          {{ isSaving ? 'Guardando…' : 'Guardar cambios' }}
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
  @apply grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2;
}

.profile-form__notice {
  @apply text-sm text-on-surface;
}

.profile-form__error {
  @apply text-sm text-red-700;
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

.profile-form__submit:disabled,
.profile-form__reset:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>