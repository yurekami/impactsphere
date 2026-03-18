import { useCallback, useRef, useState } from 'react'
import type { GlobeMethods } from 'react-globe.gl'
import { DEFAULT_GLOBE_CONFIG } from '../lib/globe-config'
import type { GlobeConfig } from '../types'

export function useGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [config, setConfig] = useState<GlobeConfig>(DEFAULT_GLOBE_CONFIG)

  const updateConfig = useCallback((partial: Partial<GlobeConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const focusOnPoint = useCallback((lat: number, lng: number) => {
    globeRef.current?.pointOfView({ lat, lng, altitude: 1.5 }, 1000)
  }, [])

  const zoomIn = useCallback(() => {
    const current = globeRef.current?.pointOfView()

    if (current) {
      globeRef.current?.pointOfView(
        { altitude: Math.max(current.altitude * 0.7, 0.4) },
        400,
      )
    }
  }, [])

  const zoomOut = useCallback(() => {
    const current = globeRef.current?.pointOfView()

    if (current) {
      globeRef.current?.pointOfView(
        { altitude: Math.min(current.altitude * 1.4, 4) },
        400,
      )
    }
  }, [])

  return { globeRef, config, updateConfig, focusOnPoint, zoomIn, zoomOut }
}
