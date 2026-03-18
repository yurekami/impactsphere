import { useMemo } from 'react'
import type Graph from 'graphology'
import { DataTable, type DataTableColumn } from '@/components/data-display'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface DependencyRow {
  id: string
  type: string
  source: string
  target: string
}

interface DependencyListProps {
  graph: Graph | null
}

const columns: DataTableColumn<DependencyRow>[] = [
  { key: 'type', header: 'Type', className: 'w-24' },
  { key: 'source', header: 'Source' },
  { key: 'target', header: 'Target' },
]

export function DependencyList({ graph }: DependencyListProps) {
  const rows = useMemo(() => {
    if (!graph) {
      return [] as DependencyRow[]
    }

    const entries: DependencyRow[] = []
    graph.forEachEdge((edge, attributes, source, target) => {
      entries.push({
        id: edge,
        type: String(attributes.type ?? 'link'),
        source,
        target,
      })
    })

    return entries.slice(0, 250)
  }, [graph])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependencies</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          emptyText="No dependency edges available."
        />
      </CardContent>
    </Card>
  )
}
