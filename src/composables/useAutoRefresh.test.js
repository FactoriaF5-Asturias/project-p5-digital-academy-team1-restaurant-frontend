import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useAutoRefresh } from './useAutoRefresh'
import { AUTO_REFRESH_INTERVAL_MS } from '../constants/autoRefresh'

function mountWithAutoRefresh(refresh) {
  const Host = defineComponent({
    setup() {
      useAutoRefresh(refresh)
      return () => null
    },
  })
  return mount(Host)
}

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('refreshes the data every interval while the view is open', () => {
    const refresh = vi.fn()
    mountWithAutoRefresh(refresh)

    vi.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS * 2)

    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('stops refreshing when the view is closed', () => {
    const refresh = vi.fn()
    const wrapper = mountWithAutoRefresh(refresh)

    wrapper.unmount()
    vi.advanceTimersByTime(AUTO_REFRESH_INTERVAL_MS * 2)

    expect(refresh).not.toHaveBeenCalled()
  })
})
