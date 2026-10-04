import { describe, expect, it } from 'vitest'
import { formatPrice, parseProductId } from '@/features/products/utils'

describe('parseProductId', () => {
  it('accepts positive safe integers', () => {
    expect(parseProductId('42')).toBe(42)
  })

  it.each([undefined, '', '0', '-1', '1.5', 'abc'])('rejects invalid IDs: %s', (value) => {
    expect(parseProductId(value)).toBeNull()
  })
})

describe('formatPrice', () => {
  it('formats a decimal price as euros', () => {
    expect(formatPrice('12.50')).toMatch(/12[.,]50/)
  })

  it('leaves an invalid decimal unchanged', () => {
    expect(formatPrice('unknown')).toBe('unknown')
  })
})
