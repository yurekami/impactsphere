import { Button, Card, Input, Select } from '@/components/ui'
import type { EventCategory, EventFilter as EventFilterState, Severity } from '../types'

interface EventFilterProps {
  filters: EventFilterState
  onChange: (next: Partial<EventFilterState>) => void
  onReset: () => void
}

const categoryOptions: EventCategory[] = [
  'security',
  'outage',
  'regulatory',
  'release',
  'vulnerability',
  'general',
]

const severityOptions: Severity[] = ['critical', 'high', 'medium', 'low']

export function EventFilter({ filters, onChange, onReset }: EventFilterProps) {
  const setCategory = (category: EventCategory, checked: boolean) => {
    const categories = checked
      ? Array.from(new Set([...filters.categories, category]))
      : filters.categories.filter((item) => item !== category)

    onChange({ categories })
  }

  const severitySelectValue =
    filters.severities.length === severityOptions.length ? 'all' : filters.severities[0]

  return (
    <Card>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] lg:items-end">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => {
              const checked = filters.categories.includes(category)

              return (
                <label
                  key={category}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/70 px-2.5 py-1.5 text-xs text-text-muted"
                >
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={checked}
                    onChange={(event) => setCategory(category, event.target.checked)}
                  />
                  <span>{category}</span>
                </label>
              )
            })}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-text-muted">Severity</span>
          <Select
            value={severitySelectValue}
            onChange={(event) => {
              const value = event.target.value
              onChange({ severities: value === 'all' ? severityOptions : [value as Severity] })
            }}
          >
            <option value="all">All severities</option>
            {severityOptions.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-text-muted">Date from</span>
          <Input
            type="date"
            value={filters.dateRange.start ?? ''}
            onChange={(event) => onChange({ dateRange: { start: event.target.value || null } })}
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-text-muted">Date to</span>
          <Input
            type="date"
            value={filters.dateRange.end ?? ''}
            onChange={(event) => onChange({ dateRange: { end: event.target.value || null } })}
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-text-muted">Search</span>
          <Input
            placeholder="Search title, description, tags"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </label>

        <Button variant="secondary" onClick={onReset}>
          Reset
        </Button>
      </div>
    </Card>
  )
}
