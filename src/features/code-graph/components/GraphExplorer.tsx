import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react'
import type Graph from 'graphology'
import Sigma from 'sigma'
import { EmptyState } from '@/components/feedback'
import { Card } from '@/components/ui'

interface GraphExplorerProps {
  graph: Graph | null
  onNodeSelect: (nodeId: string) => void
}

export interface GraphExplorerHandle {
  zoomIn: () => void
  zoomOut: () => void
  fit: () => void
}

const nodeColors: Record<string, string> = {
  file: '#60A5FA',
  function: '#A78BFA',
  class: '#F59E0B',
  module: '#22C55E',
}

function applyVisualDefaults(graph: Graph): void {
  const order = Math.max(graph.order, 1)

  graph.forEachNode((node, attributes) => {
    const index = Math.abs(
      Array.from(node).reduce((value, character) => value + character.charCodeAt(0), 0),
    )
    const angle = (index % 360) * (Math.PI / 180)
    const radius = 10 + (index % order)
    const centrality = Number(attributes.centrality ?? 0)

    graph.mergeNodeAttributes(node, {
      label: String(attributes.label ?? node),
      color: nodeColors[String(attributes.type)] ?? '#9CA3AF',
      size: Math.max(3, Math.min(14, 4 + centrality * 35)),
      x: typeof attributes.x === 'number' ? attributes.x : Math.cos(angle) * radius,
      y: typeof attributes.y === 'number' ? attributes.y : Math.sin(angle) * radius,
    })
  })
}

function bindSigma(
  containerRef: MutableRefObject<HTMLDivElement | null>,
  sigmaRef: MutableRefObject<Sigma | null>,
  graph: Graph,
  onNodeSelect: (nodeId: string) => void,
): () => void {
  if (!containerRef.current) {
    return () => undefined
  }

  applyVisualDefaults(graph)

  const sigma = new Sigma(graph, containerRef.current, {
    renderLabels: true,
    labelDensity: 0.08,
    defaultEdgeColor: '#3F3F52',
    defaultNodeColor: '#9CA3AF',
  })

  sigmaRef.current = sigma

  const clickHandler = ({ node }: { node: string }) => {
    onNodeSelect(node)
  }

  sigma.on('clickNode', clickHandler)

  return () => {
    sigma.removeListener('clickNode', clickHandler)
    sigma.kill()
    sigmaRef.current = null
  }
}

export const GraphExplorer = forwardRef<GraphExplorerHandle, GraphExplorerProps>(
  ({ graph, onNodeSelect }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const sigmaRef = useRef<Sigma | null>(null)

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const sigma = sigmaRef.current
        if (!sigma) {
          return
        }

        const camera = sigma.getCamera()
        camera.setState({ ratio: Math.max(0.05, camera.getState().ratio * 0.8) })
      },
      zoomOut: () => {
        const sigma = sigmaRef.current
        if (!sigma) {
          return
        }

        const camera = sigma.getCamera()
        camera.setState({ ratio: Math.min(8, camera.getState().ratio * 1.25) })
      },
      fit: () => {
        const sigma = sigmaRef.current
        if (!sigma) {
          return
        }

        sigma.getCamera().animatedReset()
      },
    }))

    useEffect(() => {
      if (!graph) {
        if (sigmaRef.current) {
          sigmaRef.current.kill()
          sigmaRef.current = null
        }
        return
      }

      return bindSigma(containerRef, sigmaRef, graph, onNodeSelect)
    }, [graph, onNodeSelect])

    const hasGraph = useMemo(() => Boolean(graph && graph.order > 0), [graph])

    if (!hasGraph) {
      return (
        <EmptyState
          title="Graph Explorer"
          description="Analyze a repository to render file, function, class, and module dependencies."
        />
      )
    }

    return (
      <Card className="h-[65vh] p-0">
        <div ref={containerRef} className="h-full w-full rounded-xl" />
      </Card>
    )
  },
)

GraphExplorer.displayName = 'GraphExplorer'
