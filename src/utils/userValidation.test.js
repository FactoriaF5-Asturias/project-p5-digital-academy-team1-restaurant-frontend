import { describe, it, expect } from 'vitest'
import { USER_FORM_ERRORS, validateUserForm } from './userValidation'

function buildForm(overrides = {}) {
  return {
    firstName: 'Laura',
    lastName: 'Gómez',
    email: 'laura@gitsushi.com',
    address: 'Calle Mayor 5',
    postalCode: '33401',
    city: 'Avilés',
    ...overrides,
  }
}

describe('validateUserForm', () => {
  it('no devuelve error si todos los datos son correctos', () => {
    expect(validateUserForm(buildForm())).toBe('')
  })

  it.each(['firstName', 'lastName', 'email', 'address', 'postalCode', 'city'])(
    'pide completar los campos si %s está vacío',
    (field) => {
      expect(validateUserForm(buildForm({ [field]: '   ' }))).toBe(USER_FORM_ERRORS.REQUIRED_FIELDS)
    }
  )

  it('rechaza un email con formato incorrecto', () => {
    expect(validateUserForm(buildForm({ email: 'laura@gitsushi' }))).toBe(
      USER_FORM_ERRORS.INVALID_EMAIL
    )
  })

  it('acepta el email aunque tenga espacios alrededor', () => {
    expect(validateUserForm(buildForm({ email: '  laura@gitsushi.com ' }))).toBe('')
  })
})