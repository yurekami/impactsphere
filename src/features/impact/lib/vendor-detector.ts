import { VENDOR_REGISTRY } from './vendor-registry'

interface VendorDetection {
  vendorId: string
  confidence: number
}

export function detectVendors(text: string): VendorDetection[] {
  const lowerText = text.toLowerCase()
  const results: VendorDetection[] = []

  for (const vendor of VENDOR_REGISTRY) {
    let maxConfidence = 0

    for (const keyword of vendor.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        maxConfidence = Math.max(maxConfidence, 1.0)
      }
    }

    if (maxConfidence < 1.0) {
      for (const alias of vendor.aliases) {
        if (lowerText.includes(alias.toLowerCase())) {
          maxConfidence = Math.max(maxConfidence, 0.8)
        }
      }
    }

    if (maxConfidence < 0.8) {
      if (lowerText.includes(vendor.name.toLowerCase())) {
        maxConfidence = Math.max(maxConfidence, 0.5)
      }
      for (const pkg of vendor.packages) {
        const pkgName = pkg.replace(/\/\*$/, '')
        if (lowerText.includes(pkgName.toLowerCase())) {
          maxConfidence = Math.max(maxConfidence, 0.5)
        }
      }
    }

    if (maxConfidence > 0) {
      results.push({ vendorId: vendor.id, confidence: maxConfidence })
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}
