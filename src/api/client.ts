import { ApiError, type ApiErrorBody } from '@/api/errors'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    throw new ApiError(
      response.status,
      `The server returned an unexpected response (${response.status})`,
    )
  }

  try {
    return await response.json()
  } catch {
    throw new ApiError(response.status, 'The server returned invalid JSON')
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${configuredBaseUrl}${path}`, {
      ...init,
      signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await parseJson(response)
  if (!response.ok) {
    const body = data as ApiErrorBody
    throw new ApiError(
      response.status,
      body.message || body.error || `Request failed (${response.status})`,
      body,
    )
  }

  return data as T
}
