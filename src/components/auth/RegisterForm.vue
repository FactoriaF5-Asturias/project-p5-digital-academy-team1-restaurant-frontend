<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/auth'
import PasswordInput from '../PasswordInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const formElement = ref(null)

const fields = [
  {
    name: 'firstName',
    label: 'Nombre',
    autocomplete: 'given-name',
    placeholder: 'Tu nombre',
    requiredMessage: 'El nombre es obligatorio.',
  },
  {
    name: 'lastName',
    label: 'Apellidos',
    autocomplete: 'family-name',
    placeholder: 'Tus apellidos',
    requiredMessage: 'Los apellidos son obligatorios.',
  },
  {
    name: 'email',
    label: 'Correo electrónico',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'correo@ejemplo.com',
    requiredMessage: 'El correo electrónico es obligatorio.',
  },
  {
    name: 'password',
    label: 'Contraseña',
    password: true,
    requiredMessage: 'La contraseña es obligatoria.',
  },
  {
    name: 'confirmPassword',
    id: 'confirm-password',
    label: 'Confirmar contraseña',
    password: true,
    requiredMessage: 'Confirma tu contraseña.',
  },
  {
    name: 'address',
    label: 'Dirección',
    autocomplete: 'street-address',
    placeholder: 'Calle y número',
    requiredMessage: 'La dirección es obligatoria.',
  },
  {
    name: 'postalCode',
    label: 'Código postal',
    autocomplete: 'postal-code',
    placeholder: '33001',
    requiredMessage: 'El código postal es obligatorio.',
  },
  {
    name: 'city',
    label: 'Ciudad',
    autocomplete: 'address-level2',
    placeholder: 'Oviedo',
    requiredMessage: 'La ciudad es obligatoria.',
  },
]

const form = reactive(
  Object.fromEntries(fields.map(({ name }) => [name, ''])),
)

const touched = reactive({})
const errorMessage = ref('')
const isLoading = ref(false)

const errors = computed(() => {
  const result = {}

  fields.forEach(({ name, requiredMessage }) => {
    if (!form[name].trim()) {
      result[name] = requiredMessage
    }
  })

  if (
    !result.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    result.email = 'Introduce un correo electrónico válido.'
  }

  if (
    !result.confirmPassword &&
    form.password !== form.confirmPassword
  ) {
    result.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return result
})

function validateField(name) {
  touched[name] = true
}

function fieldId(field) {
  return field.id ?? field.name
}

function fieldHasError(field) {
  return Boolean(touched[field.name] && errors.value[field.name])
}

async function handleSubmit() {
  if (isLoading.value) return

  errorMessage.value = ''

  fields.forEach(({ name }) => {
    touched[name] = true
  })

  if (Object.keys(errors.value).length > 0) {
    await nextTick()

    formElement.value
      ?.querySelector('[aria-invalid="true"]')
      ?.focus()

    return
  }

  const profile = Object.fromEntries(
    fields
      .filter(({ name }) => name !== 'confirmPassword')
      .map(({ name }) => [
        name,
        name === 'password' ? form[name] : form[name].trim(),
      ]),
  )

  isLoading.value = true
  let accountCreated = false

  try {
    await authService.register(profile)
    accountCreated = true

    await authStore.login({
      email: profile.email,
      password: profile.password,
    })

    await router.push('/perfil')
  } catch (error) {
    if (accountCreated) {
      errorMessage.value =
        'Tu cuenta se ha creado, pero no se ha podido abrir el Perfil. Inicia sesión para continuar.'
    } else if (error.response?.status === 409) {
      errorMessage.value = 'Ya existe una cuenta con este email.'
    } else {
      const message = error.response?.data?.message

      errorMessage.value =
        typeof message === 'string'
          ? message
          : 'No se ha podido crear la cuenta. Inténtalo de nuevo.'
    }
  } finally {
    isLoading.value = false
  }

  if (accountCreated && !authStore.isAuthenticated) {
    await router.push({
      name: 'login',
      query: { registered: '1' },
    })
  }
}
</script>

<template>
  <form
    ref="formElement"
    class="mt-8 space-y-5"
    novalidate
    :aria-busy="isLoading"
    @submit.prevent="handleSubmit"
  >
    <p class="text-sm text-on-surface-variant">
      Todos los campos son obligatorios.
    </p>

    <fieldset :disabled="isLoading" class="min-w-0 space-y-5">
      <div v-for="field in fields" :key="field.name">
        <label
          :for="fieldId(field)"
          class="mb-2 block text-sm font-medium"
        >
          {{ field.label }}
        </label>

        <PasswordInput
          v-if="field.password"
          :id="fieldId(field)"
          v-model="form[field.name]"
          autocomplete="new-password"
          required
          :aria-invalid="fieldHasError(field)"
          :aria-describedby="
            fieldHasError(field)
              ? `${fieldId(field)}-error`
              : undefined
          "
          @focusout="validateField(field.name)"
        />

        <input
          v-else
          :id="fieldId(field)"
          v-model="form[field.name]"
          :type="field.type ?? 'text'"
          :autocomplete="field.autocomplete"
          :placeholder="field.placeholder"
          required
          :aria-invalid="fieldHasError(field)"
          :aria-describedby="
            fieldHasError(field)
              ? `${fieldId(field)}-error`
              : undefined
          "
          class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
          @blur="validateField(field.name)"
        />

        <p
          v-if="fieldHasError(field)"
          :id="`${fieldId(field)}-error`"
          class="mt-2 text-sm text-error"
          role="alert"
        >
          {{ errors[field.name] }}
        </p>
      </div>
    </fieldset>

    <p
      v-if="errorMessage"
      role="alert"
      class="text-sm text-error"
    >
      {{ errorMessage }}
    </p>

    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-lg bg-primary-container px-4 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
    </button>

    <p class="text-center text-sm">
      ¿Ya tienes una cuenta?

      <RouterLink
        to="/login"
        class="font-semibold text-primary"
      >
        Inicia sesión
      </RouterLink>
    </p>
  </form>
</template>