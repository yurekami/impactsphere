import type { ReactNode } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface MetricCardProps {
  label: string
  value: string
  hint?: string
  trend?: ReactNode
}

export function MetricCard({ label, value, hint, trend }: MetricCardProps) {
  return (
    <Card className="min-h-36">
      <CardHeader className="mb-2">
        <CardTitle className="text-sm text-text-muted">{label}</CardTitle>
        {trend}
      </CardHeader>
      <p className="text-3xl font-semibold text-text">{value}</p>
      {hint ? <CardDescription className="mt-2 text-xs">{hint}</CardDescription> : null}
    </Card>
  )
}
