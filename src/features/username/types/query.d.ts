export type UsernameActivityIdentifier = {
  chain: string
  contractAddress: string
  tokenId: string
}

export type UsernameActivityFilter = {
  activityTypes?: string[] | null
}

export type UsernameActivityVariables = {
  identifier: UsernameActivityIdentifier
  cursor?: string | null
  filter?: UsernameActivityFilter | null
  limit: number
}

export type UsernameActivityItem = {
  id: string
  item: {
    name: string | null
    tokenId: string
    contractAddress: string
  } | null
}

export type UsernameActivityResponse = {
  itemActivity: {
    items: UsernameActivityItem[]
    nextPageCursor: string | null
  } | null
}
