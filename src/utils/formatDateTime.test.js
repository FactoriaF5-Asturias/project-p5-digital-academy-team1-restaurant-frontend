import { describe, it, expect } from 'vitest'
import { formatDateTime } from './formatDateTime'

describe('formatDateTime', () => {
  it('da formato de fecha y hora en español (dd/mm/aaaa, hh:mm)', () => {
    const formatted = formatDateTime('2026-10-01T10:30:00Z')

    expect(formatted).toMatch(/^01\/10\/2026, \d{2}:\d{2}$/)
  })
})