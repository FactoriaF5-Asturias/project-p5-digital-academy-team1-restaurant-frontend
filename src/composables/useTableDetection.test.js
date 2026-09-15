import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTableDetection } from './useTableDetection'
import { useCheckoutStore } from '../stores/checkout'
import * as tablesService from '../services/tables.service'

describe('useTableDetection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('sets isLoading to true while detecting and false when finished', async () => {
    vi.spyOn(tablesService, 'getLinkedTable').mockResolvedValue({ tableNumber: 5 })
    const { isLoading, detectTable } = useTableDetection()

    const promise = detectTable()
    expect(isLoading.value).toBe(true)

    await promise
    expect(isLoading.value).toBe(false)
  })

  it('stores the detected table as auto-detected on success', async () => {
    vi.spyOn(tablesService, 'getLinkedTable').mockResolvedValue({ tableNumber: 5 })
    const checkoutStore = useCheckoutStore()
    const { detectTable } = useTableDetection()

    await detectTable()

    expect(checkoutStore.tableNumber).toBe(5)
    expect(checkoutStore.isTableAutoDetected).toBe(true)
  })

  it('stores an error message when the detection fails', async () => {
    vi.spyOn(tablesService, 'getLinkedTable').mockRejectedValue(new Error('device not linked'))
    const checkoutStore = useCheckoutStore()
    const { error, detectTable } = useTableDetection()

    await detectTable()

    expect(error.value).toBe('No se ha podido detectar la mesa automáticamente.')
    expect(checkoutStore.tableNumber).toBeNull()
  })
})
