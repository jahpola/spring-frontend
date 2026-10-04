import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Button, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Paper sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Typography component="h1" variant="h4">
          Page not found
        </Typography>
        <Typography color="text.secondary">
          The page you requested does not exist or has been moved.
        </Typography>
        <Button component={Link} startIcon={<ArrowBackIcon />} to="/products" variant="contained">
          Back to products
        </Button>
      </Stack>
    </Paper>
  )
}
