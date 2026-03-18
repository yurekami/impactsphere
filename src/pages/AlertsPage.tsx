import { AlertBanner } from '@/features/alerts/components/AlertBanner'
import { AlertHistory } from '@/features/alerts/components/AlertHistory'
import { AlertManager } from '@/features/alerts/components/AlertManager'
import { AlertRuleForm } from '@/features/alerts/components/AlertRuleForm'

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <AlertBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertManager />
        <AlertRuleForm />
      </div>

      <AlertHistory />
    </div>
  )
}
