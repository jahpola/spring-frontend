import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '@/app/App'

export function renderApp(route: string) {
  window.history.replaceState({}, '', route)
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return {
    client,
    user: userEvent.setup(),
    ...render(<App client={client} />),
  }
}
