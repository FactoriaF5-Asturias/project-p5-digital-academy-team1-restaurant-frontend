<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import PasswordInput from '../PasswordInput.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

// Viene de RegisterForm tras crear la cuenta (/login?registered=1).
const isJustRegistered = computed(() => route?.query?.registered === '1')

const handleSubmit = async () => {
  errorMessage.value = ''

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    // La carta es la única vista que tienen todos los roles.
    await router.push({ name: 'carta' })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      'No se ha podido iniciar sesión. Revisa tus datos.'
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
        autocomplete="current-password"
      />
    </div>
        <div class="text-right">
      <RouterLink
        to="/forgot-password"
        class="text-sm font-semibold text-primary hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </RouterLink>
    </div>
<p
  v-if="isJustRegistered && !errorMessage"
  role="status"
  class="text-sm text-secondary"
>
  Cuenta creada. Ya puedes iniciar sesión.
</p>
<p
  v-if="errorMessage"
  role="alert"
  class="text-sm text-error"
>
  {{ errorMessage }}
</p>
<button
  type="submit"
  :disabled="authStore.isLoading"
  class="w-full rounded-lg bg-primary-container px-4 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
>
  {{ authStore.isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
</button>

    <p class="text-center text-sm">
      ¿No tienes cuenta?

      <RouterLink
        to="/register"
        class="font-semibold text-primary"
      >
        Regístrate
      </RouterLink>
    </p>
  </form>
</template>