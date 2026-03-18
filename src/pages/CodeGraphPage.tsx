import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { DependencyList } from '@/features/code-graph/components/DependencyList'
import {
  GraphExplorer,
  type GraphExplorerHandle,
} from '@/features/code-graph/components/GraphExplorer'
import { GraphToolbar } from '@/features/code-graph/components/GraphToolbar'
import { FileTree } from '@/features/code-graph/components/FileTree'
import { NodeDetail } from '@/features/code-graph/components/NodeDetail'
import { ParseProgress } from '@/features/code-graph/components/ParseProgress'
import { RepoInput } from '@/features/code-graph/components/RepoInput'
import { useCodeGraph } from '@/features/code-graph/hooks/useCodeGraph'
import { useFileParser } from '@/features/code-graph/hooks/useFileParser'
import { useGraphLayout, type GraphLayoutMode } from '@/features/code-graph/hooks/useGraphLayout'
import { useGraphSearch } from '@/features/code-graph/hooks/useGraphSearch'

export default function CodeGraphPage() {
  const graphRef = useRef<GraphExplorerHandle | null>(null)
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('forceatlas2')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    filteredGraph,
    selectedNode,
    selectNode,
    parseStatus,
    parseProgress,
    repoMetadata,
    error,
  } = useCodeGraph()
  const { parseGitHub, parseZip } = useFileParser()
  const { applyLayout } = useGraphLayout()

  const searchResults = useGraphSearch(filteredGraph, searchQuery)

  useEffect(() => {
    if (!filteredGraph) {
      return
    }

    applyLayout(filteredGraph, layoutMode)
  }, [applyLayout, filteredGraph, layoutMode])

  const selectedSearchResult = useMemo(
    () => searchResults.slice(0, 8),
    [searchResults],
  )

  return (
    <section className="space-y-6">
      <PageHeader
        title="Code Graph Engine"
        description="Parse repositories into interactive graphs of files, imports, symbols, and call chains."
        actions={<Badge>Phase 1A</Badge>}
      />

      <RepoInput
        isBusy={parseStatus === 'running'}
        onAnalyzeGitHub={parseGitHub}
        onAnalyzeZip={parseZip}
      />

      <ParseProgress status={parseStatus} progress={parseProgress} />

      {repoMetadata ? (
        <Card>
          <CardContent className="grid gap-3 py-4 text-sm md:grid-cols-4">
            <p>
              <span className="text-text-muted">Repo:</span> {repoMetadata.name}
            </p>
            <p>
              <span className="text-text-muted">Branch:</span> {repoMetadata.branch}
            </p>
            <p>
              <span className="text-text-muted">Files:</span> {repoMetadata.fileCount}
            </p>
            <p>
              <span className="text-text-muted">Analyzed:</span>{' '}
              {new Date(repoMetadata.analyzedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-red-300">{error}</CardContent>
        </Card>
      ) : null}

      <GraphToolbar
        layout={layoutMode}
        search={searchQuery}
        onLayoutChange={(nextLayout) => {
          setLayoutMode(nextLayout)
          if (filteredGraph) {
            applyLayout(filteredGraph, nextLayout)
          }
        }}
        onSearchChange={setSearchQuery}
        onZoomIn={() => graphRef.current?.zoomIn()}
        onZoomOut={() => graphRef.current?.zoomOut()}
        onFit={() => graphRef.current?.fit()}
      />

      {selectedSearchResult.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {selectedSearchResult.map((result) => (
              <button
                key={result.id}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs text-text-muted transition hover:border-accent/70 hover:text-text"
                onClick={() => selectNode(result.id)}
              >
                <p className="font-medium text-text">{result.label}</p>
                <p>{result.path}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <FileTree graph={filteredGraph} selectedNode={selectedNode} onSelectNode={selectNode} />
        <GraphExplorer ref={graphRef} graph={filteredGraph} onNodeSelect={selectNode} />
        <NodeDetail graph={filteredGraph} nodeId={selectedNode} />
      </div>

      <DependencyList graph={filteredGraph} />
    </section>
  )
}
