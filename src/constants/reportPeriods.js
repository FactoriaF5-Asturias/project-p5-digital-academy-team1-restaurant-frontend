// Periodos del resumen de ventas. `value` es lo que espera el backend
// en el parámetro ?period= y `label` el texto del selector.
export const REPORT_PERIODS = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
})

export const REPORT_PERIOD_OPTIONS = Object.freeze([
  { value: REPORT_PERIODS.DAY, label: 'Hoy' },
  { value: REPORT_PERIODS.WEEK, label: 'Semana' },
  { value: REPORT_PERIODS.MONTH, label: 'Mes' },
])

export const DEFAULT_REPORT_PERIOD = REPORT_PERIODS.DAY