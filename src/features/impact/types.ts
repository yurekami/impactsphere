export interface Vendor {
  id: string
  name: string
  packages: string[]
  keywords: string[]
  regions: string[]
  aliases: string[]
}

export interface ExtractedKeywords {
  vendors: string[]
  technologies: string[]
  regions: string[]
  cves: string[]
  packages: string[]
}

export type MatchType = 'package' | 'keyword' | 'path' | 'url'

export interface Match {
  id: string
  eventId: string
  nodeId: string
  matchType: MatchType
  confidence: number
}

export interface ImpactScore {
  matchId: string
  score: number
  eventSeverity: number
  nodeCentrality: number
  exposureScore: number
}

export interface BlastRadius {
  rootNodeId: string
  affectedNodes: Array<{
    nodeId: string
    distance: number
  }>
  totalFiles: number
  totalFunctions: number
  maxDepth: number
}

export interface CorrelationResult {
  matches: Match[]
  scores: ImpactScore[]
  blastRadii: BlastRadius[]
  computedAt: string
}
