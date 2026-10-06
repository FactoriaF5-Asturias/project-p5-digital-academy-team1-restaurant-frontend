// Textos y orden de los datos que devuelve GET /api/v1/kpi/sales.

// Indicadores de ventas: `key` es el campo del backend.
export const KPI_PERIODS = Object.freeze([
  { key: 'today', label: 'Hoy' },
  { key: 'month', label: 'Mes' },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year', label: 'Año fiscal' },
])

// Canales de venta: `key` es el campo del backend y `modifier` la variante de color.
export const SALES_CHANNELS = Object.freeze([
  { key: 'inStore', label: 'Sala Tablets', shortLabel: 'Sala', modifier: 'in-store' },
  { key: 'delivery', label: 'A Domicilio', shortLabel: 'Domicilio', modifier: 'delivery' },
])

// Días de la semana en el orden del gráfico (lunes a domingo).
export const WEEK_DAYS = Object.freeze([
  { key: 'MONDAY', shortLabel: 'L', label: 'Lunes' },
  { key: 'TUESDAY', shortLabel: 'M', label: 'Martes' },
  { key: 'WEDNESDAY', shortLabel: 'X', label: 'Miércoles' },
  { key: 'THURSDAY', shortLabel: 'J', label: 'Jueves' },
  { key: 'FRIDAY', shortLabel: 'V', label: 'Viernes' },
  { key: 'SATURDAY', shortLabel: 'S', label: 'Sábado' },
  { key: 'SUNDAY', shortLabel: 'D', label: 'Domingo' },
])