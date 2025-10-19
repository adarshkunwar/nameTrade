export const shorten = (value: string) => {
  if (!value || value === '—') return value ?? '—'
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
}
