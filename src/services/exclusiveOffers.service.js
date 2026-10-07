import api from './api'

export async function getExclusiveOffers() {
  const { data } = await api.get('/api/v1/offers')

  return {
    offers: data.map((offer) => ({
      id: offer.id,
      productId: offer.product?.id ?? null,
      productName: offer.product?.name ?? '',
      discountRate: offer.discountRate,
      originalPrice: offer.originalPrice,
      finalPrice: offer.finalPrice,
      coupon: offer.coupon,
      used: offer.used,
      expiresAt: null,
    })),
  }
}