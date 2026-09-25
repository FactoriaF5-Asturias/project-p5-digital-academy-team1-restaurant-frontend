// src/mocks/exclusiveOffers.mock.js
// Simula temporalmente el futuro endpoint de ofertas exclusivas (todavía no existe en el backend).
// Se sustituirá por la llamada real en cuanto el backend lo publique.

const EXCLUSIVE_OFFERS = [
  {
    id: 'offer-1',
    productId: 1,
    productName: 'Hello Edamame',
    discountPercentage: 15,
    expiresAt: null,
    couponCode: null,
  },
  {
    id: 'offer-2',
    productId: 3,
    productName: 'Kaisen Init',
    discountPercentage: 20,
    expiresAt: '2026-12-31T23:59:59',
    couponCode: 'KAISEN20',
  },
]

// Simula la respuesta real del backend: ofertas desbloqueadas para el usuario autenticado.
export function getExclusiveOffers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ offers: EXCLUSIVE_OFFERS })
    }, 300)
  })
}
