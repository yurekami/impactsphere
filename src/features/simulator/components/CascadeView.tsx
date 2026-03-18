import { Card, CardContent, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { CascadeStep } from '../types'

interface CascadeViewProps {
  steps: CascadeStep[]
}

const DEPTH_COLORS = [
  'border-red-500 bg-red-500/10',
  'border-orange-500 bg-orange-500/10',
  'border-amber-500 bg-amber-500/10',
  'border-yellow-500 bg-yellow-500/10',
  'border-lime-500 bg-lime-500/10',
  'border-emerald-500 bg-emerald-500/10',
] as const

function depthColor(step: number): string {
  return DEPTH_COLORS[Math.min(step, DEPTH_COLORS.length - 1)]
}

const DEPTH_DOT_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-emerald-500',
] as const

function dotColor(step: number): string {
  return DEPTH_DOT_COLORS[Math.min(step, DEPTH_DOT_COLORS.length - 1)]
}

export function CascadeView({ steps }: CascadeViewProps) {
  if (steps.length === 0) {
    return (
      <Card className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-text-muted">
          No cascade steps to display. Run a simulation first.
        </p>
      </Card>
    )
  }

  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical connector line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />

      {steps.map((step) => (
        <div key={step.step} className="relative flex gap-4 pb-5 last:pb-0">
          {/* Timeline dot */}
          <div className="z-10 flex flex-col items-center">
            <div
              className={cn(
                'h-[30px] w-[30px] shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white',
                dotColor(step.step),
              )}
            >
              {step.step}
            </div>
          </div>

          {/* Step card */}
          <Card
            className={cn(
              'flex-1 border-l-4 p-4',
              depthColor(step.step),
            )}
          >
            <CardTitle className="text-sm">
              {step.step === 0 ? 'Direct Impact' : `Cascade Depth ${step.step}`}
              <span className="ml-2 font-normal text-text-muted">
                — {step.removedNodes.length} node
                {step.removedNodes.length !== 1 ? 's' : ''} removed
              </span>
            </CardTitle>

            <CardContent className="mt-2">
              <p className="text-xs text-text-muted">{step.reason}</p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {step.removedNodes.slice(0, 12).map((nodeId) => (
                  <span
                    key={nodeId}
                    className="inline-block max-w-[180px] truncate rounded-md bg-surface px-2 py-0.5 text-[11px] text-text-muted"
                    title={nodeId}
                  >
                    {nodeId}
                  </span>
                ))}
                {step.removedNodes.length > 12 && (
                  <span className="text-[11px] text-text-muted">
                    +{step.removedNodes.length - 12} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
