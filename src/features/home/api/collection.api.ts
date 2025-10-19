import axios from 'axios'
import type { CollectionItemsListResponse, CollectionItemsListVariables } from '../types/query'
import { COLLECTION_ITEMS_ENDPOINT, COLLECTION_ITEMS_LIST_QUERY } from '../constant/query.const'

export const COLLECTION_API = {
  fetchCollectionItems: async (
    variables: CollectionItemsListVariables
  ): Promise<CollectionItemsListResponse['collectionItems']> => {
    try {
      const response = await axios.post(
        COLLECTION_ITEMS_ENDPOINT,
        {
          query: COLLECTION_ITEMS_LIST_QUERY,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )

      const payload: { data?: CollectionItemsListResponse; errors?: { message?: string }[] } = response.data

      if (payload.errors?.length) {
        const [firstError] = payload.errors
        throw new Error(firstError?.message ?? 'Unknown GraphQL error')
      }

      if (!payload.data?.collectionItems) {
        throw new Error('Malformed response from collection items query')
      }

      return payload.data.collectionItems
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorText = error.response?.data || error.message
        throw new Error(`Failed to fetch collection items: ${error.response?.status || 'Unknown'} ${errorText}`)
      }
      throw error
    }
  },
}
