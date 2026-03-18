import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'
import { Button } from '@/components/ui'

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ImpactSphere UI error:', error, info)
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="mx-auto mt-24 max-w-lg rounded-xl border border-red-500/30 bg-elevated p-8 text-center">
        <h2 className="text-xl font-semibold text-text">Something broke</h2>
        <p className="mt-2 text-sm text-text-muted">{this.state.errorMessage}</p>
        <Button className="mt-4" onClick={() => this.setState({ hasError: false, errorMessage: '' })}>
          Retry
        </Button>
      </div>
    )
  }
}
