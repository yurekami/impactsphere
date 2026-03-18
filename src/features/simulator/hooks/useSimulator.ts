import { useCallback, useMemo, useState } from 'react'
import type Graph from 'graphology'
import type { Scenario, SimulationResult } from '../types'
import { runScenario } from '../lib/scenario-engine'
import { PRESET_SCENARIOS } from '../lib/preset-scenarios'

interface UseSimulatorReturn {
  scenarios: Scenario[]
  selectedScenario: Scenario | null
  result: SimulationResult | null
  isRunning: boolean
  selectScenario: (id: string) => void
  runSimulation: () => void
  reset: () => void
}

export function useSimulator(graph: Graph | null): UseSimulatorReturn {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const scenarios = useMemo(() => PRESET_SCENARIOS, [])

  const selectScenario = useCallback(
    (id: string) => {
      const scenario = scenarios.find((s) => s.id === id) ?? null
      setSelectedScenario(scenario)
      setResult(null)
    },
    [scenarios],
  )

  const runSimulation = useCallback(() => {
    if (!selectedScenario || !graph) return

    setIsRunning(true)

    // Use a microtask to let React paint the loading state before the
    // potentially-heavy synchronous graph work runs.
    queueMicrotask(() => {
      try {
        const simResult = runScenario(selectedScenario, graph)
        setResult(simResult)
      } finally {
        setIsRunning(false)
      }
    })
  }, [selectedScenario, graph])

  const reset = useCallback(() => {
    setSelectedScenario(null)
    setResult(null)
    setIsRunning(false)
  }, [])

  return {
    scenarios,
    selectedScenario,
    result,
    isRunning,
    selectScenario,
    runSimulation,
    reset,
  }
}
