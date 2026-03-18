import type { CategorizedEvent, FeedSource } from '../types'

export interface FeedPollerInitConfig {
  feeds: FeedSource[]
  pollIntervalMs: number
  proxyOverride?: string
}

export interface FeedPollResult {
  events: CategorizedEvent[]
  feedUpdates: FeedSource[]
  polledAt: string
}

export type FeedPollListener = (result: FeedPollResult) => void

export interface FeedPollerWorkerApi {
  init: (config: FeedPollerInitConfig) => void
  start: () => Promise<void>
  stop: () => void
  pollNow: () => Promise<FeedPollResult>
  setFeeds: (feeds: FeedSource[]) => void
  setPollInterval: (pollIntervalMs: number) => void
  subscribe: (listener: FeedPollListener) => string
  unsubscribe: (listenerId: string) => void
  dispose: () => void
}
