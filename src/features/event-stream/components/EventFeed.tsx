import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { EmptyState } from '@/components/feedback'
import { Card } from '@/components/ui'
import type { CategorizedEvent, FeedSource } from '../types'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: CategorizedEvent[]
  feeds: FeedSource[]
  selectedEventKey: string | null
  onSelectEvent: (event: CategorizedEvent) => void
}

function eventKey(event: CategorizedEvent): string {
  return `${event.feedId}:${event.guid}`
}

export function EventFeed({ events, feeds, selectedEventKey, onSelectEvent }: EventFeedProps) {
  const parentRef = useRef<HTMLDivElement | null>(null)
  const feedNameById = new Map(feeds.map((feed) => [feed.id, feed.name]))

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 168,
    overscan: 8,
  })

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events match current filters"
        description="Adjust category, severity, date range, or search terms to expand the stream."
      />
    )
  }

  return (
    <Card className="p-0">
      <div ref={parentRef} className="h-[62vh] overflow-auto">
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((row) => {
            const event = events[row.index]
            const key = eventKey(event)

            return (
              <div
                key={key}
                className="absolute left-0 top-0 w-full px-3 py-2"
                style={{ transform: `translateY(${row.start}px)` }}
              >
                <EventCard
                  event={event}
                  sourceName={feedNameById.get(event.feedId) ?? event.feedId}
                  isSelected={selectedEventKey === key}
                  onSelect={() => onSelectEvent(event)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
