import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary, ToastProvider } from '@/components/feedback'

export function Providers({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
