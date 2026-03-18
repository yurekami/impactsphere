import { useMemo } from 'react'
import { useEventStreamStore } from '../stores/event-stream.store'
import type { CategorizedEvent } from '../types'

function matchesSearch(event: CategorizedEvent, search: string): boolean {
  if (!search.trim()) {
    return true
  }

  const normalizedQuery = search.toLowerCase()
  const haystack = [
    event.title,
    event.description,
    event.author,
    event.link,
    event.category,
    event.severity,
    ...event.categories,
    ...event.extractedKeywords,
    event.location?.name ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

function matchesDateRange(
  event: CategorizedEvent,
  start: string | null,
  end: string | null,
): boolean {
  const eventDate = new Date(event.pubDate)

  if (Number.isNaN(eventDate.getTime())) {
    return false
  }

  if (start) {
    const startDate = new Date(start)
    if (!Number.isNaN(startDate.getTime()) && eventDate < startDate) {
      return false
    }
  }

  if (end) {
    const endDate = new Date(end)
    if (!Number.isNaN(endDate.getTime()) && eventDate > endDate) {
      return false
    }
  }

  return true
}

export function useEventFilter() {
  const events = useEventStreamStore((state) => state.events)
  const filters = useEventStreamStore((state) => state.filters)
  const setFilter = useEventStreamStore((state) => state.setFilter)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const categoryMatch = filters.categories.includes(event.category)
      const severityMatch = filters.severities.includes(event.severity)
      const dateMatch = matchesDateRange(event, filters.dateRange.start, filters.dateRange.end)
      const searchMatch = matchesSearch(event, filters.search)

      return categoryMatch && severityMatch && dateMatch && searchMatch
    })
  }, [events, filters])

  return {
    filters,
    filteredEvents,
    setFilter,
  }
}
