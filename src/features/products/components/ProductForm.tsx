import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Grid, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError, getErrorMessage } from '@/api/errors'
import { type ProductFormValues, productFormSchema } from '@/features/products/schemas/productForm'

interface ProductFormProps {
  defaultValues: ProductFormValues
  error: unknown
  isPending: boolean
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: ProductFormValues) => void
}

export function ProductForm({
  defaultValues,
  error,
  isPending,
  submitLabel,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!(error instanceof ApiError) || !error.body?.fieldErrors) {
      return
    }
    for (const [field, messages] of Object.entries(error.body.fieldErrors)) {
      if (field in defaultValues && messages[0]) {
        setError(field as keyof ProductFormValues, { type: 'server', message: messages[0] })
      }
    }
  }, [defaultValues, error, setError])

  const globalErrors = error instanceof ApiError ? error.body?.globalErrors : undefined

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)} spacing={3}>
      {error ? (
        <Alert severity="error">
          {globalErrors?.length ? globalErrors.join('. ') : getErrorMessage(error)}
        </Alert>
      ) : null}
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <TextField
            autoFocus
            error={Boolean(errors.name)}
            fullWidth
            helperText={errors.name?.message}
            label="Name"
            required
            {...register('name')}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            error={Boolean(errors.description)}
            fullWidth
            helperText={errors.description?.message || 'Optional, up to 1000 characters'}
            label="Description"
            minRows={4}
            multiline
            {...register('description')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            error={Boolean(errors.price)}
            fullWidth
            helperText={errors.price?.message}
            label="Price"
            required
            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            {...register('price')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            error={Boolean(errors.stockQuantity)}
            fullWidth
            helperText={errors.stockQuantity?.message || 'Leave empty if stock is unknown'}
            label="Stock quantity"
            slotProps={{ htmlInput: { inputMode: 'numeric', min: 0 } }}
            type="number"
            {...register('stockQuantity')}
          />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={isPending} type="submit" variant="contained">
          {isPending ? 'Saving…' : submitLabel}
        </Button>
      </Stack>
    </Stack>
  )
}
