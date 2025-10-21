export type ProfileItemsFilter = {
  collectionSlugs?: string[] | null
}

export type ProfileItemsSort = {
  by: 'RECEIVED_DATE'
  direction: 'ASC' | 'DESC'
}

export type ProfileItemsListVariables = {
  address: string
  limit?: number
  cursor?: string | null
  sort: ProfileItemsSort
  filter?: ProfileItemsFilter | null
}

export type ProfileItemOwnership =
  | {
      id: string
      quantity?: string | null
      isHidden?: boolean | null
    }
  | null

export type ProfileItemOwnershipField = ProfileItemOwnership | ProfileItemOwnership[] | null

export interface ProfileItem {
  id: string
  name: string | null
  tokenId: string
  contractAddress: string
  collection: {
    slug: string | null
    name?: string | null
  } | null
  lastTransferAt: string | null
  ownership: ProfileItemOwnershipField
}

export interface ProfileItemsListResponse {
  profileItems: {
    nextPageCursor: string | null
    items: ProfileItem[]
  }
}
