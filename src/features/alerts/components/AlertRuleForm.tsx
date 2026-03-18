import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, Input, Select } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useAlerts } from '../hooks/useAlerts'
import type { AlertCondition, AlertRuleType } from '../types'

const RULE_TYPE_OPTIONS: { value: AlertRuleType; label: string }[] = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'severity', label: 'Severity' },
  { value: 'impact-score', label: 'Impact Score' },
]

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical']

export function AlertRuleForm() {
  const { addRule } = useAlerts()
  const [name, setName] = useState('')
  const [conditions, setConditions] = useState<AlertCondition[]>([])
  const [conditionType, setConditionType] = useState<AlertRuleType>('keyword')
  const [conditionValue, setConditionValue] = useState('')

  function handleAddCondition() {
    const trimmedValue = conditionValue.trim()

    if (!trimmedValue) {
      return
    }

    setConditions((prev) => [...prev, { type: conditionType, value: trimmedValue }])
    setConditionValue('')
  }

  function handleRemoveCondition(index: number) {
    setConditions((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName || conditions.length === 0) {
      return
    }

    addRule({
      name: trimmedName,
      conditions,
      isActive: true,
    })

    setName('')
    setConditions([])
    setConditionValue('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Alert Rule</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Rule Name</label>
          <Input
            placeholder="e.g. Critical Security Events"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-text-muted">Conditions</label>

          {conditions.length > 0 && (
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <div
                  key={`${condition.type}-${condition.value}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-soft">
                    {condition.type}
                  </span>
                  <span className="flex-1 text-sm text-text">{condition.value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(index)}
                    className="text-xs text-text-muted transition hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value as AlertRuleType)}
              className="w-36 shrink-0"
            >
              {RULE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            {conditionType === 'severity' ? (
              <Select
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="flex-1"
              >
                <option value="">Select threshold…</option>
                {SEVERITY_OPTIONS.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                placeholder={
                  conditionType === 'impact-score'
                    ? 'Score threshold (0–100)'
                    : 'Enter value…'
                }
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="flex-1"
              />
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddCondition}
              className={cn(!conditionValue.trim() && 'opacity-50')}
              disabled={!conditionValue.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!name.trim() || conditions.length === 0}
          className="w-full"
        >
          Save Rule
        </Button>
      </form>
    </Card>
  )
}
