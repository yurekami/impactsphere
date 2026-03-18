import { useEffect } from 'react'
import { useEventStreamStore } from '../stores/event-stream.store'

export function useEventStream() {
  const events = useEventStreamStore((state) => state.events)
  const feeds = useEventStreamStore((state) => state.feeds)
  const filters = useEventStreamStore((state) => state.filters)
  const isPolling = useEventStreamStore((state) => state.isPolling)
  const lastPollTime = useEventStreamStore((state) => state.lastPollTime)
  const isHydrated = useEventStreamStore((state) => state.isHydrated)
  const hydratePersistedEvents = useEventStreamStore((state) => state.hydratePersistedEvents)
  const startPolling = useEventStreamStore((state) => state.startPolling)
  const stopPolling = useEventStreamStore((state) => state.stopPolling)

  useEffect(() => {
    if (!isHydrated) {
      void hydratePersistedEvents()
    }
  }, [hydratePersistedEvents, isHydrated])

  return {
    events,
    feeds,
    filters,
    isPolling,
    lastPollTime,
    isHydrated,
    startPolling,
    stopPolling,
  }
}
