import Graph from 'graphology'
import type {
  CallEdge,
  GraphEdgeType,
  GraphNode,
  ParsedDeclaration,
  ParsedFile,
  ResolvedImport,
} from '../types'

function createEdgeKey(type: GraphEdgeType, source: string, target: string, suffix = ''): string {
  return `${type}:${source}->${target}${suffix ? `:${suffix}` : ''}`
}

function addNodeIfMissing(graph: Graph, node: GraphNode): void {
  if (graph.hasNode(node.id)) {
    return
  }

  graph.addNode(node.id, node)
}

function declarationNode(filePath: string, declaration: ParsedDeclaration): GraphNode {
  const nodeType = declaration.kind === 'class' ? 'class' : 'function'

  return {
    id: declaration.id,
    label: declaration.name,
    type: nodeType,
    path: filePath,
    line: declaration.line,
    size: 1,
    centrality: 0,
  }
}

export interface GraphBuildInput {
  parsedFiles: ParsedFile[]
  resolvedImports: ResolvedImport[]
  callEdges: CallEdge[]
}

export function buildCodeGraph(input: GraphBuildInput): Graph {
  const graph = new Graph({ type: 'directed', multi: true })

  for (const parsedFile of input.parsedFiles) {
    addNodeIfMissing(graph, {
      id: parsedFile.path,
      label: parsedFile.path.split('/').pop() ?? parsedFile.path,
      type: 'file',
      path: parsedFile.path,
      line: null,
      size: Math.max(1, parsedFile.declarations.length),
      centrality: 0,
    })

    for (const declaration of parsedFile.declarations) {
      if (declaration.kind === 'variable') {
        continue
      }

      const declarationGraphNode = declarationNode(parsedFile.path, declaration)
      addNodeIfMissing(graph, declarationGraphNode)

      const containsKey = createEdgeKey('contains', parsedFile.path, declaration.id)
      if (!graph.hasEdge(containsKey)) {
        graph.addDirectedEdgeWithKey(containsKey, parsedFile.path, declaration.id, {
          type: 'contains',
        })
      }

      if (declaration.isExported) {
        const exportsKey = createEdgeKey('exports', declaration.id, parsedFile.path)
        if (!graph.hasEdge(exportsKey)) {
          graph.addDirectedEdgeWithKey(exportsKey, declaration.id, parsedFile.path, {
            type: 'exports',
          })
        }
      }
    }
  }

  for (const resolvedImport of input.resolvedImports) {
    const targetId = resolvedImport.targetPath ?? `module:${resolvedImport.specifier}`

    if (resolvedImport.isExternal) {
      addNodeIfMissing(graph, {
        id: targetId,
        label: resolvedImport.specifier,
        type: 'module',
        path: resolvedImport.specifier,
        line: null,
        size: 1,
        centrality: 0,
      })
    }

    if (!graph.hasNode(resolvedImport.sourcePath) || !graph.hasNode(targetId)) {
      continue
    }

    const edgeKey = createEdgeKey('imports', resolvedImport.sourcePath, targetId, resolvedImport.specifier)
    if (!graph.hasEdge(edgeKey)) {
      graph.addDirectedEdgeWithKey(edgeKey, resolvedImport.sourcePath, targetId, {
        type: 'imports',
        specifier: resolvedImport.specifier,
      })
    }
  }

  for (const callEdge of input.callEdges) {
    if (!graph.hasNode(callEdge.source) || !graph.hasNode(callEdge.target)) {
      continue
    }

    const edgeKey = createEdgeKey('calls', callEdge.source, callEdge.target, `${callEdge.path}:${callEdge.line}`)

    if (!graph.hasEdge(edgeKey)) {
      graph.addDirectedEdgeWithKey(edgeKey, callEdge.source, callEdge.target, {
        type: 'calls',
        line: callEdge.line,
        path: callEdge.path,
      })
    }
  }

  return graph
}
