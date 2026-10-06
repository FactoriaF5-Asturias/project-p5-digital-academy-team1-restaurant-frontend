// Secciones del panel de administración. Cada una es una tarjeta en el inicio
// del admin. `available: false` la muestra como "Próximamente" y sin enlace
// (p. ej. mientras el backend no tiene su endpoint).
// `icon` es el nombre del icono de Material Symbols (fuente cargada en index.html).
export const ADMIN_SECTIONS = Object.freeze([
  {
    key: 'products',
    title: 'Productos de la carta',
    description: 'Añadir, editar y activar productos',
    icon: 'restaurant_menu',
    routeName: 'admin-productos',
    available: true,
  },
  {
    key: 'invoices',
    title: 'Facturación',
    description: 'Pedidos pagados y facturas',
    icon: 'receipt_long',
    routeName: 'admin-facturacion',
    available: true,
  },
  {
    key: 'kpi',
    title: 'KPI de ventas',
    description: 'Hoy, mes, trimestre y año',
    icon: 'bar_chart',
    routeName: 'admin-kpi',
    available: true,
  },
  {
    key: 'sales-report',
    title: 'Resumen de ventas',
    description: 'Totales del periodo y descarga en PDF',
    icon: 'download',
    routeName: 'admin-resumen-ventas',
    available: true,
  },
  {
    key: 'users',
    title: 'Gestión de usuarios',
    description: 'Roles, activar y eliminar cuentas',
    icon: 'group',
    routeName: 'admin-usuarios',
    available: true,
  },
])