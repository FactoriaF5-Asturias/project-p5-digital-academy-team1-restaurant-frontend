import { ROLES } from '../constants/roles'

// Responsabilidad: reglas de acceso a las rutas según el rol del usuario.

export const ACCESS_DENIED_ROUTE = 'acceso-denegado'

// Devuelve true si el rol puede entrar en la ruta.
// Una ruta sin meta.roles es pública.
export function canAccess(route, role) {
  const allowedRoles = route.meta?.roles
  if (!allowedRoles) return true
  return allowedRoles.includes(role)
}

// Una ruta es solo para invitados si únicamente la puede ver alguien sin sesión
// (login, registro, recuperar contraseña...).
export function isGuestOnlyRoute(route) {
  const allowedRoles = route.meta?.roles
  if (!allowedRoles) return false
  return allowedRoles.every((allowedRole) => allowedRole === ROLES.GUEST)
}

// Decide a dónde mandar a quien entra en una URL que no existe:
// el invitado va a iniciar sesión y el usuario logueado vuelve a la carta.
export function getRedirectFor(role) {
  return role === ROLES.GUEST ? { name: 'login' } : { name: 'carta' }
}

// Decide a dónde mandar a quien intenta entrar en una vista que no es de su rol:
// - sin sesión: a iniciar sesión.
// - con sesión en una vista solo para invitados (login, registro): a la carta.
// - con sesión en una vista de otro rol: a "Acceso denegado".
export function getDeniedRedirectFor(route, role) {
  if (role === ROLES.GUEST) return { name: 'login' }
  if (isGuestOnlyRoute(route)) return { name: 'carta' }
  return { name: ACCESS_DENIED_ROUTE }
}

// Una ruta que no existe en el router (p. ej. /user) no tiene coincidencias.
export function isUnknownRoute(route) {
  return route.matched.length === 0
}