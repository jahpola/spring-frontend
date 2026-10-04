import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage, isServerUnavailable } from '@/api/errors'
import { ServerUnavailablePage } from '@/components/ServerUnavailablePage'
import { productListOptions, useDeleteProduct } from '@/features/products/api/queries'
import { DeleteProductDialog } from '@/features/products/components/DeleteProductDialog'
import { StockChip } from '@/features/products/components/StockChip'
import type { PageResponse, Product } from '@/features/products/types/product'
import { formatPrice } from '@/features/products/utils'

const allowedPageSizes = [10, 20, 50]
const skeletonRows = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5']
const skeletonCells = ['name', 'description', 'price', 'quantity', 'status', 'actions']

function parseNonNegativeInt(value: string | null, fallback: number) {
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : fallback
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const page = parseNonNegativeInt(searchParams.get('page'), 0)
  const requestedSize = parseNonNegativeInt(searchParams.get('size'), 20)
  const size = allowedPageSizes.includes(requestedSize) ? requestedSize : 20
  const sortField = searchParams.get('sort') === 'price' ? 'price' : 'name'
  const sortDirection = searchParams.get('direction') === 'desc' ? 'desc' : 'asc'
  const params = { page, size, sort: `${sortField},${sortDirection}` }
  const query = useQuery({
    ...productListOptions(params),
    placeholderData: keepPreviousData,
  })
  const lastSuccessfulPage = useRef<PageResponse<Product> | undefined>(undefined)
  if (query.data && !query.isPlaceholderData) {
    lastSuccessfulPage.current = query.data
  }
  const visiblePage = query.data ?? lastSuccessfulPage.current
  const deleteMutation = useDeleteProduct()

  const updateParams = (next: Record<string, string>) => {
    setSearchParams((current) => {
      const updated = new URLSearchParams(current)
      for (const [key, value] of Object.entries(next)) {
        updated.set(key, value)
      }
      return updated
    })
  }

  const changeSort = (field: 'name' | 'price') => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    updateParams({ sort: field, direction, page: '0' })
  }

  const confirmDelete = () => {
    if (!selectedProduct) {
      return
    }
    deleteMutation.mutate(selectedProduct.id, {
      onSuccess: () => setSelectedProduct(null),
    })
  }

  if (query.isError && !visiblePage && isServerUnavailable(query.error)) {
    return (
      <ServerUnavailablePage
        isRetrying={query.isFetching}
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h1" variant="h4">
            Products
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your product catalog and inventory.
          </Typography>
        </Box>
        <Button component={Link} startIcon={<AddIcon />} to="/products/new" variant="contained">
          Add product
        </Button>
      </Stack>

      {query.isError ? (
        <Alert
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
          severity="error"
        >
          {getErrorMessage(query.error)}
        </Alert>
      ) : null}

      <Paper variant="outlined">
        <TableContainer>
          <Table aria-label="Products">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortField === 'name' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => changeSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell
                  align="right"
                  sortDirection={sortField === 'price' ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortField === 'price'}
                    direction={sortField === 'price' ? sortDirection : 'asc'}
                    onClick={() => changeSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.isPending
                ? skeletonRows.map((row) => (
                    <TableRow key={row}>
                      {skeletonCells.map((cell) => (
                        <TableCell key={cell}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}
              {visiblePage?.content.map((product) => (
                <TableRow hover key={product.id}>
                  <TableCell sx={{ fontWeight: 650 }}>{product.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 320 }}>
                    <Typography noWrap variant="body2">
                      {product.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatPrice(product.price)}</TableCell>
                  <TableCell align="right">{product.stockQuantity ?? '—'}</TableCell>
                  <TableCell>
                    <StockChip inStock={product.inStock} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View product">
                      <IconButton
                        aria-label={`View ${product.name}`}
                        component={Link}
                        to={`/products/${product.id}`}
                      >
                        <VisibilityOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit product">
                      <IconButton
                        aria-label={`Edit ${product.name}`}
                        component={Link}
                        to={`/products/${product.id}/edit`}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete product">
                      <IconButton
                        aria-label={`Delete ${product.name}`}
                        color="error"
                        onClick={() => {
                          deleteMutation.reset()
                          setSelectedProduct(product)
                        }}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!query.isPending && visiblePage?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Stack spacing={1} sx={{ alignItems: 'center', py: 7, textAlign: 'center' }}>
                      <Typography sx={{ fontWeight: 700 }}>No products yet</Typography>
                      <Typography color="text.secondary">
                        Add your first product to start building the catalog.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={visiblePage?.page.totalElements ?? 0}
          onPageChange={(_, nextPage) => updateParams({ page: String(nextPage) })}
          onRowsPerPageChange={(event) => updateParams({ size: event.target.value, page: '0' })}
          page={page}
          rowsPerPage={size}
          rowsPerPageOptions={allowedPageSizes}
        />
      </Paper>

      {selectedProduct ? (
        <DeleteProductDialog
          error={deleteMutation.error}
          isPending={deleteMutation.isPending}
          name={selectedProduct.name}
          onCancel={() => setSelectedProduct(null)}
          onConfirm={confirmDelete}
          open
        />
      ) : null}
    </Stack>
  )
}
