import type { CategorizedEvent } from '@/features/event-stream/types'
import type { ExtractedKeywords } from '../types'
import { VENDOR_REGISTRY } from './vendor-registry'

const CVE_PATTERN = /CVE-\d{4}-\d+/gi
const NPM_SCOPED_PATTERN = /@[\w-]+\/[\w.-]+/g

export function extractKeywords(event: CategorizedEvent): ExtractedKeywords {
  const text = `${event.title} ${event.description}`
  const lowerText = text.toLowerCase()

  const vendors: Set<string> = new Set()
  const technologies: Set<string> = new Set()
  const regions: Set<string> = new Set()

  for (const vendor of VENDOR_REGISTRY) {
    let matched = false

    for (const keyword of vendor.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matched = true
        technologies.add(keyword)
      }
    }

    for (const alias of vendor.aliases) {
      if (lowerText.includes(alias.toLowerCase())) {
        matched = true
      }
    }

    if (matched) {
      vendors.add(vendor.id)
      for (const region of vendor.regions) {
        if (lowerText.includes(region.toLowerCase())) {
          regions.add(region)
        }
      }
    }
  }

  const cveMatches = text.match(CVE_PATTERN)
  const cves = [...new Set(cveMatches ?? [])]

  const packageMatches = text.match(NPM_SCOPED_PATTERN)
  const packages = [...new Set(packageMatches ?? [])]

  return {
    vendors: [...vendors],
    technologies: [...technologies],
    regions: [...regions],
    cves,
    packages,
  }
}
