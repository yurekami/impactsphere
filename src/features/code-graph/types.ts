export type GraphNodeType = 'file' | 'function' | 'class' | 'module'

export type GraphEdgeType = 'imports' | 'calls' | 'exports' | 'contains'

export interface GraphNode {
  id: string
  label: string
  type: GraphNodeType
  path: string
  line: number | null
  size: number
  centrality: number
  betweenness?: number
  pageRank?: number
  degreeCentrality?: number
  componentId?: number
}

export interface GraphEdge {
  source: string
  target: string
  type: GraphEdgeType
}

export interface Import {
  specifier: string
  resolved: string | null
  isExternal: boolean
}

export interface FunctionCall {
  caller: string
  callee: string
  line: number
}

export interface ParsedExport {
  name: string
  kind: 'function' | 'class' | 'variable'
  line: number
  id: string
}

export interface ParsedDeclaration {
  id: string
  name: string
  kind: 'function' | 'class' | 'variable'
  line: number
  isExported: boolean
}

export interface ParsedFile {
  path: string
  exports: ParsedExport[]
  imports: Import[]
  calls: FunctionCall[]
  declarations: ParsedDeclaration[]
  size: number
}

export interface RepoMetadata {
  name: string
  url: string
  branch: string
  fileCount: number
  analyzedAt: string
}

export type ParsePhase =
  | 'idle'
  | 'fetching'
  | 'extracting'
  | 'parsing'
  | 'resolving-imports'
  | 'extracting-calls'
  | 'building-graph'
  | 'running-metrics'
  | 'completed'
  | 'error'

export interface ParseProgress {
  phase: ParsePhase
  progress: number
  current: string
}

export interface NodeFilter {
  types: GraphNodeType[]
  minCentrality: number
  pathGlob: string
}

export interface ResolvedImport extends Import {
  sourcePath: string
  targetPath: string | null
}

export interface CallEdge {
  source: string
  target: string
  line: number
  path: string
}
