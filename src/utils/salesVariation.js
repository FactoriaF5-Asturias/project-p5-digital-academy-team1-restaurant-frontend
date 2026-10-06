const PERCENT = 100

// Variación en % respecto al periodo anterior, redondeada: (120, 100) → 20.
// Devuelve null si no hay ventas anteriores con las que comparar.
export function getVariationPercent(revenue, previousRevenue) {
  if (!previousRevenue) {
    return null
  }

  return Math.round(((revenue - previousRevenue) / previousRevenue) * PERCENT)
}