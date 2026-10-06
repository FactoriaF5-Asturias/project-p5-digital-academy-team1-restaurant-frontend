import { describe, it, expect } from 'vitest'
import { formatPeriodRange, getPeriodRange } from './reportPeriodRange'
import { REPORT_PERIODS } from '../constants/reportPeriods'

// Jueves 1 de octubre de 2026
const TODAY = new Date(2026, 9, 1, 15, 30)

describe('getPeriodRange', () => {
  it('hoy: empieza y acaba el mismo día', () => {
    const { start, end } = getPeriodRange(REPORT_PERIODS.DAY, TODAY)

    expect(start).toEqual(new Date(2026, 9, 1))
    expect(end).toEqual(new Date(2026, 9, 1))
  })

  it('semana: de lunes a domingo', () => {
    const { start, end } = getPeriodRange(REPORT_PERIODS.WEEK, TODAY)

    expect(start).toEqual(new Date(2026, 8, 28))
    expect(end).toEqual(new Date(2026, 9, 4))
  })

  it('semana: si hoy es domingo, empieza el lunes anterior', () => {
    const sunday = new Date(2026, 9, 4)

    const { start } = getPeriodRange(REPORT_PERIODS.WEEK, sunday)

    expect(start).toEqual(new Date(2026, 8, 28))
  })

  it('mes: del día 1 al último día del mes', () => {
    const { start, end } = getPeriodRange(REPORT_PERIODS.MONTH, TODAY)

    expect(start).toEqual(new Date(2026, 9, 1))
    expect(end).toEqual(new Date(2026, 9, 31))
  })
})

describe('formatPeriodRange', () => {
  it('un solo día', () => {
    expect(formatPeriodRange(getPeriodRange(REPORT_PERIODS.DAY, TODAY))).toBe('1 de octubre de 2026')
  })

  it('dentro del mismo mes', () => {
    expect(formatPeriodRange(getPeriodRange(REPORT_PERIODS.MONTH, TODAY))).toBe(
      'Del 1 al 31 de octubre de 2026'
    )
  })

  it('entre dos meses del mismo año', () => {
    expect(formatPeriodRange(getPeriodRange(REPORT_PERIODS.WEEK, TODAY))).toBe(
      'Del 28 de septiembre al 4 de octubre de 2026'
    )
  })

  it('entre dos años', () => {
    const range = { start: new Date(2026, 11, 28), end: new Date(2027, 0, 3) }

    expect(formatPeriodRange(range)).toBe('Del 28 de diciembre de 2026 al 3 de enero de 2027')
  })
})