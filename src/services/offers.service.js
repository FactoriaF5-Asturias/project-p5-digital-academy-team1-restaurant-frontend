// src/services/offers.service.js
import api from './api'

const OFFERS_ENDPOINT = '/api/v1/offers'

export async function getExclusiveOffers() {
  const response = await api.get(OFFERS_ENDPOINT)
  return response.data
}

export async function consumeOffer(coupon) {
  const response = await api.patch(`${OFFERS_ENDPOINT}/consume/${coupon}`)
  return response.data
}
