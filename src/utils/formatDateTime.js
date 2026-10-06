const LOCALE = 'es-ES'

const DATE_TIME_OPTIONS = Object.freeze({
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// Da formato de fecha y hora en español: "2026-10-01T12:30:00Z" → "01/10/2026, 14:30".
export function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString(LOCALE, DATE_TIME_OPTIONS)
}