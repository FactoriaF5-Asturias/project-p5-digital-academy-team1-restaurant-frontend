// src/mocks/exclusiveOffers.mock.js
// Simula temporalmente el endpoint real de ofertas exclusivas (GET /api/v1/offers, privado).
// Se sustituirá por la llamada real en cuanto el backend lo publique en una rama.

const EXCLUSIVE_OFFERS = [
  {
    id: 'offer-1',
    productId: 1,
    productName: 'Hello Edamame',
    originalPrice: 6.5,
    finalPrice: 5.53,
    discountRate: 15,
    expiresAt: null,
    coupon: null,
  },
  {
    id: 'offer-2',
    productId: 3,
    productName: 'Kaisen Init',
    originalPrice: 12.5,
    finalPrice: 10,
    discountRate: 20,
    expiresAt: '2026-12-31T23:59:59',
    coupon: 'KAISEN20',
  },
]

export function getExclusiveOffers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ offers: EXCLUSIVE_OFFERS })
    }, 300)
  })
}
