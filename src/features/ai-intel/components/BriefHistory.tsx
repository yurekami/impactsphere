import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { BRIEF_TYPE_LABELS } from '../types'
import type { IntelBrief } from '../types'

interface BriefHistoryProps {
  briefs: IntelBrief[]
  onSelect: (brief: IntelBrief) => void
  onClear: () => void
  className?: string
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function providerVariant(provider: string): 'default' | 'success' {
  return provider === 'openai' ? 'success' : 'default'
}

export function BriefHistory({
  briefs,
  onSelect,
  onClear,
  className,
}: BriefHistoryProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle>Brief History</CardTitle>
        {briefs.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {briefs.length === 0 ? (
          <p className="text-center text-sm text-text-muted">
            No briefs generated yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {briefs.map((brief) => (
              <li key={brief.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-border bg-elevated/50 p-3 text-left transition hover:border-accent/40 hover:bg-elevated"
                  onClick={() => onSelect(brief)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-text">
                      {BRIEF_TYPE_LABELS[brief.type]}
                    </span>
                    <Badge variant={providerVariant(brief.provider)} className="shrink-0">
                      {brief.provider}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {formatTimestamp(brief.createdAt)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                    {brief.content.slice(0, 120)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
