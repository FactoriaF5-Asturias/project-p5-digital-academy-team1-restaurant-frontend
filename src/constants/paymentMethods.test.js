import { describe, it, expect } from 'vitest'
import {
  DINE_IN_PAYMENT_METHODS,
  getBackendPaymentMethod,
  getPaymentStatusLabel,
  getCollectPaymentLabel,
} from './paymentMethods'

describe('getBackendPaymentMethod', () => {
  it('translates each dine-in payment method to its real backend enum value', () => {
    expect(getBackendPaymentMethod('cashier')).toBe('CASH_ONSITE')
    expect(getBackendPaymentMethod('cardOnTable')).toBe('CARD_ONSITE')
  })

  it('returns null for a value that does not match any known payment method', () => {
    expect(getBackendPaymentMethod('unknown')).toBeNull()
  })

  it('returns null for a null or undefined value', () => {
    expect(getBackendPaymentMethod(null)).toBeNull()
    expect(getBackendPaymentMethod(undefined)).toBeNull()
  })
})

describe('getPaymentStatusLabel', () => {
  it('translates each known backend payment status to its Spanish label', () => {
    expect(getPaymentStatusLabel('PENDING_CASH')).toBe('pendiente de cobro en caja')
    expect(getPaymentStatusLabel('PENDING_CARD_TERMINAL')).toBe('pago pendiente en mesa')
  })

  it('returns null for a status that does not match any known payment method', () => {
    expect(getPaymentStatusLabel('UNKNOWN_STATUS')).toBeNull()
  })

  it('returns null for a null or undefined value', () => {
    expect(getPaymentStatusLabel(null)).toBeNull()
    expect(getPaymentStatusLabel(undefined)).toBeNull()
  })
})

describe('DINE_IN_PAYMENT_METHODS', () => {
  it('is frozen so it cannot be mutated by mistake', () => {
    expect(Object.isFrozen(DINE_IN_PAYMENT_METHODS)).toBe(true)
  })
})

describe('getCollectPaymentLabel', () => {
  it('names the collect button of each dine-in payment', () => {
    expect(getCollectPaymentLabel('PENDING_CASH')).toBe('Cobrado en caja')
    expect(getCollectPaymentLabel('PENDING_CARD_TERMINAL')).toBe('Cobrado con datáfono')
  })

  it('returns null for payments that are not collected in the restaurant', () => {
    expect(getCollectPaymentLabel('PENDING_CASH_ON_DELIVERY')).toBeNull()
    expect(getCollectPaymentLabel(null)).toBeNull()
  })
})
