// src/composables/useCronStatus.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCronStatus } from './useCronStatus'
import * as cronStatusService from '../services/cronStatus.service'

describe('useCronStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(cronStatusService, 'getCronStatus').mockResolvedValue({
      status: 'ONLINE',
      lastSyncAt: '2026-10-02T03:00:00',
      lastError: null,
    })
    const { isLoading, fetchStatus } = useCronStatus()

    const promise = fetchStatus()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores the fetched status on success', async () => {
    vi.spyOn(cronStatusService, 'getCronStatus').mockResolvedValue({
      status: 'ONLINE',
      lastSyncAt: '2026-10-02T03:00:00',
      lastError: null,
    })
    const { status, fetchStatus } = useCronStatus()

    await fetchStatus()

    expect(status.value).toEqual({
      status: 'ONLINE',
      lastSyncAt: '2026-10-02T03:00:00',
      lastError: null,
    })
  })

  it('stores an error message when the request fails', async () => {
    vi.spyOn(cronStatusService, 'getCronStatus').mockRejectedValue(new Error('network error'))
    const { loadError, fetchStatus } = useCronStatus()

    await fetchStatus()

    expect(loadError.value).toBe(
      'No se ha podido comprobar el estado del servicio. Inténtalo de nuevo más tarde.',
    )
  })
})
