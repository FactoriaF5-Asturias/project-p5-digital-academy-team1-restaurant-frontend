import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

function extractRole(user) {
  return user?.roles?.[0] ?? null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const isLoading = ref(false)
  const isFetchingUser = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function login(credentials) {
    isLoading.value = true

    try {
      user.value = await authService.login(credentials)
      role.value = extractRole(user.value)

      return user.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser() {
    isFetchingUser.value = true

    try {
      user.value = await authService.getCurrentUser()
      role.value = extractRole(user.value)
    } catch {
      user.value = null
      role.value = null
    } finally {
      isFetchingUser.value = false
    }
  }

  // Olvida el usuario en el front sin llamar al backend
  // (p. ej. cuando la sesión ha caducado y el refresh falla).
  function clearSession() {
    user.value = null
    role.value = null
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearSession()
    }
  }

  return {
    user,
    role,
    isLoading,
    isFetchingUser,
    isAuthenticated,
    login,
    fetchCurrentUser,
    clearSession,
    logout,
  }
})