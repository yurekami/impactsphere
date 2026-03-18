import { Badge } from '@/components/ui'

interface ScoreBadgeProps {
  score: number
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(1, score))

  if (clamped >= 0.8) {
    return <Badge variant="success">High impact {Math.round(clamped * 100)}</Badge>
  }

  if (clamped >= 0.5) {
    return <Badge variant="warning">Moderate impact {Math.round(clamped * 100)}</Badge>
  }

  return <Badge variant="danger">Low impact {Math.round(clamped * 100)}</Badge>
}
