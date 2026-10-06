// src/services/orders.service.js
import api from './api'
import { getDeviceIdentifier } from './tables.service'

const ORDERS_ENDPOINT = '/api/v1/orders'
// Traduce el canal interno del frontend ('sala'/'domicilio') al valor real
// del enum OrderChannel que espera el backend ('ONSITE'/'ONLINE').
const CHANNEL_TO_BACKEND = {
  sala: 'ONSITE',
  domicilio: 'ONLINE',
}

// Traduce la dirección interna del frontend (street/city/postalCode) a la
// forma real que espera el backend para pedidos a domicilio
// (DeliveryAddressDTORequest: deliveryStreet/deliveryCity/deliveryPostalCode/deliveryInstructions).
function mapAddressToBackend(address) {
  if (!address) return undefined

  return {
    deliveryStreet: address.street,
    deliveryCity: address.city,
    deliveryPostalCode: address.postalCode,
    deliveryInstructions: address.instructions || null,
  }
}

export async function createOrder({ items, chefNote, channel, paymentMethod, address, tableNumber }) {
   const response = await api.post(
     ORDERS_ENDPOINT,
     {
       items,
       chefNote,
       channel: CHANNEL_TO_BACKEND[channel] ?? channel,
       paymentMethod,
       deliveryAddress: mapAddressToBackend(address), tableNumber,
    },
    // Cabecera obligatoria para que el backend resuelva la mesa en pedidos
    // "en sala"; en pedidos a domicilio el backend la ignora sin problema.
     { headers: { 'Device-Identifier': getDeviceIdentifier() } },
   )
   return response.data
 }

// Pedidos filtrados por estado (p. ej. 'ONTHEWAY' para el Dashboard de
// Repartidores). Endpoint genérico, no requiere ningún repartidor asignado.
export async function getOrdersByStatus(status) {
  const response = await api.get(ORDERS_ENDPOINT, { params: { status } })
  return response.data
}
