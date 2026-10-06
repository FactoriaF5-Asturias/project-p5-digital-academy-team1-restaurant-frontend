<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../../services/authService'
import PasswordInput from '../PasswordInput.vue'

const router = useRouter()

// El login lee este parámetro para confirmar que la cuenta se ha creado.
const REGISTERED_QUERY = { registered: '1' }

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const address = ref('')
const postalCode = ref('')
const city = ref('')

const errorMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  isLoading.value = true

  try {
    await authService.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      address: address.value,
      postalCode: postalCode.value,
      city: city.value,
    })

    await router.push({ name: 'login', query: REGISTERED_QUERY })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data ||
      'No se ha podido crear la cuenta.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form
    class="mt-8 space-y-5"
    @submit.prevent="handleSubmit"
  >
 <div>
  <label
    for="firstName"
    class="mb-2 block text-sm font-medium"
  >
    Nombre
  </label>

  <input
    id="firstName"
    v-model="firstName"
    type="text"
    autocomplete="given-name"
    required
    class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
    placeholder="Tu nombre"
  />
</div>

<div>
  <label
    for="lastName"
    class="mb-2 block text-sm font-medium"
  >
    Apellidos
  </label>

  <input
    id="lastName"
    v-model="lastName"
    type="text"
    autocomplete="family-name"
    required
    class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
    placeholder="Tus apellidos"
  />
</div>

    <div>
      <label
        for="email"
        class="mb-2 block text-sm font-medium"
      >
        Correo electrónico
      </label>

      <input
        id="email"
        v-model="email"
        type="email"
        autocomplete="email"
        required
        class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
        placeholder="correo@ejemplo.com"
      />
    </div>

    <div>
      <label
        for="password"
        class="mb-2 block text-sm font-medium"
      >
        Contraseña
      </label>

      <PasswordInput
        id="password"
        v-model="password"
        autocomplete="new-password"
      />
    </div>

    <div>
      <label
        for="confirm-password"
        class="mb-2 block text-sm font-medium"
      >
        Confirmar contraseña
      </label>

      <PasswordInput
        id="confirm-password"
        v-model="confirmPassword"
        autocomplete="new-password"
      />
    </div>
    <div>
  <label
    for="address"
    class="mb-2 block text-sm font-medium"
  >
    Dirección
  </label>

  <input
    id="address"
    v-model="address"
    type="text"
    autocomplete="street-address"
    required
    class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
    placeholder="Calle y número"
  />
</div>

<div>
  <label
    for="postalCode"
    class="mb-2 block text-sm font-medium"
  >
    Código postal
  </label>

  <input
    id="postalCode"
    v-model="postalCode"
    type="text"
    autocomplete="postal-code"
    required
    class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
    placeholder="33001"
  />
</div>

<div>
  <label
    for="city"
    class="mb-2 block text-sm font-medium"
  >
    Ciudad
  </label>

  <input
    id="city"
    v-model="city"
    type="text"
    autocomplete="address-level2"
    required
    class="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 outline-none transition focus:border-primary"
    placeholder="Oviedo"
  />
</div>
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