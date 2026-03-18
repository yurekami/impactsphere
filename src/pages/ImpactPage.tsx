import { useState } from 'react'
import { Button, Progress, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { useImpactStore } from '@/features/impact/stores/impact.store'
import { useImpactEngine } from '@/features/impact/hooks/useImpactEngine'
import { ImpactDashboard } from '@/features/impact/components/ImpactDashboard'
import { CorrelationTable } from '@/features/impact/components/CorrelationTable'
import { BlastRadiusView } from '@/features/impact/components/BlastRadiusView'
import { ImpactTimeline } from '@/features/impact/components/ImpactTimeline'
import { ImpactHeatmap } from '@/features/impact/components/ImpactHeatmap'
import { LiveModeToggle } from '@/features/impact/components/LiveModeToggle'

export default function ImpactPage() {
  const correlations = useImpactStore((state) => state.correlations)
  const { runCorrelation, status, progress } = useImpactEngine()
  const [selectedBlastIndex, setSelectedBlastIndex] = useState(0)

  const hasCorrelations = correlations !== null && correlations.matches.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Impact Analysis</h1>
          <p className="mt-1 text-sm text-text-muted">
            Correlate threat events to your codebase and measure blast radius.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <LiveModeToggle />
          <Button
            onClick={() => void runCorrelation()}
            disabled={status === 'computing'}
            size="sm"
          >
            {status === 'computing' ? 'Analyzing\u2026' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {status === 'computing' && progress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="capitalize">{progress.phase.replace(/-/g, ' ')}</span>
            <span>{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} />
        </div>
      ) : null}

      {hasCorrelations ? (
        <>
          <ImpactDashboard />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultTab="correlations">
                <TabsList>
                  <TabsTrigger value="correlations">Correlations</TabsTrigger>
                  <TabsTrigger value="blast-radius">Blast Radius</TabsTrigger>
                </TabsList>

                <TabsContent value="correlations">
                  <CorrelationTable correlations={correlations} />
                </TabsContent>

                <TabsContent value="blast-radius">
                  {correlations.blastRadii.length > 0 ? (
                    <div className="space-y-4">
                      {correlations.blastRadii.length > 1 ? (
                        <div className="flex flex-wrap gap-2">
                          {correlations.blastRadii.map((br, index) => (
                            <Button
                              key={br.rootNodeId}
                              variant={selectedBlastIndex === index ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={() => setSelectedBlastIndex(index)}
                            >
                              {br.rootNodeId.length > 24
                                ? `${br.rootNodeId.slice(0, 24)}\u2026`
                                : br.rootNodeId}
                            </Button>
                          ))}
                        </div>
                      ) : null}

                      <BlastRadiusView
                        blastRadius={correlations.blastRadii[selectedBlastIndex]}
                      />
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-text-muted">
                      No blast radius data available.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <ImpactHeatmap />
              <ImpactTimeline />
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No Impact Data"
          description="Run an analysis to correlate threat intelligence events with your codebase and visualize the blast radius."
          actionLabel="Run Analysis"
          onAction={() => void runCorrelation()}
        />
      )}
    </div>
  )
}
