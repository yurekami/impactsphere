import { useCallback, useEffect, useMemo, useRef } from 'react'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import { buildArcs } from '../lib/arc-builder'
import { getSeverityColor } from '../lib/globe-config'
import { getMarkerHtml } from '../lib/marker-styles'
import type { GlobeArc, GlobeConfig, GlobeMarker } from '../types'

const EARTH_DARK_URL = '//unpkg.com/three-globe/example/img/earth-night.jpg'
const ATMOSPHERE_COLOR = '#6366f1'

const MARKER_ANIMATIONS_CSS = `
@keyframes globe-marker-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}
@keyframes globe-marker-ripple {
  0% { opacity: 0.6; transform: scale(0.8); }
  100% { opacity: 0; transform: scale(2.2); }
}
`

interface GlobeViewProps {
  markers: GlobeMarker[]
  config: GlobeConfig
  globeRef: React.MutableRefObject<GlobeMethods | undefined>
  onMarkerClick?: (marker: GlobeMarker) => void
  onMarkerHover?: (marker: GlobeMarker | null) => void
}

function injectAnimationStyles(): void {
  const styleId = 'globe-marker-animations'

  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = MARKER_ANIMATIONS_CSS
  document.head.appendChild(style)
}

export function GlobeView({
  markers,
  config,
  globeRef,
  onMarkerClick,
  onMarkerHover,
}: GlobeViewProps) {
  const callbacksRef = useRef({ onMarkerClick, onMarkerHover })
  callbacksRef.current = { onMarkerClick, onMarkerHover }

  useEffect(() => {
    injectAnimationStyles()
  }, [])

  useEffect(() => {
    const controls = globeRef.current?.controls()

    if (controls) {
      controls.autoRotate = config.autoRotate
      controls.autoRotateSpeed = 0.4
    }
  }, [config.autoRotate, globeRef])

  const arcs = useMemo<GlobeArc[]>(() => buildArcs(markers), [markers])

  const ringsData = useMemo(
    () =>
      markers
        .filter((m) => m.severity === 'critical' || m.severity === 'high')
        .map((m) => ({
          lat: m.lat,
          lng: m.lng,
          maxR: 3,
          propagationSpeed: 2,
          repeatPeriod: 1200,
          color: getSeverityColor(m.severity),
        })),
    [markers],
  )

  const markerLookup = useMemo(() => {
    const map = new Map<string, GlobeMarker>()

    for (const m of markers) {
      map.set(m.id, m)
    }

    return map
  }, [markers])

  const handleHtmlElement = useCallback(
    (d: object) => {
      const marker = d as GlobeMarker
      const wrapper = document.createElement('div')
      wrapper.innerHTML = getMarkerHtml(marker)
      wrapper.style.transform = `scale(${config.markerScale})`
      wrapper.style.pointerEvents = 'auto'
      wrapper.style.cursor = 'pointer'
      wrapper.dataset.markerId = marker.id

      wrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = wrapper.dataset.markerId ?? ''
        const m = markerLookup.get(id)

        if (m) {
          globeRef.current?.pointOfView({ lat: m.lat, lng: m.lng, altitude: 1.5 }, 800)
          callbacksRef.current.onMarkerClick?.(m)
        }
      })

      wrapper.addEventListener('mouseenter', () => {
        const id = wrapper.dataset.markerId ?? ''
        const m = markerLookup.get(id)

        if (m) {
          callbacksRef.current.onMarkerHover?.(m)
        }
      })

      wrapper.addEventListener('mouseleave', () => {
        callbacksRef.current.onMarkerHover?.(null)
      })

      return wrapper
    },
    [config.markerScale, markerLookup, globeRef],
  )

  return (
    <Globe
      ref={globeRef}
      globeImageUrl={EARTH_DARK_URL}
      backgroundImageUrl=""
      backgroundColor="rgba(0,0,0,0)"
      showAtmosphere
      atmosphereColor={ATMOSPHERE_COLOR}
      atmosphereAltitude={0.18}
      htmlElementsData={markers}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude={0.01}
      htmlElement={handleHtmlElement}
      arcsData={arcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcLabel="label"
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={1500}
      arcStroke={0.5}
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringColor="color"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      animateIn={false}
    />
  )
}
