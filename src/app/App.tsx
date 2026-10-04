import { CssBaseline, ThemeProvider } from '@mui/material'
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from '@/app/queryClient'
import { AppRouter } from '@/app/router'
import { theme } from '@/app/theme'

interface AppProps {
  client?: QueryClient
}

export function App({ client = queryClient }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
