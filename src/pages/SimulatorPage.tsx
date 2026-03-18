import { Button } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { useCodeGraphStoreGraph } from '@/features/code-graph/stores/code-graph.store'
import { CascadeView } from '@/features/simulator/components/CascadeView'
import { DiffComparison } from '@/features/simulator/components/DiffComparison'
import { ScenarioPresets } from '@/features/simulator/components/ScenarioPresets'
import { useSimulator } from '@/features/simulator/hooks/useSimulator'

export default function SimulatorPage() {
  const graph = useCodeGraphStoreGraph()
  const {
    scenarios,
    selectedScenario,
    result,
    isRunning,
    selectScenario,
    runSimulation,
    reset,
  } = useSimulator(graph)

  // ---- No graph loaded ----
  if (!graph) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          title="No Graph Loaded"
          description="Parse a repository on the CodeGraph page first so the simulator has a dependency graph to work with."
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ---- Top bar ---- */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text">
            What-If Simulator
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Select a scenario, run the simulation, and inspect the cascade
            impact on your dependency graph.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {result && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          )}
          <Button
            size="sm"
            disabled={!selectedScenario || isRunning}
            onClick={runSimulation}
          >
            {isRunning ? 'Simulating\u2026' : 'Run Simulation'}
          </Button>
        </div>
      </header>

      {/* ---- Three-column layout ---- */}
      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px] gap-0 overflow-hidden">
        {/* Left: Scenario presets */}
        <aside className="overflow-y-auto border-r border-border p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Scenarios
          </h2>
          <ScenarioPresets
            scenarios={scenarios}
            selectedId={selectedScenario?.id ?? null}
            onSelect={selectScenario}
          />
        </aside>

        {/* Center: Cascade timeline */}
        <main className="overflow-y-auto p-6">
          {result ? (
            <CascadeView steps={result.cascadeSteps} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-text-muted">
                {selectedScenario
                  ? 'Click "Run Simulation" to see the cascade.'
                  : 'Select a scenario from the left panel.'}
              </p>
            </div>
          )}
        </main>

        {/* Right: Diff comparison */}
        <aside className="overflow-y-auto border-l border-border p-4">
          {result ? (
            <DiffComparison graph={graph} result={result} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-xs text-text-muted">
                Impact comparison will appear here after running a simulation.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
