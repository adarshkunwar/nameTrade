export const USERNAME_ACTIVITY_ENDPOINT =
  import.meta.env.VITE_COLLECTION_ITEMS_ENDPOINT || 'https://gql.opensea.io/graphql'

export const USERNAME_ACTIVITY_QUERY = `
  query UsernameActivityQuery(
    $identifier: ItemIdentifierInput!
    $cursor: String
    $filter: ItemActivityFilterInput
    $limit: Int!
  ) {
    itemActivity(identifier: $identifier, cursor: $cursor, filter: $filter, limit: $limit) {
      items {
        id
        item {
          name
          tokenId
          contractAddress
        }
      }
      nextPageCursor
    }
  }
`
