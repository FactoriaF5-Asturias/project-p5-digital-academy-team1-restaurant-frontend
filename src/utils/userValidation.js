// Responsabilidad: validar los datos del formulario de edición de usuario
// antes de enviarlos. Devuelve el mensaje de error o '' si todo es correcto.

export const USER_FORM_ERRORS = Object.freeze({
  REQUIRED_FIELDS: 'Completa todos los campos.',
  INVALID_EMAIL: 'El formato del email no es válido.',
})

// Mismo formato de email que valida el backend al registrar.
const EMAIL_PATTERN = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/

export const USER_FORM_FIELDS = Object.freeze([
  'firstName',
  'lastName',
  'email',
  'address',
  'postalCode',
  'city',
])

function isBlank(value) {
  return String(value ?? '').trim() === ''
}

export function validateUserForm(form) {
  if (USER_FORM_FIELDS.some((field) => isBlank(form[field]))) {
    return USER_FORM_ERRORS.REQUIRED_FIELDS
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) return USER_FORM_ERRORS.INVALID_EMAIL

  return ''
}