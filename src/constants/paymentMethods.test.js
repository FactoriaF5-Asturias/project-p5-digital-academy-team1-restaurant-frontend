import { describe, it, expect } from 'vitest'
import { DINE_IN_PAYMENT_METHODS, getBackendPaymentMethod } from './paymentMethods'

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

describe('DINE_IN_PAYMENT_METHODS', () => {
  it('is frozen so it cannot be mutated by mistake', () => {
    expect(Object.isFrozen(DINE_IN_PAYMENT_METHODS)).toBe(true)
  })
})
