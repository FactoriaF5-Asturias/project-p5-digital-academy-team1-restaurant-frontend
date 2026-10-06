import { describe, it, expect } from 'vitest'
import { getVariationPercent } from './salesVariation'

describe('getVariationPercent', () => {
  it('calcula la subida respecto al periodo anterior', () => {
    expect(getVariationPercent(120, 100)).toBe(20)
  })

  it('calcula la bajada como número negativo', () => {
    expect(getVariationPercent(75, 100)).toBe(-25)
  })

  it('redondea al entero más cercano', () => {
    expect(getVariationPercent(110, 300)).toBe(-63)
  })

  it('devuelve null si no hay ventas anteriores', () => {
    expect(getVariationPercent(100, 0)).toBeNull()
    expect(getVariationPercent(100, null)).toBeNull()
    expect(getVariationPercent(100, undefined)).toBeNull()
  })
})