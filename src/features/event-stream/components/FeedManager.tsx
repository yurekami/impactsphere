import { useMemo, useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useFeedManager } from '../hooks/useFeedManager'
import type { EventCategory } from '../types'
import { FeedSourceCard } from './FeedSourceCard'

interface FeedManagerProps {
  open: boolean
  onClose: () => void
}

const CATEGORY_OPTIONS: EventCategory[] = [
  'security',
  'outage',
  'regulatory',
  'release',
  'vulnerability',
  'general',
]

export function FeedManager({ open, onClose }: FeedManagerProps) {
  const { feeds, addFeed, removeFeed, toggleFeed } = useFeedManager()
  const [isAddFeedOpen, setAddFeedOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<EventCategory>('general')

  const sortedFeeds = useMemo(() => {
    return [...feeds].sort((left, right) => left.name.localeCompare(right.name))
  }, [feeds])

  const handleAddFeed = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !url.trim()) {
      return
    }

    await addFeed({
      name,
      url,
      category,
      isActive: true,
    })

    setName('')
    setUrl('')
    setCategory('general')
    setAddFeedOpen(false)
  }

  return (
    <>
      <aside
        className={cn(
          'fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-border bg-elevated/95 p-4 shadow-2xl backdrop-blur transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Feed Manager</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setAddFeedOpen(true)}>
              Add Feed
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="h-[calc(100%-4rem)] space-y-3 overflow-auto pr-1">
          {sortedFeeds.map((feed) => (
            <FeedSourceCard
              key={feed.id}
              feed={feed}
              onToggle={toggleFeed}
              onRemove={removeFeed}
            />
          ))}
        </div>
      </aside>

      <Modal open={isAddFeedOpen} onClose={() => setAddFeedOpen(false)} title="Add feed source">
        <form className="space-y-3" onSubmit={(event) => void handleAddFeed(event)}>
          <label className="block space-y-1">
            <span className="text-xs text-text-muted">Name</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Source name" />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-text-muted">URL</span>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/feed.xml" />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-text-muted">Category</span>
            <Select value={category} onChange={(event) => setCategory(event.target.value as EventCategory)}>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddFeedOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
