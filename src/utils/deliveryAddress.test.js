import { describe, it, expect } from 'vitest'
import { getMissingAddressFields, getProfileAddress } from './deliveryAddress'

describe('deliveryAddress', () => {
  it('lists the required fields that are empty or only spaces', () => {
    expect(getMissingAddressFields({ street: 'Calle Mayor 1', city: '  ', postalCode: '' })).toEqual([
      'city',
      'postalCode',
    ])
  })

  it('treats a missing address as all fields missing', () => {
    expect(getMissingAddressFields(null)).toEqual(['street', 'city', 'postalCode'])
  })

  it('returns no missing fields for a complete address', () => {
    expect(
      getMissingAddressFields({ street: 'Calle Mayor 1', city: 'Avilés', postalCode: '33400' }),
    ).toEqual([])
  })

  it('builds the delivery address from a complete profile', () => {
    const user = { address: 'Calle Mayor 1', city: 'Avilés', postalCode: '33400' }

    expect(getProfileAddress(user)).toEqual({
      street: 'Calle Mayor 1',
      city: 'Avilés',
      postalCode: '33400',
    })
  })

  it('does not offer the profile address when it is incomplete', () => {
    expect(getProfileAddress({ address: 'Calle Mayor 1', city: '', postalCode: '33400' })).toBeNull()
    expect(getProfileAddress(null)).toBeNull()
  })
})
