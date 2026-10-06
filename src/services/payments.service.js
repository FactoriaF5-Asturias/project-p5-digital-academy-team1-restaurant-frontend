// src/services/payments.service.js
import api from './api'

const PAYMENTS_ENDPOINT = '/api/v1/payments'

// Crea la sesión de pago de Stripe para un pedido a domicilio ya creado
// (channel: ONLINE, paymentMethod: ONLINE_CARD). El importe lo calcula el
// backend a partir del pedido real, así que aquí solo viaja el id.
export async function createCheckoutSession({ orderId, email }) {
  const response = await api.post(`${PAYMENTS_ENDPOINT}/checkout`, {
    orderId,
    email,
  })
  return response.data
}

// Se llama al volver de Stripe (con el session_id que la propia Stripe añade
// a la URL de éxito) para que el backend compruebe de verdad el pago contra
// Stripe y marque el pedido como pagado.
export async function confirmPayment(sessionId) {
  const response = await api.post(`${PAYMENTS_ENDPOINT}/confirm`, null, {
    params: { sessionId },
  })
  return response.data
}
