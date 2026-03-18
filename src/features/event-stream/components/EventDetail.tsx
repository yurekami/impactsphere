import { format } from 'date-fns'
import { EmptyState } from '@/components/feedback'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type { CategorizedEvent } from '../types'

interface EventDetailProps {
  event: CategorizedEvent | null
  relatedEvents: CategorizedEvent[]
}

function formatEventDate(value: string): string {
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) {
    return 'Unknown date'
  }

  return format(timestamp, 'PPpp')
}

export function EventDetail({ event, relatedEvents }: EventDetailProps) {
  if (!event) {
    return (
      <EmptyState
        title="Select an event"
        description="Pick an item from the feed to inspect complete context, metadata, and related events."
      />
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{event.category}</Badge>
          <Badge variant={event.severity === 'critical' ? 'danger' : event.severity === 'high' ? 'warning' : 'default'}>
            {event.severity}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>
        <CardDescription>{formatEventDate(event.pubDate)}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-muted">{event.description || 'No extended summary provided.'}</p>

          <div className="grid gap-3 rounded-lg border border-border bg-surface/60 p-3 text-xs text-text-muted">
            <p>
              <span className="font-semibold text-text">Feed:</span> {event.feedId}
            </p>
            <p>
              <span className="font-semibold text-text">Author:</span> {event.author || 'Unknown'}
            </p>
            <p>
              <span className="font-semibold text-text">Location:</span> {event.location?.name ?? 'Not detected'}
            </p>
            <p>
              <span className="font-semibold text-text">Link:</span>{' '}
              <a
                className="break-all text-accent-soft hover:text-accent"
                href={event.link}
                target="_blank"
                rel="noreferrer"
              >
                {event.link}
              </a>
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Related events
            </h4>
            <ul className="space-y-2">
              {relatedEvents.length === 0 ? (
                <li className="text-xs text-text-muted">No related events in current stream.</li>
              ) : (
                relatedEvents.map((related) => (
                  <li key={`${related.feedId}:${related.guid}`} className="rounded-lg border border-border bg-surface/40 p-2">
                    <p className="text-xs font-medium text-text">{related.title}</p>
                    <p className="text-xs text-text-muted">{formatEventDate(related.pubDate)}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
