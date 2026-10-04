import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface ServerUnavailablePageProps {
  isRetrying: boolean
  onRetry: () => void
  showProductsLink?: boolean
}

export function ServerUnavailablePage({
  isRetrying,
  onRetry,
  showProductsLink = false,
}: ServerUnavailablePageProps) {
  return (
    <Paper
      aria-live="polite"
      role="alert"
      sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}
      variant="outlined"
    >
      <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
        <CloudOffOutlinedIcon color="disabled" sx={{ fontSize: 64 }} />
        <div>
          <Typography component="h1" gutterBottom variant="h4">
            Server unavailable
          </Typography>
          <Typography color="text.secondary">
            Product Hub cannot reach the product service. Check that the server is running and try
            again.
          </Typography>
        </div>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            disabled={isRetrying}
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            variant="contained"
          >
            {isRetrying ? 'Trying again…' : 'Try again'}
          </Button>
          {showProductsLink ? (
            <Button component={Link} to="/products" variant="outlined">
              Back to products
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  )
}
