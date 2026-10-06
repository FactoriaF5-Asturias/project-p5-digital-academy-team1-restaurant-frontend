import { describe, it, expect } from 'vitest'
import {
  ONLINE_TRACKING_STEPS,
  ONSITE_TRACKING_STEPS,
  getCurrentStepIndex,
  getTrackingSteps,
} from './orderTracking'

describe('orderTracking', () => {
  it('uses the delivery steps for home delivery orders', () => {
    expect(getTrackingSteps('ONLINE')).toEqual(ONLINE_TRACKING_STEPS)
  })

  it('stops at "ready" for orders in the restaurant', () => {
    expect(getTrackingSteps('ONSITE')).toEqual(['PLACED', 'PROCESSING', 'READY'])
  })

  it('places each kitchen and delivery status on its own step', () => {
    expect(getCurrentStepIndex(ONLINE_TRACKING_STEPS, 'PROCESSING')).toBe(1)
    expect(getCurrentStepIndex(ONLINE_TRACKING_STEPS, 'ONTHEWAY')).toBe(3)
    expect(getCurrentStepIndex(ONLINE_TRACKING_STEPS, 'DELIVERED')).toBe(4)
  })

  it('shows a paid order as received and a delayed one as in preparation', () => {
    expect(getCurrentStepIndex(ONLINE_TRACKING_STEPS, 'PAID')).toBe(0)
    expect(getCurrentStepIndex(ONSITE_TRACKING_STEPS, 'DELAYED')).toBe(1)
  })
})