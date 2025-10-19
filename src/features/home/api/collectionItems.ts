const COLLECTION_ITEMS_ENDPOINT = 'https://gql.opensea.io/graphql'

export const COLLECTION_ITEMS_LIST_QUERY = `
  query CollectionItemsListQuery(
    $cursor: String
    $sort: CollectionItemsSort!
    $filter: CollectionItemsFilter
    $collectionSlug: String!
    $limit: Int
    $address: Address
  ) {
    collectionItems(
      collectionSlug: $collectionSlug
      cursor: $cursor
      sort: $sort
      filter: $filter
      limit: $limit
    ) {
      items {
        id
        name
        tokenId
        contractAddress
        lastSaleAt
        lastTransferAt
        bestListing {
          pricePerItem {
            token {
              unit
            }
          }
          marketplace {
            identifier
          }
        }
        bestOffer {
          pricePerItem {
            usd
            token {
              unit
            }
          }
        }
        rarity {
          rank
        }
        createdAt
        __typename
        owner {
          address
          __typename
        }
        lastSale {
          native {
            unit
          }
        }
        ownership(address: $address) {
          id
          quantity
        }
        enforcement {
          isDelisted
          isCompromised
        }
      }
      nextPageCursor
  }
}
`

export interface CollectionItemsFilterInput {
  query?: string | null
}

export interface CollectionItemsListVariables {
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

export interface CollectionItemMarketplace {
  identifier: string | null
}

export interface CollectionItemPriceToken {
  unit: string | null
}

export interface CollectionItemPrice {
  usd?: number | null
  token?: CollectionItemPriceToken | null
}

export interface CollectionItemBestListing {
  pricePerItem: {
    token: CollectionItemPriceToken | null
  } | null
  marketplace: CollectionItemMarketplace | null
}

export interface CollectionItemBestOffer {
  pricePerItem: CollectionItemPrice | null
}

export interface CollectionItemOwner {
  address: string | null
}

export interface CollectionItemRarity {
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

export const fetchCollectionItems = async (
  variables: CollectionItemsListVariables
): Promise<CollectionItemsListResponse['collectionItems']> => {
  const response = await fetch(COLLECTION_ITEMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: COLLECTION_ITEMS_LIST_QUERY,
      variables,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch collection items: ${response.status} ${errorText}`)
  }

  const payload: { data?: CollectionItemsListResponse; errors?: { message?: string }[] } =
    await response.json()

  if (payload.errors?.length) {
    const [firstError] = payload.errors
    throw new Error(firstError?.message ?? 'Unknown GraphQL error')
  }

  if (!payload.data?.collectionItems) {
    throw new Error('Malformed response from collection items query')
  }

  return payload.data.collectionItems
}
