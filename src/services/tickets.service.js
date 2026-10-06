// src/services/tickets.service.js
import api from './api'

const TICKETS_ENDPOINT = '/api/v1/tickets'

// Ticket detallado de un pedido. El token permite verlo sin sesión
// (invitado en sala o enlace del email "Tu pedido va en camino");
// el cliente dueño del pedido puede pedirlo sin token.
export async function getTicket(id, token) {
  const response = await api.get(`${TICKETS_ENDPOINT}/${id}`, {
    params: token ? { token } : {},
  })
  return response.data
}