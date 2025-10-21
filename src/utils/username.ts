export const ellipsisAtMiddle = (value: string, startLength: number, endLength: number) => {
  if (!value || value === '—') return value ?? '—'

  if (value.length > 20) {
    const prefixLength = startLength
    const suffixLength = endLength
    return `${value.slice(0, prefixLength)}${suffixLength > 0 ? '...' : ''}${value.slice(-suffixLength)}`
  }

  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
}

export const ellipsiAtEnd = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const walletAddress = (string: string) => {
  return ellipsisAtMiddle(string, 6, 4)
}
