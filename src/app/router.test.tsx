import { act, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { renderApp } from '@/test/renderApp'

const pageModule = vi.hoisted(() => {
  let resolveModule: () => void = () => {
    throw new Error('Page module has not started loading')
  }
  const ready = new Promise<void>((resolve) => {
    resolveModule = resolve
  })
  return { ready, resolveModule }
})

vi.mock('@/features/products/pages/ProductListPage', async () => {
  await pageModule.ready
  return {
    ProductListPage: () => <h1>Loaded product catalog</h1>,
  }
})

it('announces lazy page loading while keeping the application layout visible', async () => {
  renderApp('/products')

  expect(screen.getByRole('status', { name: 'Loading page' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Product Hub' })).toBeVisible()
  expect(screen.getByRole('main')).toContainElement(
    screen.getByRole('status', { name: 'Loading page' }),
  )

  await act(async () => {
    pageModule.resolveModule()
    await pageModule.ready
  })

  expect(await screen.findByRole('heading', { name: 'Loaded product catalog' })).toBeVisible()
  expect(screen.queryByRole('status', { name: 'Loading page' })).not.toBeInTheDocument()
})
