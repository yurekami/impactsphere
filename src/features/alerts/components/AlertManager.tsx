import { Badge, Button, Card, CardHeader, CardTitle, Switch } from '@/components/ui'
import { useAlerts } from '../hooks/useAlerts'

export function AlertManager() {
  const { rules, activeCount, toggleRule, removeRule } = useAlerts()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Rules</CardTitle>
        {activeCount > 0 && (
          <Badge variant="danger">{activeCount} triggered</Badge>
        )}
      </CardHeader>

      {rules.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No alert rules configured. Create one to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <Switch
                checked={rule.isActive}
                onCheckedChange={() => toggleRule(rule.id)}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{rule.name}</p>
                <p className="text-xs text-text-muted">
                  {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                </p>
              </div>

              <Badge variant={rule.isActive ? 'success' : 'neutral'}>
                {rule.isActive ? 'Active' : 'Paused'}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRule(rule.id)}
                className="text-text-muted hover:text-red-400"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
