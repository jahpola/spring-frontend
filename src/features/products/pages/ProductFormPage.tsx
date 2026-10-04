import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Button, Paper, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage, isServerUnavailable } from '@/api/errors'
import { ErrorState, LoadingState } from '@/components/AsyncState'
import { ServerUnavailablePage } from '@/components/ServerUnavailablePage'
import {
  productDetailOptions,
  useCreateProduct,
  useUpdateProduct,
} from '@/features/products/api/queries'
import { ProductForm } from '@/features/products/components/ProductForm'
import { type ProductFormValues, toProductInput } from '@/features/products/schemas/productForm'
import { parseProductId } from '@/features/products/utils'

interface ProductFormPageProps {
  mode: 'create' | 'edit'
}

const emptyValues: ProductFormValues = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
}

export function ProductFormPage({ mode }: ProductFormPageProps) {
  const { id: rawId } = useParams()
  const id = mode === 'edit' ? parseProductId(rawId) : null
  const navigate = useNavigate()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(id ?? 0)
  const productQuery = useQuery({
    ...productDetailOptions(id ?? 0),
    enabled: mode === 'edit' && id !== null,
  })

  if (mode === 'edit' && id === null) {
    return <ErrorState message="The product ID is invalid." />
  }
  if (mode === 'edit' && productQuery.isPending) {
    return <LoadingState label="Loading product" />
  }
  if (mode === 'edit' && productQuery.isError && isServerUnavailable(productQuery.error)) {
    return (
      <ServerUnavailablePage
        isRetrying={productQuery.isFetching}
        onRetry={() => {
          void productQuery.refetch()
        }}
        showProductsLink
      />
    )
  }
  if (mode === 'edit' && productQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(productQuery.error)}
        onRetry={() => productQuery.refetch()}
      />
    )
  }

  const product = productQuery.data
  const defaultValues: ProductFormValues = product
    ? {
        name: product.name,
        description: product.description ?? '',
        price: String(product.price),
        stockQuantity: product.stockQuantity === null ? '' : String(product.stockQuantity),
      }
    : emptyValues
  const mutation = mode === 'create' ? createMutation : updateMutation

  const submit = (values: ProductFormValues) => {
    mutation.mutate(toProductInput(values), {
      onSuccess: (savedProduct) => navigate(`/products/${savedProduct.id}`, { replace: true }),
    })
  }

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        to="/products"
      >
        Back to products
      </Button>
      <div>
        <Typography component="h1" variant="h4">
          {mode === 'create' ? 'Add product' : 'Edit product'}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {mode === 'create'
            ? 'Add a new product to the catalog.'
            : `Update the details for ${product?.name}.`}
        </Typography>
      </div>
      <Paper sx={{ p: { xs: 3, md: 4 } }} variant="outlined">
        <ProductForm
          defaultValues={defaultValues}
          error={mutation.error}
          isPending={mutation.isPending}
          onCancel={() => navigate(-1)}
          onSubmit={submit}
          submitLabel={mode === 'create' ? 'Create product' : 'Save changes'}
        />
      </Paper>
    </Stack>
  )
}
