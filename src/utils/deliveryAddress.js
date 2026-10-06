// src/utils/deliveryAddress.js

// Responsabilidad: reglas de la dirección de entrega de un pedido a domicilio
// (qué campos son obligatorios y si la dirección del perfil está completa).

export const REQUIRED_ADDRESS_FIELDS = Object.freeze(['street', 'city', 'postalCode'])

export const ADDRESS_FIELD_ERRORS = Object.freeze({
  street: 'Indica la calle y el número.',
  city: 'Indica la ciudad.',
  postalCode: 'Indica el código postal.',
})

export function getMissingAddressFields(address) {
  return REQUIRED_ADDRESS_FIELDS.filter((field) => !String(address?.[field] ?? '').trim())
}

// El perfil guarda la dirección como address / city / postalCode.
// Devuelve null si le falta algún dato, para no ofrecer una dirección incompleta.
export function getProfileAddress(user) {
  const address = {
    street: user?.address ?? '',
    city: user?.city ?? '',
    postalCode: user?.postalCode ?? '',
  }
  return getMissingAddressFields(address).length === 0 ? address : null
}
