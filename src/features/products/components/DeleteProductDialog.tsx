import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { getErrorMessage } from '@/api/errors'

interface DeleteProductDialogProps {
  name: string
  open: boolean
  isPending: boolean
  error: unknown
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteProductDialog({
  name,
  open,
  isPending,
  error,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={isPending ? undefined : onCancel} open={open}>
      <DialogTitle>Delete product?</DialogTitle>
      <DialogContent>
        <Typography>
          <strong>{name}</strong> will be permanently deleted. This action cannot be undone.
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <Button color="error" disabled={isPending} onClick={onConfirm} variant="contained">
          {isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
