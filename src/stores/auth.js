import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import { useCartStore } from './cart'
import { useLastOrderStore } from './lastOrder'

function extractRole(user) {
  return user?.roles?.[0] ?? null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const isLoading = ref(false)
  const isFetchingUser = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  function forgetPreviousVisitor() {
    useCartStore().clearCart()
    useLastOrderStore().clearOrder()
  }

  async function login(credentials) {
    isLoading.value = true

    try {
      user.value = await authService.login(credentials)
      role.value = extractRole(user.value)
      forgetPreviousVisitor()

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
      clearSession()
    } finally {
      isFetchingUser.value = false
    }
  }

  async function updateProfile(profile) {
    const userId = user.value?.id

    if (!userId) {
      throw new Error('No authenticated user available')
    }

    const updatedUser = await profileService.updateProfile(
      userId,
      profile,
    )

    user.value = updatedUser
    role.value = extractRole(updatedUser)

    return updatedUser
  }

  function clearSession() {
    user.value = null
    role.value = null
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearSession()
      forgetPreviousVisitor()
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
    updateProfile,
    clearSession,
    logout,
  }
})