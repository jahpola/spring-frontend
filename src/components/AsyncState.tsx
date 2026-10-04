import RefreshIcon from '@mui/icons-material/Refresh'
import { Alert, Box, Button, CircularProgress } from '@mui/material'

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <Box
      aria-label={label}
      role="status"
      sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}
    >
      <CircularProgress />
    </Box>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      action={
        onRetry ? (
          <Button color="inherit" onClick={onRetry} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        ) : undefined
      }
      severity="error"
    >
      {message}
    </Alert>
  )
}
