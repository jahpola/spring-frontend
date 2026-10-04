import { describe, expect, it } from 'vitest'
import {
  type ProductFormValues,
  productFormSchema,
  toProductInput,
} from '@/features/products/schemas/productForm'

const validProduct: ProductFormValues = {
  name: 'Coffee',
  description: 'Freshly roasted beans',
  price: '4.25',
  stockQuantity: '8',
}

describe('productFormSchema', () => {
  it.each([
    ['a 2-character name', { ...validProduct, name: 'AB' }],
    ['a 100-character name', { ...validProduct, name: 'A'.repeat(100) }],
    ['a 1000-character description', { ...validProduct, description: 'A'.repeat(1000) }],
    ['the minimum price', { ...validProduct, price: '0.01' }],
    ['a price with one decimal place', { ...validProduct, price: '4.2' }],
    ['a price with two decimal places', { ...validProduct, price: '4.25' }],
    ['a price with a comma separator', { ...validProduct, price: '4,25' }],
    ['zero stock', { ...validProduct, stockQuantity: '0' }],
    ['empty optional values', { ...validProduct, description: '', stockQuantity: '' }],
  ])('accepts %s', (_, values) => {
    expect(productFormSchema.safeParse(values).success).toBe(true)
  })

  it.each([
    ['an empty name', { ...validProduct, name: '' }, 'name'],
    ['a whitespace-only name', { ...validProduct, name: '   ' }, 'name'],
    ['a 1-character name', { ...validProduct, name: 'A' }, 'name'],
    ['a 101-character name', { ...validProduct, name: 'A'.repeat(101) }, 'name'],
    [
      'a 1001-character description',
      { ...validProduct, description: 'A'.repeat(1001) },
      'description',
    ],
    ['an empty price', { ...validProduct, price: '' }, 'price'],
    ['a whitespace-only price', { ...validProduct, price: '   ' }, 'price'],
    ['a zero price', { ...validProduct, price: '0' }, 'price'],
    ['a negative price', { ...validProduct, price: '-1.00' }, 'price'],
    ['a price with 3 decimal places', { ...validProduct, price: '1.234' }, 'price'],
    ['a non-numeric price', { ...validProduct, price: 'free' }, 'price'],
    ['a price with multiple separators', { ...validProduct, price: '1.2.3' }, 'price'],
    ['fractional stock', { ...validProduct, stockQuantity: '2.5' }, 'stockQuantity'],
    ['negative stock', { ...validProduct, stockQuantity: '-1' }, 'stockQuantity'],
    ['non-numeric stock', { ...validProduct, stockQuantity: 'many' }, 'stockQuantity'],
  ])('rejects %s', (_, values, field) => {
    const result = productFormSchema.safeParse(values)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(true)
    }
  })

  it.each([
    ['an empty name', { ...validProduct, name: '' }, 'name', 'Product name is required'],
    [
      'a name that is too long',
      { ...validProduct, name: 'A'.repeat(101) },
      'name',
      'Product name cannot exceed 100 characters',
    ],
    ['a zero price', { ...validProduct, price: '0' }, 'price', 'Price must be at least 0.01'],
    [
      'an invalid price',
      { ...validProduct, price: '1.234' },
      'price',
      'Enter a valid price with up to 2 decimal places',
    ],
    [
      'negative stock',
      { ...validProduct, stockQuantity: '-1' },
      'stockQuantity',
      'Stock quantity must be a whole number',
    ],
    [
      'fractional stock',
      { ...validProduct, stockQuantity: '2.5' },
      'stockQuantity',
      'Stock quantity must be a whole number',
    ],
  ])('returns the expected message for %s', (_, values, field, message) => {
    const result = productFormSchema.safeParse(values)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === field && issue.message === message),
      ).toBe(true)
    }
  })
})

describe('toProductInput', () => {
  it('normalizes parsed form values for the API', () => {
    const parsedValues = productFormSchema.parse({
      name: '  Coffee  ',
      description: '  Freshly roasted beans  ',
      price: ' 4,25 ',
      stockQuantity: ' 8 ',
    })

    expect(toProductInput(parsedValues)).toEqual({
      name: 'Coffee',
      description: 'Freshly roasted beans',
      price: '4.25',
      stockQuantity: 8,
    })
  })

  it('maps empty optional values to null', () => {
    const parsedValues = productFormSchema.parse({
      ...validProduct,
      description: '   ',
      stockQuantity: '   ',
    })

    expect(toProductInput(parsedValues)).toEqual({
      name: 'Coffee',
      description: null,
      price: '4.25',
      stockQuantity: null,
    })
  })
})
