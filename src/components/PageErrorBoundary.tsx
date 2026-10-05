import { Component, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ErrorState } from '@/components/AsyncState'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      // React caches rejected lazy imports, so a full reload is the reliable retry. It also picks
      // up new asset names after a deployment.
      return (
        <ErrorState
          message="This page could not be loaded. Check your connection and try again."
          onRetry={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}

export function PageErrorBoundary({ children }: ErrorBoundaryProps) {
  const { pathname } = useLocation()

  // Reset after navigation so a failure on one page does not hide the next one.
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
}
