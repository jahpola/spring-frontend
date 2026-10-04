import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import type { PageResponse, Product, ProductInput } from '@/features/products/types/product'
import { renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const product: Product = {
  id: 1,
  name: 'Coffee',
  description: 'Freshly roasted beans',
  price: '12.50',
  stockQuantity: 8,
  inStock: true,
}

function productPage(
  products: Product[] = [product],
  overrides: Partial<PageResponse<Product>['page']> = {},
): PageResponse<Product> {
  return {
    content: products,
    page: {
      totalElements: products.length,
      totalPages: products.length > 0 ? 1 : 0,
      number: 0,
      size: 20,
      ...overrides,
    },
  }
}

async function fillProductForm(
  user: ReturnType<typeof renderApp>['user'],
  values: {
    name?: string
    description?: string
    price?: string
    stockQuantity?: string
  },
) {
  if (values.name) {
    await user.type(screen.getByRole('textbox', { name: /^name$/i }), values.name)
  }
  if (values.description) {
    await user.type(screen.getByRole('textbox', { name: /^description$/i }), values.description)
  }
  if (values.price) {
    await user.type(screen.getByRole('textbox', { name: /^price$/i }), values.price)
  }
  if (values.stockQuantity) {
    await user.type(
      screen.getByRole('spinbutton', { name: /^stock quantity$/i }),
      values.stockQuantity,
    )
  }
  return user
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('product queries', () => {
  it('shows a retryable page when the server is unavailable', async () => {
    let serverAvailable = false
    server.use(
      http.get('/api/products', () => {
        if (!serverAvailable) {
          return HttpResponse.error()
        }
        return HttpResponse.json(productPage())
      }),
    )
    const { user } = renderApp('/products')

    expect(await screen.findByRole('heading', { name: 'Server unavailable' })).toBeInTheDocument()
    expect(screen.getByText('Product Hub')).toBeInTheDocument()

    serverAvailable = true
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    const table = await screen.findByRole('table', { name: 'Products' })
    expect(within(table).getByText('Coffee')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Server unavailable' })).not.toBeInTheDocument()
  })

  it('keeps HTTP server errors in the regular page error state', async () => {
    server.use(
      http.get('/api/products', () =>
        HttpResponse.json(
          {
            status: 500,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
          },
          { status: 500 },
        ),
      ),
    )

    renderApp('/products')

    expect(await screen.findByText('An unexpected error occurred')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Server unavailable' })).not.toBeInTheDocument()
  })

  it('renders products returned by the backend', async () => {
    server.use(http.get('/api/products', () => HttpResponse.json(productPage())))

    renderApp('/products')

    const table = await screen.findByRole('table', { name: 'Products' })
    expect(await within(table).findByText('Coffee')).toBeInTheDocument()
    expect(within(table).getByText('Freshly roasted beans')).toBeInTheDocument()
    expect(within(table).getByText('In stock')).toBeInTheDocument()
  })

  it('sends default and selected sorting parameters', async () => {
    const requests: URL[] = []
    server.use(
      http.get('/api/products', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json(productPage())
      }),
    )
    const { user } = renderApp('/products')

    await screen.findByText('Coffee')
    await user.click(screen.getByRole('button', { name: /^price$/i }))

    await waitFor(() => expect(requests).toHaveLength(2))
    expect(requests[0]?.searchParams.get('page')).toBe('0')
    expect(requests[0]?.searchParams.get('size')).toBe('20')
    expect(requests[0]?.searchParams.get('sort')).toBe('name,asc')
    expect(requests[1]?.searchParams.get('sort')).toBe('price,asc')
    expect(new URLSearchParams(window.location.search).get('sort')).toBe('price')
  })

  it('preserves cached products when a sorted request loses the connection', async () => {
    let requestCount = 0
    server.use(
      http.get('/api/products', () => {
        requestCount += 1
        return requestCount === 1 ? HttpResponse.json(productPage()) : HttpResponse.error()
      }),
    )
    const { user } = renderApp('/products')

    const table = await screen.findByRole('table', { name: 'Products' })
    await within(table).findByText('Coffee')
    await user.click(screen.getByRole('button', { name: /^price$/i }))

    expect(await screen.findByText(/Unable to reach the server/i)).toBeInTheDocument()
    expect(within(table).getByText('Coffee')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Server unavailable' })).not.toBeInTheDocument()
  })

  it('shows a regular error for a missing product', async () => {
    server.use(
      http.get('/api/products/999', () =>
        HttpResponse.json(
          {
            status: 404,
            error: 'Product Not Found',
            message: 'Product not found with id: 999',
          },
          { status: 404 },
        ),
      ),
    )

    renderApp('/products/999')

    expect(await screen.findByText('Product not found with id: 999')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Server unavailable' })).not.toBeInTheDocument()
  })
})

describe('product mutations', () => {
  it('creates a product and opens its detail page', async () => {
    let submittedBody: ProductInput | undefined
    server.use(
      http.post('/api/products', async ({ request }) => {
        submittedBody = (await request.json()) as ProductInput
        return HttpResponse.json(product, { status: 201 })
      }),
      http.get('/api/products/1', () => HttpResponse.json(product)),
    )
    const { user } = renderApp('/products/new')
    await fillProductForm(user, {
      name: 'Coffee',
      description: 'Freshly roasted beans',
      price: '12.50',
      stockQuantity: '8',
    })

    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(await screen.findByRole('heading', { name: 'Coffee' })).toBeInTheDocument()
    expect(submittedBody).toEqual({
      name: 'Coffee',
      description: 'Freshly roasted beans',
      price: '12.50',
      stockQuantity: 8,
    })
  })

  it('maps backend validation errors and preserves entered values', async () => {
    server.use(
      http.post('/api/products', () =>
        HttpResponse.json(
          {
            status: 400,
            error: 'Validation Failed',
            message: 'Request validation failed',
            fieldErrors: {
              name: ['Product name already exists'],
            },
          },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderApp('/products/new')
    await fillProductForm(user, {
      name: 'Coffee',
      description: 'Freshly roasted beans',
      price: '12.50',
      stockQuantity: '8',
    })

    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(await screen.findByText('Product name already exists')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^name$/i })).toHaveValue('Coffee')
    expect(screen.getByRole('textbox', { name: /^description$/i })).toHaveValue(
      'Freshly roasted beans',
    )
    expect(screen.getByRole('textbox', { name: /^price$/i })).toHaveValue('12.50')
    expect(screen.getByRole('spinbutton', { name: /^stock quantity$/i })).toHaveValue(8)
  })

  it('keeps form values after a network failure', async () => {
    server.use(http.post('/api/products', () => HttpResponse.error()))
    const { user } = renderApp('/products/new')
    await fillProductForm(user, {
      name: 'Coffee',
      price: '12.50',
    })

    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(await screen.findByText(/Unable to reach the server/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^name$/i })).toHaveValue('Coffee')
    expect(screen.getByRole('textbox', { name: /^price$/i })).toHaveValue('12.50')
    expect(screen.queryByRole('heading', { name: 'Server unavailable' })).not.toBeInTheDocument()
  })

  it('edits a product and opens the updated detail page', async () => {
    const updatedProduct = { ...product, name: 'Dark Roast', price: '14.00' }
    let submittedBody: ProductInput | undefined
    server.use(
      http.get('/api/products/1', () => HttpResponse.json(product)),
      http.put('/api/products/1', async ({ request }) => {
        submittedBody = (await request.json()) as ProductInput
        return HttpResponse.json(updatedProduct)
      }),
    )
    const { user } = renderApp('/products/1/edit')

    const nameInput = await screen.findByRole('textbox', { name: /^name$/i })
    await user.clear(nameInput)
    await user.type(nameInput, 'Dark Roast')
    const priceInput = screen.getByRole('textbox', { name: /^price$/i })
    await user.clear(priceInput)
    await user.type(priceInput, '14.00')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Dark Roast' })).toBeInTheDocument()
    expect(submittedBody).toEqual({
      name: 'Dark Roast',
      description: 'Freshly roasted beans',
      price: '14.00',
      stockQuantity: 8,
    })
  })

  it('cancels and then confirms product deletion', async () => {
    let deleteRequests = 0
    server.use(
      http.get('/api/products/1', () => HttpResponse.json(product)),
      http.delete('/api/products/1', () => {
        deleteRequests += 1
        return new HttpResponse(null, { status: 204 })
      }),
      http.get('/api/products', () => HttpResponse.json(productPage([]))),
    )
    const { user } = renderApp('/products/1')

    await screen.findByRole('heading', { name: 'Coffee' })
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    let dialog = await screen.findByRole('dialog', { name: 'Delete product?' })
    expect(within(dialog).getByText('Coffee')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(deleteRequests).toBe(0)
    await waitForElementToBeRemoved(dialog)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    dialog = await screen.findByRole('dialog', { name: 'Delete product?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('heading', { name: 'Products' })).toBeInTheDocument()
    expect(deleteRequests).toBe(1)
  })

  it('keeps the confirmation dialog open when deletion fails', async () => {
    server.use(
      http.get('/api/products/1', () => HttpResponse.json(product)),
      http.delete('/api/products/1', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'Product is currently in use',
          },
          { status: 409 },
        ),
      ),
    )
    const { user } = renderApp('/products/1')

    await screen.findByRole('heading', { name: 'Coffee' })
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete product?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(await within(dialog).findByText('Product is currently in use')).toBeInTheDocument()
    expect(dialog).toBeInTheDocument()
  })
})
