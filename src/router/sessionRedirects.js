import { ACCESS_DENIED_ROUTE, canAccess } from './guards'

// Responsabilidad: decidir a qué vista mandar al usuario cuando el backend
// responde que la sesión ha terminado (401) o que no tiene permiso (403).
export function createSessionRedirects(router, authStore) {
  return {
    // Sesión caducada: se olvida el usuario y, si la vista actual
    // ya no es accesible como invitado, se le manda a iniciar sesión.
    onUnauthorized() {
      authStore.clearSession()

      if (!canAccess(router.currentRoute.value, authStore.role)) {
        router.push({ name: 'login' })
      }
    },

    // Sin permiso: solo tiene sentido para alguien con sesión.
    // Un invitado que recibe 403 (p. ej. en /auth/me) se queda donde está.
    onForbidden() {
      if (authStore.isAuthenticated) {
        router.push({ name: ACCESS_DENIED_ROUTE })
      }
    },
  }
}