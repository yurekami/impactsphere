import { formatDistanceToNowStrict } from 'date-fns'
import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { CategorizedEvent } from '../types'

interface EventCardProps {
  event: CategorizedEvent
  sourceName: string
  isSelected: boolean
  onSelect: () => void
}

const severityVariantMap = {
  critical: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'neutral',
} as const

function toRelativeTime(pubDate: string): string {
  const timestamp = new Date(pubDate)

  if (Number.isNaN(timestamp.getTime())) {
    return 'unknown time'
  }

  return `${formatDistanceToNowStrict(timestamp, { addSuffix: true })}`
}

export function EventCard({ event, sourceName, isSelected, onSelect }: EventCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition hover:border-accent/60',
        isSelected && 'border-accent/80 ring-2 ring-accent/30',
      )}
      onClick={onSelect}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant={severityVariantMap[event.severity]}>{event.severity}</Badge>
        <Badge variant="neutral">{event.category}</Badge>
        <span className="text-xs text-text-muted">{sourceName}</span>
        <span className="text-xs text-text-muted">{toRelativeTime(event.pubDate)}</span>
      </div>

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">{event.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-text-muted">{event.description || 'No summary available.'}</p>
    </Card>
  )
}
