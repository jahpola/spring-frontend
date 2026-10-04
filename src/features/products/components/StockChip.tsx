import { Chip } from '@mui/material'

export function StockChip({ inStock }: { inStock: boolean }) {
  return (
    <Chip
      color={inStock ? 'success' : 'default'}
      label={inStock ? 'In stock' : 'Out of stock'}
      size="small"
      variant={inStock ? 'filled' : 'outlined'}
    />
  )
}
