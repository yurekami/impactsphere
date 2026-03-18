import Dexie, { type EntityTable } from 'dexie'
import { proxy } from 'comlink'
import { create } from 'zustand'
import { createWorkerProxy, type WorkerController } from '@/lib/workers/worker-utils'
import { useSettingsStore } from '@/stores/settings.store'
import { deduplicateEvents } from '../lib/event-deduplicator'
import { DEFAULT_FEED_SOURCES } from '../lib/default-feeds'
import type {
  CategorizedEvent,
  EventCategory,
  EventFilter,
  FeedSource,
  Severity,
} from '../types'
import type { FeedPollResult, FeedPollerWorkerApi } from '../workers/feed-poller.messages'

const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000
const MAX_PERSISTED_EVENTS = 1500

const DEFAULT_CATEGORIES: EventCategory[] = [
  'security',
  'outage',
  'regulatory',
  'release',
  'vulnerability',
  'general',
]

const DEFAULT_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low']

const DEFAULT_FILTERS: EventFilter = {
  categories: DEFAULT_CATEGORIES,
  severities: DEFAULT_SEVERITIES,
  dateRange: {
    start: null,
    end: null,
  },
  search: '',
}

interface PersistedEventRecord extends CategorizedEvent {
  id: string
}

class EventStreamDatabase extends Dexie {
  eventStreamEvents!: EntityTable<PersistedEventRecord, 'id'>

  constructor() {
    super('impactsphere-event-stream')

    this.version(1).stores({
      eventStreamEvents: '&id,pubDate,category,severity,feedId',
    })
  }
}

const eventStreamDb = new EventStreamDatabase()

function eventKey(event: CategorizedEvent): string {
  return `${event.feedId}:${event.guid}`
}

function sortByNewest(events: CategorizedEvent[]): CategorizedEvent[] {
  return [...events].sort(
    (left, right) => new Date(right.pubDate).getTime() - new Date(left.pubDate).getTime(),
  )
}

function mergeEventCollections(
  currentEvents: CategorizedEvent[],
  incomingEvents: CategorizedEvent[],
): CategorizedEvent[] {
  const merged = deduplicateEvents([...currentEvents, ...incomingEvents])
  return sortByNewest(merged).slice(0, MAX_PERSISTED_EVENTS)
}

async function loadPersistedEvents(): Promise<CategorizedEvent[]> {
  const rows = await eventStreamDb.eventStreamEvents.toArray()

  return sortByNewest(rows).map(({ id: _id, ...event }) => event)
}

async function persistEvents(events: CategorizedEvent[]): Promise<void> {
  const limited = sortByNewest(events).slice(0, MAX_PERSISTED_EVENTS)

  await eventStreamDb.transaction('rw', eventStreamDb.eventStreamEvents, async () => {
    await eventStreamDb.eventStreamEvents.clear()
    await eventStreamDb.eventStreamEvents.bulkPut(
      limited.map((event) => ({
        ...event,
        id: eventKey(event),
      })),
    )
  })
}

function createFeedPollerController(): WorkerController<FeedPollerWorkerApi> {
  return createWorkerProxy<FeedPollerWorkerApi>(
    () => new Worker(new URL('../workers/feed-poller.worker.ts', import.meta.url), { type: 'module' }),
  )
}

let feedPollerController: WorkerController<FeedPollerWorkerApi> | null = null
let pollerListenerId: string | null = null

function pollingIntervalFromSettings(): number {
  const configuredSeconds = useSettingsStore.getState().pollingIntervalSeconds

  if (!Number.isFinite(configuredSeconds) || configuredSeconds <= 0) {
    return DEFAULT_POLL_INTERVAL_MS
  }

  return configuredSeconds * 1000
}

async function syncWorkerFeeds(feeds: FeedSource[]): Promise<void> {
  if (!feedPollerController) {
    return
  }

  await feedPollerController.proxy.setFeeds(feeds)
}

export interface NewFeedInput {
  name: string
  url: string
  category: string
  isActive: boolean
}

interface EventStreamStore {
  events: CategorizedEvent[]
  feeds: FeedSource[]
  filters: EventFilter
  isPolling: boolean
  lastPollTime: string | null
  isHydrated: boolean
  startPolling: () => Promise<void>
  stopPolling: () => Promise<void>
  addFeed: (input: NewFeedInput) => Promise<void>
  removeFeed: (feedId: string) => Promise<void>
  toggleFeed: (feedId: string) => Promise<void>
  setFilter: (nextFilter: Partial<EventFilter>) => void
  hydratePersistedEvents: () => Promise<void>
}

export const useEventStreamStore = create<EventStreamStore>((set, get) => ({
  events: [],
  feeds: DEFAULT_FEED_SOURCES,
  filters: DEFAULT_FILTERS,
  isPolling: false,
  lastPollTime: null,
  isHydrated: false,
  hydratePersistedEvents: async () => {
    const events = await loadPersistedEvents()
    set({ events, isHydrated: true })
  },
  startPolling: async () => {
    if (get().isPolling) {
      return
    }

    if (!feedPollerController) {
      feedPollerController = createFeedPollerController()
    }

    const feedSnapshot = get().feeds
    const onBatch = proxy((result: FeedPollResult) => {
      const mergedEvents = mergeEventCollections(get().events, result.events)

      set({
        events: mergedEvents,
        feeds: result.feedUpdates,
        lastPollTime: result.polledAt,
      })

      void persistEvents(mergedEvents)
    })

    try {
      await feedPollerController.proxy.init({
        feeds: feedSnapshot,
        pollIntervalMs: pollingIntervalFromSettings(),
        proxyOverride: useSettingsStore.getState().proxyUrl,
      })

      pollerListenerId = await feedPollerController.proxy.subscribe(onBatch)
      await feedPollerController.proxy.start()

      set({ isPolling: true })
    } catch (error) {
      set({ isPolling: false })
      throw error
    }
  },
  stopPolling: async () => {
    if (!feedPollerController) {
      set({ isPolling: false })
      return
    }

    if (pollerListenerId) {
      await feedPollerController.proxy.unsubscribe(pollerListenerId)
      pollerListenerId = null
    }

    await feedPollerController.proxy.stop()
    set({ isPolling: false })
  },
  addFeed: async (input) => {
    const nextFeed: FeedSource = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      url: input.url.trim(),
      category: input.category.trim() || 'general',
      isActive: input.isActive,
      lastPolled: null,
      lastError: null,
    }

    const nextFeeds = [...get().feeds, nextFeed]
    set({ feeds: nextFeeds })

    await syncWorkerFeeds(nextFeeds)
  },
  removeFeed: async (feedId) => {
    const nextFeeds = get().feeds.filter((feed) => feed.id !== feedId)
    set({ feeds: nextFeeds })

    await syncWorkerFeeds(nextFeeds)
  },
  toggleFeed: async (feedId) => {
    const nextFeeds = get().feeds.map((feed) =>
      feed.id === feedId ? { ...feed, isActive: !feed.isActive } : feed,
    )

    set({ feeds: nextFeeds })

    await syncWorkerFeeds(nextFeeds)
  },
  setFilter: (nextFilter) => {
    const current = get().filters
    const merged: EventFilter = {
      ...current,
      ...nextFilter,
      dateRange: {
        ...current.dateRange,
        ...nextFilter.dateRange,
      },
    }

    set({ filters: merged })
  },
}))
