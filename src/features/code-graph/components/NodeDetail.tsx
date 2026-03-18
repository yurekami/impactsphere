import type Graph from 'graphology'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface NodeDetailProps {
  graph: Graph | null
  nodeId: string | null
}

function NumberValue({ value }: { value: unknown }) {
  if (typeof value !== 'number') {
    return <span className="text-text-muted">N/A</span>
  }

  return <span>{value.toFixed(4)}</span>
}

export function NodeDetail({ graph, nodeId }: NodeDetailProps) {
  if (!graph || !nodeId || !graph.hasNode(nodeId)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Node Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Select a node to inspect attributes and connections.</p>
        </CardContent>
      </Card>
    )
  }

  const attributes = graph.getNodeAttributes(nodeId)
  const inbound = graph.inboundDegree(nodeId)
  const outbound = graph.outboundDegree(nodeId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{String(attributes.label ?? nodeId)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-text-muted">Type:</span> {String(attributes.type)}
        </p>
        <p>
          <span className="text-text-muted">Path:</span> {String(attributes.path ?? '-')}
        </p>
        <p>
          <span className="text-text-muted">Line:</span>{' '}
          {attributes.line === null || attributes.line === undefined ? '-' : String(attributes.line)}
        </p>
        <p>
          <span className="text-text-muted">Centrality:</span> <NumberValue value={attributes.centrality} />
        </p>
        <p>
          <span className="text-text-muted">PageRank:</span> <NumberValue value={attributes.pageRank} />
        </p>
        <p>
          <span className="text-text-muted">Betweenness:</span>{' '}
          <NumberValue value={attributes.betweenness} />
        </p>
        <p>
          <span className="text-text-muted">Connections:</span> in {inbound} / out {outbound}
        </p>
      </CardContent>
    </Card>
  )
}
