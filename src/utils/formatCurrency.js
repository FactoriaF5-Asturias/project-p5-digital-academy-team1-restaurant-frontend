const LOCALE = 'es-ES'
const CURRENCY = 'EUR'

// Da formato de euros en español a un número: 5.5 → "5,50 €".
export function formatCurrency(value) {
  return value.toLocaleString(LOCALE, { style: 'currency', currency: CURRENCY })
}