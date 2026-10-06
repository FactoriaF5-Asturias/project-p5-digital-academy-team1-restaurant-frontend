import { REPORT_PERIODS } from '../constants/reportPeriods'

// Responsabilidad: calcular y escribir en español el rango de fechas de un periodo
// del resumen de ventas (hoy, semana de lunes a domingo, o mes natural).

const LOCALE = 'es-ES'
const DAYS_IN_WEEK = 7
const SUNDAY = 0
const DAYS_FROM_SUNDAY_TO_MONDAY = 6

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function getPeriodRange(period, today = new Date()) {
  const day = startOfDay(today)

  if (period === REPORT_PERIODS.WEEK) {
    const daysSinceMonday =
      day.getDay() === SUNDAY ? DAYS_FROM_SUNDAY_TO_MONDAY : day.getDay() - 1
    const start = addDays(day, -daysSinceMonday)
    return { start, end: addDays(start, DAYS_IN_WEEK - 1) }
  }

  if (period === REPORT_PERIODS.MONTH) {
    const start = new Date(day.getFullYear(), day.getMonth(), 1)
    const end = new Date(day.getFullYear(), day.getMonth() + 1, 0)
    return { start, end }
  }

  return { start: day, end: day }
}

function formatDay(date, options) {
  return date.toLocaleDateString(LOCALE, options)
}

// "1 de octubre de 2026", "Del 1 al 31 de octubre de 2026",
// "Del 28 de septiembre al 4 de octubre de 2026"...
export function formatPeriodRange({ start, end }) {
  const fullDate = { day: 'numeric', month: 'long', year: 'numeric' }

  if (start.getTime() === end.getTime()) return formatDay(start, fullDate)

  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  const startOptions = sameMonth
    ? { day: 'numeric' }
    : sameYear
      ? { day: 'numeric', month: 'long' }
      : fullDate

  return `Del ${formatDay(start, startOptions)} al ${formatDay(end, fullDate)}`
}