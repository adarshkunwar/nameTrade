export const shorten = (value: string) => {
  if (!value || value === '—') return value ?? '—'

  if (value.length > 20) {
    const prefixLength = 10
    const suffixLength = 20 - prefixLength - 3
    return `${value.slice(0, prefixLength)}...${value.slice(-suffixLength)}`
  }

  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
}
