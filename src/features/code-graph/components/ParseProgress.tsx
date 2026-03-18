import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from '@/components/ui'
import type { ParseProgress as ParseProgressState } from '../types'

interface ParseProgressProps {
  status: 'idle' | 'running' | 'success' | 'error'
  progress: ParseProgressState
}

const phaseLabel: Record<ParseProgressState['phase'], string> = {
  idle: 'Idle',
  fetching: 'Fetching',
  extracting: 'Extracting',
  parsing: 'Parsing',
  'resolving-imports': 'Resolving Imports',
  'extracting-calls': 'Extracting Calls',
  'building-graph': 'Building Graph',
  'running-metrics': 'Computing Metrics',
  completed: 'Completed',
  error: 'Error',
}

export function ParseProgress({ status, progress }: ParseProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parse Pipeline</CardTitle>
        <CardDescription>Phase-by-phase repository graph construction.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress.progress} />
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{phaseLabel[progress.phase]}</span>
          <span>{Math.round(progress.progress)}%</span>
        </div>
        <p className="text-sm text-text">{status === 'idle' ? 'Awaiting repository input.' : progress.current}</p>
      </CardContent>
    </Card>
  )
}
