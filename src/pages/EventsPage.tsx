import { useEffect, useMemo, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { EventDetail } from '@/features/event-stream/components/EventDetail'
import { EventFeed } from '@/features/event-stream/components/EventFeed'
import { EventFilter } from '@/features/event-stream/components/EventFilter'
import { EventStats } from '@/features/event-stream/components/EventStats'
import { FeedManager } from '@/features/event-stream/components/FeedManager'
import { useEventFilter } from '@/features/event-stream/hooks/useEventFilter'
import { useEventStream } from '@/features/event-stream/hooks/useEventStream'
import type { EventCategory, EventFilter as EventFilterState, Severity } from '@/features/event-stream/types'

const DEFAULT_CATEGORIES: EventCategory[] = [
  'security',
  'outage',
  'regulatory',
  'release',
  'vulnerability',
  'general',
]

const DEFAULT_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low']

const DEFAULT_FILTER: EventFilterState = {
  categories: DEFAULT_CATEGORIES,
  severities: DEFAULT_SEVERITIES,
  dateRange: {
    start: null,
    end: null,
  },
  search: '',
}

function getEventKey(feedId: string, guid: string): string {
  return `${feedId}:${guid}`
}

export default function EventsPage() {
  const [isFeedManagerOpen, setFeedManagerOpen] = useState(false)
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null)

  const { feeds, isPolling, lastPollTime, startPolling, stopPolling } = useEventStream()
  const { filters, filteredEvents, setFilter } = useEventFilter()

  useEffect(() => {
    void startPolling()

    return () => {
      void stopPolling()
    }
  }, [startPolling, stopPolling])

  useEffect(() => {
    if (filteredEvents.length === 0) {
      setSelectedEventKey(null)
      return
    }

    if (!selectedEventKey) {
      const first = filteredEvents[0]
      setSelectedEventKey(getEventKey(first.feedId, first.guid))
      return
    }

    const hasSelection = filteredEvents.some(
      (event) => getEventKey(event.feedId, event.guid) === selectedEventKey,
    )

    if (!hasSelection) {
      const first = filteredEvents[0]
      setSelectedEventKey(getEventKey(first.feedId, first.guid))
    }
  }, [filteredEvents, selectedEventKey])

  const selectedEvent =
    filteredEvents.find((event) => getEventKey(event.feedId, event.guid) === selectedEventKey) ?? null

  const relatedEvents = useMemo(() => {
    if (!selectedEvent) {
      return []
    }

    return filteredEvents
      .filter(
        (event) =>
          getEventKey(event.feedId, event.guid) !== selectedEventKey &&
          (event.category === selectedEvent.category ||
            event.location?.name === selectedEvent.location?.name),
      )
      .slice(0, 4)
  }, [filteredEvents, selectedEvent, selectedEventKey])

  return (
    <section className="space-y-6">
      <PageHeader
        title="Event Stream"
        description="Live intelligence stream from infrastructure status, security advisories, and release channels."
        actions={
          <>
            <Badge variant={isPolling ? 'success' : 'neutral'}>
              {isPolling ? 'Polling active' : 'Polling paused'}
            </Badge>
            <Button variant="secondary" onClick={() => setFeedManagerOpen(true)}>
              Manage Feeds
            </Button>
            {isPolling ? (
              <Button variant="ghost" onClick={() => void stopPolling()}>
                Pause
              </Button>
            ) : (
              <Button onClick={() => void startPolling()}>Resume</Button>
            )}
          </>
        }
      />

      <EventFilter
        filters={filters}
        onChange={setFilter}
        onReset={() => setFilter(DEFAULT_FILTER)}
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <EventFeed
          events={filteredEvents}
          feeds={feeds}
          selectedEventKey={selectedEventKey}
          onSelectEvent={(event) => setSelectedEventKey(getEventKey(event.feedId, event.guid))}
        />

        <div className="grid gap-4">
          <EventStats events={filteredEvents} />
          <EventDetail event={selectedEvent} relatedEvents={relatedEvents} />
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Last poll: {lastPollTime ? new Date(lastPollTime).toLocaleString() : 'Waiting for first poll'}
      </p>

      <FeedManager open={isFeedManagerOpen} onClose={() => setFeedManagerOpen(false)} />
    </section>
  )
}
