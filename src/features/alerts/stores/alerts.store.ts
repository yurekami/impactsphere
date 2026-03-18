import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CategorizedEvent } from '@/features/event-stream/types'
import { evaluateRule } from '../lib/rule-engine'
import { showNotification } from '../lib/notification-service'
import type { AlertRule, TriggeredAlert } from '../types'

interface AlertsState {
  rules: AlertRule[]
  history: TriggeredAlert[]
  activeCount: number
}

interface AlertsActions {
  addRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void
  removeRule: (ruleId: string) => void
  toggleRule: (ruleId: string) => void
  evaluateEvent: (event: CategorizedEvent) => void
  dismissAlert: (alertId: string) => void
  clearHistory: () => void
}

type AlertsStore = AlertsState & AlertsActions

function computeActiveCount(history: TriggeredAlert[]): number {
  return history.filter((alert) => !alert.dismissed).length
}

export const useAlertsStore = create<AlertsStore>()(
  persist(
    (set, get) => ({
      rules: [],
      history: [],
      activeCount: 0,

      addRule: (input) => {
        const rule: AlertRule = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }

        set({ rules: [...get().rules, rule] })
      },

      removeRule: (ruleId) => {
        set({ rules: get().rules.filter((rule) => rule.id !== ruleId) })
      },

      toggleRule: (ruleId) => {
        set({
          rules: get().rules.map((rule) =>
            rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule,
          ),
        })
      },

      evaluateEvent: (event) => {
        const { rules, history } = get()
        const newAlerts: TriggeredAlert[] = []

        for (const rule of rules) {
          if (!evaluateRule(rule, event)) {
            continue
          }

          const alreadyTriggered = history.some(
            (alert) =>
              alert.ruleId === rule.id && alert.eventTitle === event.title,
          )

          if (alreadyTriggered) {
            continue
          }

          const triggered: TriggeredAlert = {
            id: crypto.randomUUID(),
            ruleId: rule.id,
            ruleName: rule.name,
            eventTitle: event.title,
            triggeredAt: new Date().toISOString(),
            dismissed: false,
          }

          newAlerts.push(triggered)
          showNotification(`Alert: ${rule.name}`, event.title)
        }

        if (newAlerts.length > 0) {
          const updatedHistory = [...newAlerts, ...history]
          set({
            history: updatedHistory,
            activeCount: computeActiveCount(updatedHistory),
          })
        }
      },

      dismissAlert: (alertId) => {
        const updatedHistory = get().history.map((alert) =>
          alert.id === alertId ? { ...alert, dismissed: true } : alert,
        )

        set({
          history: updatedHistory,
          activeCount: computeActiveCount(updatedHistory),
        })
      },

      clearHistory: () => {
        set({ history: [], activeCount: 0 })
      },
    }),
    {
      name: 'impactsphere-alerts',
      partialize: (state) => ({
        rules: state.rules,
        history: state.history,
        activeCount: state.activeCount,
      }),
    },
  ),
)
