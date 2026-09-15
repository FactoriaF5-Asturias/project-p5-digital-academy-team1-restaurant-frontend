// src/services/tables.service.js
import api from './api'

const TABLES_ENDPOINT = '/api/v1/tables/by-device'
const DEVICE_ID_STORAGE_KEY = 'gitsushi-device-id'

// Cada dispositivo necesita un identificador estable para que el backend
// pueda vincularlo siempre a la misma mesa física. Se genera una sola vez
// y se guarda en localStorage para reutilizarlo en visitas futuras.
function getDeviceIdentifier() {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
  }

  return deviceId
}

export async function getLinkedTable() {
  const response = await api.get(TABLES_ENDPOINT, {
    headers: { 'Device-Identifier': getDeviceIdentifier() },
  })

  return response.data
}
