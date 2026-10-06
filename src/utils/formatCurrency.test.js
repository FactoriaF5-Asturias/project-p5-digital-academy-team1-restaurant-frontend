import { describe, it, expect } from 'vitest'
import { formatCurrency, formatRoundedCurrency } from './formatCurrency'

// Intl usa un espacio especial antes del símbolo €, por eso se normaliza.
const normalizeSpaces = (text) => text.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats a number as euros with a comma and two decimals', () => {
    expect(normalizeSpaces(formatCurrency(5.5))).toBe('5,50 €')
  })

  it('adds the two decimals to whole numbers', () => {
    expect(normalizeSpaces(formatCurrency(12))).toBe('12,00 €')
  })

  it('formats zero', () => {
    expect(normalizeSpaces(formatCurrency(0))).toBe('0,00 €')
  })
})

describe('formatRoundedCurrency', () => {
  it('rounds to whole euros without decimals', () => {
    expect(normalizeSpaces(formatRoundedCurrency(482.5))).toBe('483 €')
  })

  it('formats zero without decimals', () => {
    expect(normalizeSpaces(formatRoundedCurrency(0))).toBe('0 €')
  })
})