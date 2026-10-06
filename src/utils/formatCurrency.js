const LOCALE = 'es-ES'
const CURRENCY = 'EUR'

// Da formato de euros en español a un número: 5.5 → "5,50 €".
export function formatCurrency(value) {
  return value.toLocaleString(LOCALE, { style: 'currency', currency: CURRENCY })
}

// Euros sin decimales para indicadores compactos: 4820.5 → "4821 €".
export function formatRoundedCurrency(value) {
  return value.toLocaleString(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  })
}