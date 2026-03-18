export type Severity = 'critical' | 'high' | 'medium'

export interface Scenario {
  id: string
  name: string
  description: string
  affectedVendors: string[]
  affectedRegions: string[]
  severity: Severity
}

export interface CascadeStep {
  step: number
  removedNodes: string[]
  reason: string
}

export interface SimulationResult {
  scenario: Scenario
  cascadeSteps: CascadeStep[]
  totalAffected: number
  maxDepth: number
}
