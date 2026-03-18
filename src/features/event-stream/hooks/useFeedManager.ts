import { useEventStreamStore } from '../stores/event-stream.store'

export function useFeedManager() {
  const feeds = useEventStreamStore((state) => state.feeds)
  const addFeed = useEventStreamStore((state) => state.addFeed)
  const removeFeed = useEventStreamStore((state) => state.removeFeed)
  const toggleFeed = useEventStreamStore((state) => state.toggleFeed)

  return {
    feeds,
    addFeed,
    removeFeed,
    toggleFeed,
  }
}
