import { formatDistanceToNowStrict } from 'date-fns'
import { Badge, Button, Card, CardHeader, CardTitle } from '@/components/ui'
import { useAlerts } from '../hooks/useAlerts'

function formatTimestamp(iso: string): string {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return 'unknown'
  }

  return formatDistanceToNowStrict(date, { addSuffix: true })
}

export function AlertHistory() {
  const { history, dismissAlert, clearHistory } = useAlerts()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Clear All
          </Button>
        )}
      </CardHeader>

      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No alerts triggered yet. Events will appear here when rules match.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Rule</th>
                <th className="pb-2 pr-4 font-medium">Event</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((alert) => (
                <tr key={alert.id} className="group">
                  <td className="whitespace-nowrap py-3 pr-4 text-xs text-text-muted">
                    {formatTimestamp(alert.triggeredAt)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-text">{alert.ruleName}</td>
                  <td className="max-w-xs truncate py-3 pr-4 text-text-muted">
                    {alert.eventTitle}
                  </td>
                  <td className="py-3">
                    {alert.dismissed ? (
                      <Badge variant="neutral">Dismissed</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="opacity-0 transition group-hover:opacity-100"
                      >
                        Dismiss
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
