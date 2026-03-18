import type Graph from 'graphology'
import type { GraphNode } from '@/features/code-graph/types'
import type { ExtractedKeywords, Match, MatchType } from '../types'
import { VENDOR_BY_ID } from './vendor-registry'

function packagePatternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const withWildcard = escaped.replace(/\\\*/g, '.*')
  return new RegExp(`^${withWildcard}$`, 'i')
}

function getVendorPackagePatterns(vendorIds: string[]): RegExp[] {
  const patterns: RegExp[] = []
  for (const vendorId of vendorIds) {
    const vendor = VENDOR_BY_ID.get(vendorId)
    if (!vendor) continue
    for (const pkg of vendor.packages) {
      patterns.push(packagePatternToRegex(pkg))
    }
  }
  return patterns
}

function getVendorKeywords(vendorIds: string[]): string[] {
  const keywords: string[] = []
  for (const vendorId of vendorIds) {
    const vendor = VENDOR_BY_ID.get(vendorId)
    if (!vendor) continue
    keywords.push(...vendor.keywords.map((k) => k.toLowerCase()))
  }
  return keywords
}

export function matchEventsToGraph(
  keywords: ExtractedKeywords,
  graph: Graph,
  eventId = '',
): Match[] {
  const matches: Match[] = []
  const packagePatterns = getVendorPackagePatterns(keywords.vendors)
  const vendorKeywords = getVendorKeywords(keywords.vendors)
  const techKeywords = keywords.technologies.map((t) => t.toLowerCase())

  graph.forEachNode((nodeId, attrs) => {
    const node = attrs as GraphNode
    const matchTypes: Array<{ type: MatchType; confidence: number }> = []

    // (a) External module node label matches vendor package pattern
    if (node.type === 'module') {
      for (const pattern of packagePatterns) {
        if (pattern.test(node.label)) {
          matchTypes.push({ type: 'package', confidence: 1.0 })
          break
        }
      }
    }

    // (b) File path contains vendor keyword
    if (node.path) {
      const lowerPath = node.path.toLowerCase()
      for (const keyword of vendorKeywords) {
        if (lowerPath.includes(keyword)) {
          matchTypes.push({ type: 'path', confidence: 0.7 })
          break
        }
      }
    }

    // (c) Node label contains tech keyword
    if (node.label) {
      const lowerLabel = node.label.toLowerCase()
      for (const keyword of techKeywords) {
        if (lowerLabel.includes(keyword)) {
          matchTypes.push({ type: 'keyword', confidence: 0.6 })
          break
        }
      }
    }

    // Use the highest-confidence match for this node
    if (matchTypes.length > 0) {
      const best = matchTypes.reduce((a, b) => (a.confidence >= b.confidence ? a : b))
      matches.push({
        id: crypto.randomUUID(),
        eventId,
        nodeId,
        matchType: best.type,
        confidence: best.confidence,
      })
    }
  })

  return matches
}
