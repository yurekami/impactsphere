import { useMemo } from 'react'
import { Button, Card, CardContent, Input, Select } from '@/components/ui'
import type { GraphLayoutMode } from '../hooks/useGraphLayout'

interface GraphToolbarProps {
  layout: GraphLayoutMode
  search: string
  onLayoutChange: (layout: GraphLayoutMode) => void
  onSearchChange: (value: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
}

export function GraphToolbar({
  layout,
  search,
  onLayoutChange,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onFit,
}: GraphToolbarProps) {
  const layoutOptions = useMemo(
    () => [
      { value: 'forceatlas2', label: 'Force Atlas 2' },
      { value: 'circular', label: 'Circular' },
      { value: 'grid', label: 'Grid' },
    ] as const,
    [],
  )

  return (
    <Card>
      <CardContent className="grid gap-3 md:grid-cols-[180px_1fr_auto_auto_auto] md:items-center">
        <Select
          value={layout}
          onChange={(event) => onLayoutChange(event.target.value as GraphLayoutMode)}
        >
          {layoutOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search nodes by name or path"
        />

        <Button variant="secondary" size="sm" onClick={onZoomIn}>
          Zoom In
        </Button>
        <Button variant="secondary" size="sm" onClick={onZoomOut}>
          Zoom Out
        </Button>
        <Button variant="ghost" size="sm" onClick={onFit}>
          Fit
        </Button>
      </CardContent>
    </Card>
  )
}
