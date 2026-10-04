export interface Product {
  id: number
  name: string
  description: string | null
  price: string | number
  stockQuantity: number | null
  inStock: boolean
}

export interface ProductInput {
  name: string
  description: string | null
  price: string
  stockQuantity: number | null
}

export interface PageResponse<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface ProductListParams {
  page: number
  size: number
  sort: string
}
