import { MetricCard, Timeline } from '@/components/data-display'
import { PageHeader } from '@/components/layout'
import { Badge, Card } from '@/components/ui'

const timelineItems = [
  {
    id: '1',
    title: 'GitHub ingestion initialized',
    description: 'Repository webhooks and polling jobs are configured.',
    timestamp: new Date(),
  },
  {
    id: '2',
    title: 'Model routing baseline added',
    description: 'Provider settings and update cadence persisted locally.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
  },
]

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Command Dashboard"
        description="Realtime impact intelligence across repositories and geopolitical narratives."
        actions={<Badge>Phase 0</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Tracked Repositories" value="12" hint="+2 this week" />
        <MetricCard label="Critical Alerts" value="3" hint="SLA under 20m" />
        <MetricCard label="Global Impact Score" value="0.79" hint="Model confidence 93%" />
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-text">Recent Intelligence Signals</h2>
        <Timeline items={timelineItems} />
      </Card>
    </section>
  )
}
