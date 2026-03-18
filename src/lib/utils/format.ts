const numberFormatter = new Intl.NumberFormat('en-US')

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(value: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatPercent(value: number, precision = 1): string {
  return `${(value * 100).toFixed(precision)}%`
}

export function formatCount(value: number): string {
  return numberFormatter.format(value)
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)

  return `${minutes}m ${remainingSeconds}s`
}
