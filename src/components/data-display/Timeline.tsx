import { formatDate } from '@/lib/utils/format'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: string | number | Date
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[31px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
          <p className="text-sm font-medium text-text">{item.title}</p>
          {item.description ? (
            <p className="mt-1 text-sm text-text-muted">{item.description}</p>
          ) : null}
          <time className="mt-1 block text-xs text-text-muted/70">
            {formatDate(item.timestamp)}
          </time>
        </li>
      ))}
    </ol>
  )
}
