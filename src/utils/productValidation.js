export const PRODUCT_FORM_ERRORS = Object.freeze({
  REQUIRED_FIELDS: 'Completa todos los campos obligatorios.',
  INVALID_PRICE: 'Ingresa un precio válido mayor a 0.',
})

const MIN_PRICE_EXCLUSIVE = 0

function isBlank(value) {
  return String(value ?? '').trim() === ''
}

export function validateProductForm(form, { requireImage = false } = {}) {
  const requiredFields = [form.name, form.description, form.price]
  if (requireImage) requiredFields.push(form.imageUrl)

  if (requiredFields.some(isBlank)) return PRODUCT_FORM_ERRORS.REQUIRED_FIELDS

  const price = parseFloat(form.price)
  if (isNaN(price) || price <= MIN_PRICE_EXCLUSIVE) return PRODUCT_FORM_ERRORS.INVALID_PRICE

  return ''
}