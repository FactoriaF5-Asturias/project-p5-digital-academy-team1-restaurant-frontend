// src/services/cronStatus.service.js
import api from './api'

const CRON_STATUS_ENDPOINT = '/api/v1/sistema/cron-status'

export async function getCronStatus() {
  const response = await api.get(CRON_STATUS_ENDPOINT)
  return response.data
}
