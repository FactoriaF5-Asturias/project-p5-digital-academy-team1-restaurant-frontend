export const PRODUCT_FORM_ERRORS = Object.freeze({
  REQUIRED_FIELDS: 'Completa todos los campos obligatorios.',
  INVALID_PRICE: 'Ingresa un precio válido mayor a 0.',
  INVALID_STOCK: 'Ingresa una cantidad de stock válida (0 o mayor).',
})

const MIN_PRICE_EXCLUSIVE = 0
const MIN_STOCK = 0

function isBlank(value) {
  return String(value ?? '').trim() === ''
}

export function validateProductForm(form, { requireImage = false } = {}) {
  const requiredFields = [form.name, form.description, form.price, form.stock]
  if (requireImage) requiredFields.push(form.imageUrl)

  if (requiredFields.some(isBlank)) return PRODUCT_FORM_ERRORS.REQUIRED_FIELDS

  const price = parseFloat(form.price)
  if (isNaN(price) || price <= MIN_PRICE_EXCLUSIVE) return PRODUCT_FORM_ERRORS.INVALID_PRICE

  const stock = parseInt(form.stock, 10)
  if (isNaN(stock) || stock < MIN_STOCK) return PRODUCT_FORM_ERRORS.INVALID_STOCK

  return ''
}