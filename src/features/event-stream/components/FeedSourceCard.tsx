import { Badge, Button, Card, Switch } from '@/components/ui'
import type { FeedSource } from '../types'

interface FeedSourceCardProps {
  feed: FeedSource
  onToggle: (feedId: string) => void
  onRemove: (feedId: string) => void
}

export function FeedSourceCard({ feed, onToggle, onRemove }: FeedSourceCardProps) {
  const health = feed.lastError ? 'error' : feed.lastPolled ? 'healthy' : 'idle'

  return (
    <Card className="p-3">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">{feed.name}</p>
            <p className="mt-1 break-all text-xs text-text-muted">{feed.url}</p>
          </div>
          <Switch checked={feed.isActive} onCheckedChange={() => onToggle(feed.id)} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={health === 'error' ? 'danger' : health === 'healthy' ? 'success' : 'neutral'}>
              {health}
            </Badge>
            <Badge variant="neutral">{feed.category}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(feed.id)}>
            Remove
          </Button>
        </div>

        {feed.lastError ? <p className="text-xs text-red-300">{feed.lastError}</p> : null}
      </div>
    </Card>
  )
}
