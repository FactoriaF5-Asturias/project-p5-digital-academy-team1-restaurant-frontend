// Roles de la aplicación. Los valores coinciden con los que devuelve el
// backend en user.roles (dev.team1.roles). GUEST representa al usuario no logueado.
export const ROLES = Object.freeze({
  GUEST: null,
  CUSTOMER: 'ROLE_CUSTOMER',
  ADMIN: 'ROLE_ADMIN',
  COOK: 'ROLE_COOK',
  DELIVERY: 'ROLE_DELIVERYMAN',
})
// Texto en español de cada rol, para mostrarlo al usuario.
export const ROLE_LABELS = Object.freeze({
  [ROLES.CUSTOMER]: 'Cliente',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.COOK]: 'Cocina',
  [ROLES.DELIVERY]: 'Repartidor',
})

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? ''
}

// Roles que el administrador puede asignar desde la gestión de usuarios.
export const ASSIGNABLE_ROLES = Object.freeze([
  ROLES.CUSTOMER,
  ROLES.COOK,
  ROLES.DELIVERY,
  ROLES.ADMIN,
])