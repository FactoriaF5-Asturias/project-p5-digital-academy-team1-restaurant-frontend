// Enlaces de navegación principales. Los permisos de cada uno se leen
// del router (meta.roles), así que aquí solo se define qué se enseña.
export const NAV_LINKS = Object.freeze([
  { to: { name: 'carta' }, label: 'Carta' },
  { to: { name: 'mi-pedido' }, label: 'Mi pedido' },
  { to: { name: 'perfil' }, label: 'Perfil' },
  { to: { name: 'cesta' }, label: 'Cesta', showsCartCount: true },
  { to: { name: 'cocina' }, label: 'Cocina' },
  { to: { name: 'reparto' }, label: 'Reparto' },
  { to: { name: 'admin' }, label: 'Admin' },
])

export const NAV_VARIANTS = Object.freeze({
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
})

// Id compartido entre el botón ☰ (aria-controls) y el menú móvil.
export const MOBILE_NAV_ID = 'mobile-navigation'