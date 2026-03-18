export type BriefType =
  | 'impact-summary'
  | 'event-analysis'
  | 'risk-assessment'
  | 'remediation-plan'

export interface IntelBrief {
  id: string
  type: BriefType
  content: string
  createdAt: string
  provider: string
}

export const BRIEF_TYPE_LABELS: Record<BriefType, string> = {
  'impact-summary': 'Impact Summary',
  'event-analysis': 'Event Analysis',
  'risk-assessment': 'Risk Assessment',
  'remediation-plan': 'Remediation Plan',
}

export const BRIEF_TYPES: BriefType[] = [
  'impact-summary',
  'event-analysis',
  'risk-assessment',
  'remediation-plan',
]
