import { apiRequest } from '@/api/client'
import type {
  PageResponse,
  Product,
  ProductInput,
  ProductListParams,
} from '@/features/products/types/product'

export function getProducts(params: ProductListParams, signal?: AbortSignal) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort,
  })
  return apiRequest<PageResponse<Product>>(`/api/products?${search}`, {}, signal)
}

export function getProduct(id: number, signal?: AbortSignal) {
  return apiRequest<Product>(`/api/products/${id}`, {}, signal)
}

export function createProduct(input: ProductInput) {
  return apiRequest<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateProduct(id: number, input: ProductInput) {
  return apiRequest<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteProduct(id: number) {
  return apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' })
}
