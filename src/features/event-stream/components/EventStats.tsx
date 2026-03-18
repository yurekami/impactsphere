import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { CategorizedEvent, EventCategory } from '../types'

interface EventStatsProps {
  events: CategorizedEvent[]
}

const categories: EventCategory[] = [
  'security',
  'outage',
  'regulatory',
  'release',
  'vulnerability',
  'general',
]

export function EventStats({ events }: EventStatsProps) {
  const counts = categories.map((category) => ({
    category,
    count: events.filter((event) => event.category === category).length,
  }))

  const maxCount = Math.max(...counts.map((item) => item.count), 1)
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const eventsPerHour = events.filter((event) => new Date(event.pubDate).getTime() >= oneHourAgo).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {counts.map((item) => (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
                <span>{item.category}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-surface">
                <div
                  className="h-2 rounded-full bg-accent/70"
                  style={{ width: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-surface/60 p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted">Events per hour</p>
            <p className="text-lg font-semibold text-text">{eventsPerHour}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
