import { screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/renderApp'

vi.mock('@/features/products/pages/ProductListPage', () => {
  throw new Error('Failed to fetch dynamically imported module')
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('shows a retryable error inside the layout when a page fails to load', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { user } = renderApp('/products')

  expect(await screen.findByText(/this page could not be loaded/i)).toBeVisible()
  expect(screen.getByRole('link', { name: 'Product Hub' })).toBeVisible()

  const reload = vi.fn()
  vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload })

  await user.click(screen.getByRole('button', { name: 'Retry' }))
  expect(reload).toHaveBeenCalledOnce()
})
