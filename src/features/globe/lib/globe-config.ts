import type { Severity } from '@/features/event-stream/types'
import type { GlobeConfig } from '../types'

export const DEFAULT_GLOBE_CONFIG: GlobeConfig = {
  autoRotate: true,
  markerScale: 1,
  showLabels: true,
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity]
}
