export type CollectionItemsFilterInput = {
  query?: string | null
}

export type CollectionItemsListVariables = {
  cursor?: string | null
  sort: {
    by: 'PRICE' | 'LAST_SALE' | 'CREATED_DATE'
    direction: 'ASC' | 'DESC'
  }
  filter?: CollectionItemsFilterInput | null
  collectionSlug: string
  limit?: number
  address?: string | null
}

export type CollectionItemMarketplace = {
  identifier: string | null
}

export type CollectionItemPriceToken = {
  unit: string | null
}

export type CollectionItemPrice = {
  usd?: number | null
  token?: CollectionItemPriceToken | null
}

export type CollectionItemBestListing = {
  pricePerItem: {
    token: CollectionItemPriceToken | null
  } | null
  marketplace: CollectionItemMarketplace | null
}

export type CollectionItemBestOffer = {
  pricePerItem: CollectionItemPrice | null
}

export type CollectionItemOwner = {
  address: string | null
}

export type CollectionItemRarity = {
  rank: number | null
}

export interface CollectionItem {
  id: string
  name: string | null
  tokenId: string
  contractAddress: string
  lastSaleAt: string | null
  lastTransferAt: string | null
  bestListing: CollectionItemBestListing | null
  bestOffer: CollectionItemBestOffer | null
  rarity: CollectionItemRarity | null
  createdAt: string
  owner: CollectionItemOwner | null
  lastSale: {
    native: {
      unit: string | null
    } | null
  } | null
  ownership: Array<{
    id: string
    quantity: string
  }> | null
  enforcement: {
    isDelisted: boolean | null
    isCompromised: boolean | null
  } | null
}

export interface CollectionItemsListResponse {
  collectionItems: {
    items: CollectionItem[]
    nextPageCursor: string | null
  }
}
