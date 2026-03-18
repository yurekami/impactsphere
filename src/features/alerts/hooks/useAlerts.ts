import { useAlertsStore } from '../stores/alerts.store'

export function useAlerts() {
  const rules = useAlertsStore((state) => state.rules)
  const history = useAlertsStore((state) => state.history)
  const activeCount = useAlertsStore((state) => state.activeCount)
  const addRule = useAlertsStore((state) => state.addRule)
  const removeRule = useAlertsStore((state) => state.removeRule)
  const toggleRule = useAlertsStore((state) => state.toggleRule)
  const evaluateEvent = useAlertsStore((state) => state.evaluateEvent)
  const dismissAlert = useAlertsStore((state) => state.dismissAlert)
  const clearHistory = useAlertsStore((state) => state.clearHistory)

  const activeRules = rules.filter((rule) => rule.isActive)
  const undismissedAlerts = history.filter((alert) => !alert.dismissed)

  return {
    rules,
    history,
    activeCount,
    activeRules,
    undismissedAlerts,
    addRule,
    removeRule,
    toggleRule,
    evaluateEvent,
    dismissAlert,
    clearHistory,
  }
}
