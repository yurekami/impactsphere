import { useNavigate } from 'react-router-dom'
import { MetricCard } from '@/components/data-display'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card } from '@/components/ui'
import { useCodeGraphStore } from '@/features/code-graph/stores/code-graph.store'
import { useEventStreamStore } from '@/features/event-stream/stores/event-stream.store'
import { useImpactStore } from '@/features/impact/stores/impact.store'
import { useAlertsStore } from '@/features/alerts/stores/alerts.store'
import { cn } from '@/lib/utils/cn'

export default function DashboardPage() {
  const navigate = useNavigate()
  const graph = useCodeGraphStore((s) => s.graph)
  const parseStatus = useCodeGraphStore((s) => s.parseStatus)
  const events = useEventStreamStore((s) => s.events)
  const isPolling = useEventStreamStore((s) => s.isPolling)
  const correlations = useImpactStore((s) => s.correlations)
  const activeAlertCount = useAlertsStore((s) => s.activeCount)

  const nodeCount = graph ? graph.order : 0
  const eventCount = events.length
  const matchCount = correlations?.matches.length ?? 0
  const topScore = correlations?.scores.length
    ? Math.round(Math.max(...correlations.scores.map((s) => s.score)))
    : 0

  const recentEvents = events.slice(0, 5)

  return (
    <section className="space-y-6">
      <PageHeader
        title="Command Dashboard"
        description="Unified situational awareness — codebase health, live events, and impact correlation."
        actions={
          <div className="flex items-center gap-2">
            {isPolling && (
              <Badge className="bg-green-900/30 text-green-400">
                <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Live
              </Badge>
            )}
            <Badge>v0.1.0</Badge>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Graph Nodes"
          value={nodeCount.toLocaleString()}
          hint={parseStatus === 'completed' ? 'Analysis complete' : 'No repo analyzed'}
        />
        <MetricCard
          label="Live Events"
          value={eventCount.toLocaleString()}
          hint={isPolling ? 'Polling active' : 'Polling paused'}
        />
        <MetricCard
          label="Impact Matches"
          value={matchCount.toLocaleString()}
          hint={topScore > 0 ? `Top score: ${topScore}` : 'Run correlation to see'}
        />
        <MetricCard
          label="Active Alerts"
          value={activeAlertCount.toLocaleString()}
          hint={activeAlertCount > 0 ? 'Needs attention' : 'All clear'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">1. Analyze Codebase</h3>
          <p className="mb-4 text-xs text-text-secondary">
            Drop in a GitHub repo URL or ZIP file to build the dependency knowledge graph.
          </p>
          <Button
            size="sm"
            variant={parseStatus === 'completed' ? 'secondary' : 'primary'}
            onClick={() => navigate('/code-graph')}
          >
            {parseStatus === 'completed' ? 'View Graph' : 'Analyze Repo'}
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">2. Monitor Events</h3>
          <p className="mb-4 text-xs text-text-secondary">
            Aggregate RSS feeds for security advisories, outages, and tech news.
          </p>
          <Button
            size="sm"
            variant={eventCount > 0 ? 'secondary' : 'primary'}
            onClick={() => navigate('/events')}
          >
            {eventCount > 0 ? `View ${eventCount} Events` : 'Configure Feeds'}
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">3. Correlate Impact</h3>
          <p className="mb-4 text-xs text-text-secondary">
            Match world events to your code — see which components are affected.
          </p>
          <Button
            size="sm"
            variant={matchCount > 0 ? 'secondary' : 'primary'}
            onClick={() => navigate('/impact')}
            disabled={nodeCount === 0 || eventCount === 0}
          >
            {matchCount > 0 ? `View ${matchCount} Matches` : 'Run Correlation'}
          </Button>
        </Card>
      </div>

      {recentEvents.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Recent Events</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/events')}>
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div
                key={event.guid}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    event.severity === 'critical' && 'bg-severity-critical',
                    event.severity === 'high' && 'bg-severity-high',
                    event.severity === 'medium' && 'bg-severity-medium',
                    event.severity === 'low' && 'bg-severity-low',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{event.title}</p>
                  <p className="text-xs text-text-muted">{event.category}</p>
                </div>
                <Badge
                  className={cn(
                    'shrink-0 text-xs',
                    event.severity === 'critical' && 'bg-red-900/30 text-red-400',
                    event.severity === 'high' && 'bg-orange-900/30 text-orange-400',
                    event.severity === 'medium' && 'bg-yellow-900/30 text-yellow-400',
                    event.severity === 'low' && 'bg-blue-900/30 text-blue-400',
                  )}
                >
                  {event.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate('/globe')}
          className="rounded-xl border border-border bg-surface-elevated p-5 text-left transition-colors hover:border-border-bright"
        >
          <div className="mb-2 text-2xl">🌍</div>
          <h3 className="text-sm font-semibold text-text-primary">Globe View</h3>
          <p className="text-xs text-text-secondary">3D visualization of global events</p>
        </button>

        <button
          onClick={() => navigate('/simulator')}
          className="rounded-xl border border-border bg-surface-elevated p-5 text-left transition-colors hover:border-border-bright"
        >
          <div className="mb-2 text-2xl">🔀</div>
          <h3 className="text-sm font-semibold text-text-primary">What-If Simulator</h3>
          <p className="text-xs text-text-secondary">Test failure scenarios on your stack</p>
        </button>

        <button
          onClick={() => navigate('/intel')}
          className="rounded-xl border border-border bg-surface-elevated p-5 text-left transition-colors hover:border-border-bright"
        >
          <div className="mb-2 text-2xl">🤖</div>
          <h3 className="text-sm font-semibold text-text-primary">AI Intel Briefs</h3>
          <p className="text-xs text-text-secondary">LLM-powered impact analysis</p>
        </button>
      </div>
    </section>
  )
}
