import { expose } from 'comlink'
import { categorizeEvent } from '../lib/event-categorizer'
import { deduplicateEvents } from '../lib/event-deduplicator'
import { geocodeEventText } from '../lib/geocoder'
import { proxyUrl } from '../lib/cors-proxy'
import { parseFeedXml } from '../lib/rss-parser'
import type { CategorizedEvent, FeedSource } from '../types'
import type {
  FeedPollListener,
  FeedPollResult,
  FeedPollerInitConfig,
  FeedPollerWorkerApi,
} from './feed-poller.messages'

const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000
const FEED_FETCH_TIMEOUT_MS = 20_000

async function fetchFeedText(feed: FeedSource, proxyOverride: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FEED_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(proxyUrl(feed.url, proxyOverride), {
      signal: controller.signal,
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

function withLocation(event: CategorizedEvent): CategorizedEvent {
  return {
    ...event,
    location: geocodeEventText(event.title, event.description),
  }
}

class FeedPollerWorker implements FeedPollerWorkerApi {
  private feeds: FeedSource[] = []
  private pollIntervalMs = DEFAULT_POLL_INTERVAL_MS
  private proxyOverride = ''
  private timerId: number | null = null
  private listeners = new Map<string, FeedPollListener>()

  init(config: FeedPollerInitConfig): void {
    this.feeds = config.feeds
    this.pollIntervalMs = config.pollIntervalMs || DEFAULT_POLL_INTERVAL_MS
    this.proxyOverride = config.proxyOverride?.trim() ?? ''
  }

  async start(): Promise<void> {
    this.stop()

    const firstBatch = await this.pollNow()
    this.emit(firstBatch)

    this.timerId = self.setInterval(async () => {
      const nextBatch = await this.pollNow()
      this.emit(nextBatch)
    }, this.pollIntervalMs)
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  async pollNow(): Promise<FeedPollResult> {
    const polledAt = new Date().toISOString()
    const nextFeeds = [...this.feeds]
    const allEvents: CategorizedEvent[] = []

    await Promise.all(
      nextFeeds.map(async (feed, index) => {
        if (!feed.isActive) {
          return
        }

        try {
          const xml = await fetchFeedText(feed, this.proxyOverride)
          const rawEvents = parseFeedXml(xml, feed.id)
          const categorized = rawEvents.map((event) => withLocation(categorizeEvent(event)))

          allEvents.push(...categorized)
          nextFeeds[index] = {
            ...feed,
            lastPolled: polledAt,
            lastError: null,
          }
        } catch (error) {
          nextFeeds[index] = {
            ...feed,
            lastPolled: polledAt,
            lastError: error instanceof Error ? error.message : 'Unknown feed polling error',
          }
        }
      }),
    )

    this.feeds = nextFeeds

    const events = deduplicateEvents(allEvents).sort(
      (left, right) => new Date(right.pubDate).getTime() - new Date(left.pubDate).getTime(),
    )

    return {
      events,
      feedUpdates: nextFeeds,
      polledAt,
    }
  }

  setFeeds(feeds: FeedSource[]): void {
    this.feeds = feeds
  }

  setPollInterval(pollIntervalMs: number): void {
    this.pollIntervalMs = Math.max(10_000, pollIntervalMs)

    if (this.timerId !== null) {
      this.stop()
      void this.start()
    }
  }

  subscribe(listener: FeedPollListener): string {
    const listenerId = crypto.randomUUID()
    this.listeners.set(listenerId, listener)
    return listenerId
  }

  unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId)
  }

  dispose(): void {
    this.stop()
    this.listeners.clear()
  }

  private emit(result: FeedPollResult): void {
    this.listeners.forEach((listener) => {
      listener(result)
    })
  }
}

expose(new FeedPollerWorker())
