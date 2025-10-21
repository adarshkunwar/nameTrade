import { COLLECTION_ITEMS_ENDPOINT, COLLECTION_ITEMS_LIST_QUERY } from '../constant/query.const'
import type { CollectionItemsListVariables, CollectionItemsListResponse } from '../types/query'

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

  const payload: { data?: CollectionItemsListResponse; errors?: { message?: string }[] } = await response.json()

  if (payload.errors?.length) {
    const [firstError] = payload.errors
    throw new Error(firstError?.message ?? 'Unknown GraphQL error')
  }

  if (!payload.data?.collectionItems) {
    throw new Error('Malformed response from collection items query')
  }

  return payload.data.collectionItems
}
