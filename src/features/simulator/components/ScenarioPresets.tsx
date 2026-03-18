import { Badge, Card, CardDescription, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { Scenario, Severity } from '../types'

interface ScenarioPresetsProps {
  scenarios: Scenario[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const SEVERITY_VARIANT: Record<Severity, 'danger' | 'warning' | 'default'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'default',
}

export function ScenarioPresets({
  scenarios,
  selectedId,
  onSelect,
}: ScenarioPresetsProps) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
      {scenarios.map((scenario) => {
        const isSelected = scenario.id === selectedId

        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className="text-left"
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-200 hover:border-accent/50',
                isSelected && 'border-accent ring-1 ring-accent/40',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm leading-snug">
                  {scenario.name}
                </CardTitle>
                <Badge variant={SEVERITY_VARIANT[scenario.severity]}>
                  {scenario.severity}
                </Badge>
              </div>
              <CardDescription className="mt-2 line-clamp-2 text-xs">
                {scenario.description}
              </CardDescription>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
