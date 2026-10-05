import { describe, it, expect } from 'vitest'
import { validateProductForm, PRODUCT_FORM_ERRORS } from './productValidation'

function buildForm(overrides = {}) {
  return {
    name: 'Merge Nigiri',
    description: 'Nigiri de salmón',
    imageUrl: 'merge-nigiri.png',
    price: '6.50',
    stock: '20',
    ...overrides,
  }
}

describe('validateProductForm', () => {
  it('returns an empty string when every field is valid', () => {
    expect(validateProductForm(buildForm())).toBe('')
  })

  it('returns the required fields error when a required field is empty', () => {
    expect(validateProductForm(buildForm({ name: '' }))).toBe(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
    expect(validateProductForm(buildForm({ description: '   ' }))).toBe(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
    expect(validateProductForm(buildForm({ price: '' }))).toBe(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
    expect(validateProductForm(buildForm({ stock: '' }))).toBe(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
  })

  it('treats null or undefined fields as empty', () => {
    expect(validateProductForm(buildForm({ stock: undefined }))).toBe(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
    expect(validateProductForm(buildForm({ name: null }))).toBe(PRODUCT_FORM_ERRORS.REQUIRED_FIELDS)
  })

  it('only requires the image when requireImage is true', () => {
    const formWithoutImage = buildForm({ imageUrl: '' })

    expect(validateProductForm(formWithoutImage)).toBe('')
    expect(validateProductForm(formWithoutImage, { requireImage: true })).toBe(
      PRODUCT_FORM_ERRORS.REQUIRED_FIELDS
    )
  })

  it('returns the price error when the price is zero, negative or not a number', () => {
    expect(validateProductForm(buildForm({ price: '0' }))).toBe(PRODUCT_FORM_ERRORS.INVALID_PRICE)
    expect(validateProductForm(buildForm({ price: '-3' }))).toBe(PRODUCT_FORM_ERRORS.INVALID_PRICE)
    expect(validateProductForm(buildForm({ price: 'abc' }))).toBe(PRODUCT_FORM_ERRORS.INVALID_PRICE)
  })

  it('returns the stock error when the stock is negative or not a number', () => {
    expect(validateProductForm(buildForm({ stock: '-1' }))).toBe(PRODUCT_FORM_ERRORS.INVALID_STOCK)
    expect(validateProductForm(buildForm({ stock: 'abc' }))).toBe(PRODUCT_FORM_ERRORS.INVALID_STOCK)
  })

  it('accepts a stock of zero, also as a number', () => {
    expect(validateProductForm(buildForm({ stock: 0 }))).toBe('')
  })
})

describe('PRODUCT_FORM_ERRORS', () => {
  it('is frozen so it cannot be mutated by mistake', () => {
    expect(Object.isFrozen(PRODUCT_FORM_ERRORS)).toBe(true)
  })
})