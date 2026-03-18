export type AlertRuleType = 'keyword' | 'vendor' | 'severity' | 'impact-score'

export interface AlertCondition {
  type: AlertRuleType
  value: string
}

export interface AlertRule {
  id: string
  name: string
  conditions: AlertCondition[]
  isActive: boolean
  createdAt: string
}

export interface TriggeredAlert {
  id: string
  ruleId: string
  ruleName: string
  eventTitle: string
  triggeredAt: string
  dismissed: boolean
}
