import Graph from 'graphology'

export type SerializedCodeGraph = ReturnType<Graph['export']>

export function serializeGraph(graph: Graph): SerializedCodeGraph {
  return graph.export()
}

export function deserializeGraph(serialized: SerializedCodeGraph): Graph {
  const graph = new Graph({ type: 'directed', multi: true })
  graph.import(serialized)
  return graph
}
