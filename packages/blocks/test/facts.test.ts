import { describe, expect, it } from 'vitest'
import { formatDuration, formatPhone, formatSinglePrice, hoursRows } from '../src/kit/index.tsx'

describe('fact formatting', () => {
  it('groups phone numbers after the right country code', () => {
    expect(formatPhone('+441315550123')).toBe('+44 131 555 0123')
    expect(formatPhone('+35315550142')).toBe('+353 15 550 142')
    expect(formatPhone('+14155550172')).toBe('+1 415 555 0172')
    expect(formatPhone('+37410555123')).toBe('+374 10 555 123')
  })
  it('formats prices and durations in the site language', () => {
    expect(
      formatSinglePrice({ type: 'from', money: { amount: 16500, currency: 'GBP' } }, 'en-GB'),
    ).toBe('from £165')
    expect(
      formatSinglePrice(
        { type: 'per', money: { amount: 15900, currency: 'GBP' }, unit: 'month' },
        'en-GB',
      ),
    ).toBe('£159 / month')
    expect(formatSinglePrice({ type: 'on-request' }, 'ar')).toBe('السعر عند الطلب')
    expect(formatDuration(210, 'en-GB')).toBe('3 h 30 min')
  })
  it('merges days with the same hours', () => {
    const rows = hoursRows(
      [1, 2, 3].map((day) => ({ day, opens: '09:00', closes: '17:00' })),
      'en-GB',
    )
    expect(rows[0]).toEqual({ days: 'Mon–Wed', times: '9:00–17:00' })
    expect(rows[1]).toEqual({ days: 'Thu–Sun', times: 'Closed' })
  })
})
