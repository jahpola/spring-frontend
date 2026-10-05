import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { LoadingState } from '@/components/AsyncState'
import { NotFoundPage } from '@/components/NotFoundPage'
import { PageErrorBoundary } from '@/components/PageErrorBoundary'

const ProductDetailPage = lazy(() =>
  import('@/features/products/pages/ProductDetailPage').then((module) => ({
    default: module.ProductDetailPage,
  })),
)
const ProductFormPage = lazy(() =>
  import('@/features/products/pages/ProductFormPage').then((module) => ({
    default: module.ProductFormPage,
  })),
)
const ProductListPage = lazy(() =>
  import('@/features/products/pages/ProductListPage').then((module) => ({
    default: module.ProductListPage,
  })),
)

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/products" />} />
        <Route
          element={
            <PageErrorBoundary>
              <Suspense fallback={<LoadingState label="Loading page" />}>
                <Outlet />
              </Suspense>
            </PageErrorBoundary>
          }
        >
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage mode="create" />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage mode="edit" />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
