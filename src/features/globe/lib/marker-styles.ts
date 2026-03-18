import type { GlobeMarker } from '../types'
import { getSeverityColor } from './globe-config'

export function getMarkerSize(eventCount: number): number {
  return Math.min(4 + Math.log2(eventCount + 1) * 3, 20)
}

export function getMarkerHtml(marker: GlobeMarker): string {
  const color = getSeverityColor(marker.severity)
  const size = getMarkerSize(marker.eventCount)
  const glow = size * 2

  return `<div
    style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${color};
      box-shadow:0 0 ${glow}px ${color}80, 0 0 ${size}px ${color};
      cursor:pointer;
      position:relative;
      animation:globe-marker-pulse 2s ease-in-out infinite;
    "
    data-marker-id="${marker.id}"
    title="${marker.label} — ${marker.eventCount} event${marker.eventCount > 1 ? 's' : ''}"
  >
    <div style="
      position:absolute;
      inset:-${Math.round(size * 0.6)}px;
      border-radius:50%;
      border:1px solid ${color}40;
      animation:globe-marker-ripple 2.5s ease-out infinite;
    "></div>
  </div>`
}
