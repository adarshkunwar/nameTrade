export const COLLECTION_ITEMS_ENDPOINT =
  import.meta.env.VITE_COLLECTION_ITEMS_ENDPOINT || 'https://gql.opensea.io/graphql'

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
