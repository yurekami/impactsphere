export function hexToRgba(hex: string, alpha = 1): string {
  const sanitized = hex.replace('#', '')

  if (sanitized.length !== 6) {
    return `rgb(99 102 241 / ${alpha})`
  }

  const r = Number.parseInt(sanitized.slice(0, 2), 16)
  const g = Number.parseInt(sanitized.slice(2, 4), 16)
  const b = Number.parseInt(sanitized.slice(4, 6), 16)

  return `rgb(${r} ${g} ${b} / ${alpha})`
}

export function scoreToColor(score: number): string {
  if (score >= 0.8) {
    return '#10b981'
  }

  if (score >= 0.5) {
    return '#f59e0b'
  }

  return '#ef4444'
}

export function withOpacity(cssColor: string, alpha: number): string {
  if (cssColor.startsWith('#')) {
    return hexToRgba(cssColor, alpha)
  }

  return cssColor.replace('rgb(', 'rgb(').replace(')', ` / ${alpha})`)
}
