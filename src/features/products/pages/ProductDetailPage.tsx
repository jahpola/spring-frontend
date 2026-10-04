import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Box, Button, Divider, Grid, Paper, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage, isServerUnavailable } from '@/api/errors'
import { ErrorState, LoadingState } from '@/components/AsyncState'
import { ServerUnavailablePage } from '@/components/ServerUnavailablePage'
import { productDetailOptions, useDeleteProduct } from '@/features/products/api/queries'
import { DeleteProductDialog } from '@/features/products/components/DeleteProductDialog'
import { StockChip } from '@/features/products/components/StockChip'
import { formatPrice, parseProductId } from '@/features/products/utils'

export function ProductDetailPage() {
  const { id: rawId } = useParams()
  const id = parseProductId(rawId)
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteMutation = useDeleteProduct()
  const query = useQuery({
    ...productDetailOptions(id ?? 0),
    enabled: id !== null,
  })

  if (id === null) {
    return <ErrorState message="The product ID is invalid." />
  }
  if (query.isPending) {
    return <LoadingState label="Loading product" />
  }
  if (query.isError && isServerUnavailable(query.error)) {
    return (
      <ServerUnavailablePage
        isRetrying={query.isFetching}
        onRetry={() => {
          void query.refetch()
        }}
        showProductsLink
      />
    )
  }
  if (query.isError) {
    return <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
  }

  const product = query.data
  const confirmDelete = () => {
    deleteMutation.mutate(product.id, {
      onSuccess: () => navigate('/products', { replace: true }),
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography color="text.secondary" variant="overline">
            Product #{product.id}
          </Typography>
          <Typography component="h1" variant="h4">
            {product.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            component={Link}
            startIcon={<EditOutlinedIcon />}
            to={`/products/${product.id}/edit`}
            variant="outlined"
          >
            Edit
          </Button>
          <Button
            color="error"
            onClick={() => {
              deleteMutation.reset()
              setDeleteOpen(true)
            }}
            startIcon={<DeleteOutlinedIcon />}
            variant="outlined"
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: { xs: 3, md: 4 } }} variant="outlined">
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Description
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {product.description || 'No description provided.'}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Price
            </Typography>
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              {formatPrice(product.price)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Stock quantity
            </Typography>
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              {product.stockQuantity ?? 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Availability
            </Typography>
            <StockChip inStock={product.inStock} />
          </Grid>
        </Grid>
      </Paper>

      <DeleteProductDialog
        error={deleteMutation.error}
        isPending={deleteMutation.isPending}
        name={product.name}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        open={deleteOpen}
      />
    </Stack>
  )
}
