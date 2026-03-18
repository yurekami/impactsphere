import type { ReactNode } from 'react'
import { Button, Card, CardDescription, CardTitle } from '@/components/ui'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center text-center">
      {icon ? <div className="mb-4 text-accent">{icon}</div> : null}
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-2 max-w-sm">{description}</CardDescription>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  )
}
