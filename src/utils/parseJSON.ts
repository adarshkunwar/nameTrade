export const parseJSON = <T>(value: string | null): T | null => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to parse stored JSON value:', error)
    return null
  }
}
