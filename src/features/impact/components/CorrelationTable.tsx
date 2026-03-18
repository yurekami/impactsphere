import { useMemo, useState } from 'react'
import { DataTable, type DataTableColumn, ScoreBadge } from '@/components/data-display'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { CorrelationResult, MatchType } from '../types'

interface CorrelationRow {
  id: string
  eventId: string
  nodeId: string
  matchType: MatchType
  score: number
  blastRadius: number
}

type SortKey = 'score' | 'blastRadius'
type SortDir = 'asc' | 'desc'

interface CorrelationTableProps {
  correlations: CorrelationResult
  className?: string
}

export function CorrelationTable({ correlations, className }: CorrelationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const rows = useMemo<CorrelationRow[]>(() => {
    const mapped = correlations.matches.map((match) => {
      const score = correlations.scores.find((s) => s.matchId === match.id)
      const blast = correlations.blastRadii.find(
        (br) => br.rootNodeId === match.nodeId,
      )

      return {
        id: match.id,
        eventId: match.eventId,
        nodeId: match.nodeId,
        matchType: match.matchType,
        score: score?.score ?? 0,
        blastRadius: blast?.affectedNodes.length ?? 0,
      }
    })

    const sorted = [...mapped].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortDir === 'desc' ? -diff : diff
    })

    return sorted
  }, [correlations, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const columns: DataTableColumn<CorrelationRow>[] = [
    {
      key: 'eventId',
      header: 'Event',
      render: (value) => (
        <span className="font-mono text-xs text-accent-soft">
          {String(value).slice(0, 12)}
        </span>
      ),
    },
    {
      key: 'nodeId',
      header: 'Component',
      render: (value) => (
        <span className="max-w-48 truncate text-text" title={String(value)}>
          {String(value)}
        </span>
      ),
    },
    {
      key: 'matchType',
      header: 'Match Type',
      render: (value) => (
        <Badge variant="neutral">{String(value)}</Badge>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      render: (value) => <ScoreBadge score={Number(value)} />,
      className: 'cursor-pointer select-none',
    },
    {
      key: 'blastRadius',
      header: 'Blast Radius',
      render: (value) => (
        <span className="font-mono text-sm">{String(value)}</span>
      ),
      className: 'cursor-pointer select-none',
    },
  ]

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-3 text-xs text-text-muted">
        <button
          type="button"
          className={cn(
            'rounded px-2 py-1 transition hover:text-text',
            sortKey === 'score' && 'bg-elevated text-text',
          )}
          onClick={() => handleSort('score')}
        >
          Sort by Score {sortKey === 'score' ? (sortDir === 'desc' ? '\u2193' : '\u2191') : ''}
        </button>
        <button
          type="button"
          className={cn(
            'rounded px-2 py-1 transition hover:text-text',
            sortKey === 'blastRadius' && 'bg-elevated text-text',
          )}
          onClick={() => handleSort('blastRadius')}
        >
          Sort by Blast {sortKey === 'blastRadius' ? (sortDir === 'desc' ? '\u2193' : '\u2191') : ''}
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        emptyText="No correlations found."
      />
    </div>
  )
}
