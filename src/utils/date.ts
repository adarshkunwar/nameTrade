export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const formatRelativeTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (!Number.isFinite(diffInSeconds)) {
    return '—'
  }

  if (diffInSeconds < 0) {
    return '—'
  }

  const units = [
    { limit: 60, divisor: 1, suffix: 's' },
    { limit: 3600, divisor: 60, suffix: 'm' },
    { limit: 86400, divisor: 3600, suffix: 'hr' },
    { limit: 604800, divisor: 86400, suffix: 'd' },
    { limit: 2592000, divisor: 604800, suffix: 'wk' },
    { limit: 31536000, divisor: 2592000, suffix: 'mo' },
    { limit: Infinity, divisor: 31536000, suffix: 'yr' },
  ] as const

  const absoluteDiff = Math.max(diffInSeconds, 1)

  for (const unit of units) {
    if (absoluteDiff < unit.limit) {
      const valueForUnit = Math.max(1, Math.floor(absoluteDiff / unit.divisor))
      return `${valueForUnit}${unit.suffix} ago`
    }
  }

  return '—'
}
