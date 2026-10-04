import { z } from 'zod'
import type { ProductInput } from '@/features/products/types/product'

const decimalPattern = /^\d+([.,]\d{1,2})?$/
const integerPattern = /^\d+$/

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters'),
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .regex(decimalPattern, 'Enter a valid price with up to 2 decimal places')
    .refine((value) => Number(value.replace(',', '.')) >= 0.01, 'Price must be at least 0.01'),
  stockQuantity: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || integerPattern.test(value),
      'Stock quantity must be a whole number',
    ),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    price: values.price.replace(',', '.'),
    stockQuantity: values.stockQuantity === '' ? null : Number(values.stockQuantity),
  }
}
