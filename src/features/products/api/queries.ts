import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '@/features/products/api/products'
import type { ProductInput, ProductListParams } from '@/features/products/types/product'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
}

export function productListOptions(params: ProductListParams) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => getProducts(params, signal),
  })
}

export function productDetailOptions(id: number) {
  return queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => getProduct(id, signal),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => updateProduct(id, input),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
