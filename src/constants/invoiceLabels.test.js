import { describe, it, expect } from 'vitest'
import {
  CHANNEL_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  UNKNOWN_LABEL,
  getLabel,
} from './invoiceLabels'

describe('invoiceLabels', () => {
  it('traduce los valores del backend al español', () => {
    expect(getLabel(CHANNEL_LABELS, 'ONSITE')).toBe('Sala')
    expect(getLabel(PAYMENT_METHOD_LABELS, 'CASH_ON_DELIVERY')).toBe('Efectivo a la entrega')
    expect(getLabel(ORDER_STATUS_LABELS, 'DELIVERED')).toBe('Entregado')
  })

  it('muestra un guion si el valor llega vacío o es desconocido', () => {
    expect(getLabel(CHANNEL_LABELS, null)).toBe(UNKNOWN_LABEL)
    expect(getLabel(ORDER_STATUS_LABELS, 'CANCELLED')).toBe(UNKNOWN_LABEL)
  })

  it('las tablas de textos no se pueden modificar por error', () => {
    expect(Object.isFrozen(CHANNEL_LABELS)).toBe(true)
    expect(Object.isFrozen(PAYMENT_METHOD_LABELS)).toBe(true)
    expect(Object.isFrozen(ORDER_STATUS_LABELS)).toBe(true)
  })
})