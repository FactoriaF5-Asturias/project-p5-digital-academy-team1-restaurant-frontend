// src/constants/tables.js

// Mesas que existen en el restaurante (las mismas que crea el backend en data.sql).
// El cliente elige de esta lista para no enviar una mesa que no existe.
export const TABLE_COUNT = 10

export const TABLE_NUMBERS = Object.freeze(
  Array.from({ length: TABLE_COUNT }, (_, index) => index + 1),
)